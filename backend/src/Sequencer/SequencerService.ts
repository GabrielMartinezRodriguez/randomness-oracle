import { IWalletService, WalletSymbol } from "../Common/IWallet";
import {
  ITransactionRepository,
  TransactionRepositorySymbol,
} from "../Common/Repositories/ITransactionRepository";
import { CronJob } from "cron";
import { inject, injectable } from "inversify";
import crypto from "crypto";
import { Hex, keccak256 } from "viem";
import { getCurrentEvenTimestampInSeconds } from "../Common/Date";
import { Transaction } from "../Common/Transaction";
import { config } from "../config";
import { sequencerRandomOracleABI } from "./SequencerRandomOracleABI";

@injectable()
export class SequencerService {
  private sequencerCron: CronJob;

  private commitments: Map<number, string> = new Map();

  constructor(
    @inject(WalletSymbol) private wallet: IWalletService,
    @inject(TransactionRepositorySymbol)
    private transactionRepository: ITransactionRepository
  ) {
    this.sequencerCron = new CronJob(
      "*/2 * * * * *",
      this.handleSequencerCron.bind(this)
    );
  }

  async initialize() {
    this.sequencerCron.start();
  }

  async handleSequencerCron() {
    const currentTimestamp = getCurrentEvenTimestampInSeconds();

    const value = this.generateRandomBytes32();

    const hash = this.calculateKeccak(value);

    const targetingTimestamp =
      currentTimestamp + config.SEQUENCER_ORACLE_PRECOMMIT_DELAY * 2;

    const transaction = Transaction.create(
      {
        address: config.SEQUENCER_ORACLE_ADDRESS,
        abi: sequencerRandomOracleABI,
        functionName: "postCommitment",
        args: [targetingTimestamp, hash],
      },
      currentTimestamp + config.SEQUENCER_ORACLE_PRECOMMIT_DELAY
    );

    console.log("Posting Commitment", {
      targetingTimestamp,
      value,
      commitment: hash,
      deadline: currentTimestamp + config.SEQUENCER_ORACLE_PRECOMMIT_DELAY,
    });

    await this.transactionRepository.save(transaction);

    await this.wallet.sendTransaction(transaction);

    this.commitments.set(targetingTimestamp, value);

    const revealTimestamp = currentTimestamp + 4;

    const revealValue = this.commitments.get(revealTimestamp);

    if (!revealValue) {
      return;
    }

    const revealTransaction = Transaction.create(
      {
        address: config.SEQUENCER_ORACLE_ADDRESS,
        abi: sequencerRandomOracleABI,
        functionName: "revealValue",
        args: [revealTimestamp, revealValue],
      },
      revealTimestamp + config.SEQUENCER_ORACLE_TIMEOUT
    );

    console.log("Reveal Sequencer Randomness", {
      timestamp: revealTimestamp,
      revealValue,
      deadline: revealTimestamp + config.SEQUENCER_ORACLE_TIMEOUT,
    });

    await this.transactionRepository.save(revealTransaction);

    await this.wallet.sendTransaction(revealTransaction);
  }

  generateRandomBytes32(): Hex {
    const randomBytes = crypto.randomBytes(32);

    const hexString = randomBytes.toString("hex");

    return ("0x" + hexString) as Hex;
  }

  calculateKeccak(input: Hex): Hex {
    return keccak256(input);
  }
}

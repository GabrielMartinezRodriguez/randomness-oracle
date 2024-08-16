import { inject, injectable } from "inversify";
import { IWalletService, WalletSymbol } from "../Common/IWallet";
import { config } from "../config";
import { chainInfoSchema, drandRoundSchema } from "./schemas";
import { CronJob } from "cron";
import { drandOracleABI } from "./DrandOracleABI";
import { Transaction } from "../Common/Transaction";
import {
  ITransactionRepository,
  TransactionRepositorySymbol,
} from "../Common/Repositories/ITransactionRepository";

@injectable()
export class DrandService {
  private latestRound!: number;
  private initialTimestamp!: number;
  private newDrandCron: CronJob;

  constructor(
    @inject(WalletSymbol) private wallet: IWalletService,
    @inject(TransactionRepositorySymbol)
    private transactionRepository: ITransactionRepository
  ) {
    this.newDrandCron = new CronJob(
      "*/3 * * * * *",
      this.getDrandRound.bind(this)
    );
  }

  async initialize(): Promise<void> {
    const latestDrand = await this.getLastDrand();
    const chainInfo = await this.getChainInfo();

    this.latestRound = latestDrand.round;
    this.initialTimestamp = chainInfo.genesis_time;

    this.newDrandCron.start();
  }

  async getChainInfo() {
    try {
      const response = await fetch(config.DRAND_URL + "/info");

      if (!response.ok) {
        throw new Error("Error fetching chain info");
      }

      const data = await response.json();

      const parsedResult = chainInfoSchema.safeParse(data);

      if (!parsedResult.success) {
        throw new Error("Error parsing chain info");
      }

      const chainInfo = parsedResult.data;

      return chainInfo;
    } catch (error: unknown) {
      throw new Error("Error fetching chain info");
    }
  }

  async getLastDrand() {
    try {
      const response = await fetch(config.DRAND_URL + "/public/latest");

      if (!response.ok) {
        throw new Error("Error fetching drand");
      }

      const data = await response.json();

      const parsedResult = drandRoundSchema.safeParse(data);

      if (!parsedResult.success) {
        throw new Error("Error parsing drand");
      }

      const latestDrand = parsedResult.data;

      return latestDrand;
    } catch (error: unknown) {
      throw new Error("Error fetching drand");
    }
  }

  async getDrandRound() {
    try {
      const ressponse = await fetch(
        config.DRAND_URL + "/public/" + this.latestRound
      );

      if (!ressponse.ok) {
        throw new Error("Error fetching drand round");
      }

      const data = await ressponse.json();

      const parsedResult = drandRoundSchema.safeParse(data);

      if (!parsedResult.success) {
        throw new Error("Error parsing drand");
      }

      const latestDrand = parsedResult.data;

      this.latestRound = this.latestRound + 1;

      const transaction = Transaction.create(
        {
          address: config.DRAND_ORACLE_ADDRESS,
          abi: drandOracleABI,
          functionName: "addDrandValue",
          args: [latestDrand.round, latestDrand.randomness],
        },
        this.initialTimestamp + latestDrand.round * 3 + 10
      );

      console.log("Posting drand value:", {
        round: latestDrand.round,
        timestamp: this.initialTimestamp + latestDrand.round * 3,
        randomness: latestDrand.randomness,
        deadline: this.initialTimestamp + latestDrand.round * 3 + 10,
      });

      await this.transactionRepository.save(transaction);

      await this.wallet.sendTransaction(transaction);
    } catch (error: unknown) {}
  }
}

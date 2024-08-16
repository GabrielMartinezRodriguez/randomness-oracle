import { inject, injectable } from "inversify";
import { IWalletService } from "../Common/IWallet";
import { anvilChain } from "../Common/chains/Anvil";
import { publicClient, walletClient } from "../Common/chains/config";
import { Transaction } from "../Common/Transaction";
import { getCurrentEvenTimestampInSeconds } from "../Common/Date";
import {
  TransactionRepository,
  TransactionRepositorySymbol,
} from "../Common/Repositories/ITransactionRepository";

@injectable()
export class WalletService implements IWalletService {
  private nonce!: number;

  constructor(
    @inject(TransactionRepositorySymbol)
    private transactionRepository: TransactionRepository
  ) {}

  async initialize(): Promise<void> {
    const nonce = await publicClient.getTransactionCount({
      address: walletClient.account.address,
    });

    this.nonce = nonce;
  }

  async sendTransaction(transaction: Transaction): Promise<void> {
    const { address, abi, functionName, args } = transaction.getParams();

    const transactionNonce = this.nonce;
    this.nonce = this.nonce + 1;

    const transactionHash = await walletClient
      .writeContract({
        chain: anvilChain,
        account: walletClient.account,
        address,
        abi,
        args,
        functionName,
        nonce: transactionNonce,
      })
      .catch((error) => {
        console.error("Error sending transaction", error);
        throw error;
      });

    transaction.addTransactionSent({
      sentAt: getCurrentEvenTimestampInSeconds(),
      transactionHash,
      nonce: transactionNonce,
    });

    await this.transactionRepository.update(transaction);
  }

  async retryTransaction(transaction: Transaction): Promise<void> {
    const transactionSent = transaction.getCurrentTransactionSent();

    if (!transactionSent) {
      throw new Error("Transaction not sent yet");
    }

    await walletClient.writeContract({
      chain: anvilChain,
      account: walletClient.account,
      address: transaction.getParams().address,
      abi: transaction.getParams().abi,
      args: transaction.getParams().args,
      functionName: transaction.getParams().functionName,
      nonce: transactionSent.nonce,
    });

    transaction.markAsRetryLastSent();

    await this.transactionRepository.update(transaction);
  }
}

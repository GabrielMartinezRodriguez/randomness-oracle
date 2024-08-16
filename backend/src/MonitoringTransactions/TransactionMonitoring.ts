import { IWalletService } from "Common/IWallet";
import { publicClient } from "../Common/chains/Anvil";
import { ITransactionMonitoring } from "Common/ITransactionMonitoring";
import { CronJob } from "cron";
import { inject, injectable } from "inversify";
import {
  TransactionNotFoundError,
  TransactionReceiptNotFoundError,
} from "viem";
import {
  ITransactionRepository,
  TransactionRepositorySymbol,
} from "../Common/Repositories/ITransactionRepository";
import { Transaction } from "../Common/Transaction";

@injectable()
export class TransactionMonitoringService implements ITransactionMonitoring {
  private monitoringCron: CronJob;
  private walletService!: IWalletService;

  constructor(
    @inject(TransactionRepositorySymbol)
    private transactionRepository: ITransactionRepository
  ) {
    this.monitoringCron = new CronJob(
      "*/2 * * * * *",
      this.checkTransactions.bind(this)
    );
  }

  async initialize(walletService: IWalletService) {
    this.monitoringCron.start();
    this.walletService = walletService;
  }

  private async checkTransactions() {
    const pendingTransactions =
      await this.transactionRepository.getAllPending();

    const receiptPromises = pendingTransactions.map(async (t) => {
      const transactionHash = t.getCurrentHash();

      if (!transactionHash) {
        return {
          transaction: t,
          status: "not-sent-yet",
          inMempool: false,
        };
      }
      try {
        const transactionResult = await publicClient.getTransaction({
          hash: transactionHash,
        });

        const receipt = await publicClient.getTransactionReceipt({
          hash: transactionHash,
        });

        if (receipt.status === "success") {
          return {
            transaction: t,
            status: "success",
            inMempool: true,
          };
        } else {
          const gasUsed = receipt.gasUsed;
          const gasLimit = transactionResult.gas;
          const isGasRevert = gasUsed >= gasLimit;

          return {
            transaction: t,
            status: isGasRevert ? "reverted-gas" : "reverted-other",
            inMempool: true,
          };
        }
      } catch (error) {
        if (error instanceof TransactionNotFoundError) {
          return {
            transaction: t,
            status: "not-found",
            inMempool: false,
          };
        }

        if (error instanceof TransactionReceiptNotFoundError) {
          return {
            transaction: t,
            status: "pending",
            inMempool: true,
          };
        }

        return {
          transaction: t,
          status: "error",
          inMempool: false,
        };
      }
    });

    const results = await Promise.all(receiptPromises);

    const successfulTransactions = results
      .filter((r) => r.status === "success")
      .map((r) => r.transaction);
    const keepPending = results
      .filter((r) => r.status === "pending")
      .map((r) => r.transaction);
    const notInMempoolTransactions = results
      .filter((r) => r.status === "not-found")
      .map((r) => r.transaction);
    const revertedGasTransactions = results
      .filter((r) => r.status === "reverted-gas")
      .map((r) => r.transaction);
    const revertedOtherTransactions = results
      .filter((r) => r.status === "reverted-other")
      .map((r) => r.transaction);

    successfulTransactions.forEach(this.handleSuccessfulTransaction.bind(this));
    revertedOtherTransactions.forEach(
      this.handleRevertedOtherTransaction.bind(this)
    );
    revertedGasTransactions.forEach(
      this.handleRevertedGasTransaction.bind(this)
    );
    notInMempoolTransactions.forEach(this.handleNotFoundTransaction.bind(this));
    keepPending.forEach(this.handlePendingTransaction.bind(this));
  }

  private async handleSuccessfulTransaction(
    transaction: Transaction
  ): Promise<void> {
    transaction.markAsSuccess();
    await this.transactionRepository.update(transaction);
  }

  private async handleNotFoundTransaction(
    transaction: Transaction
  ): Promise<void> {
    await this.walletService.retryTransaction(transaction);
  }

  private async handleRevertedOtherTransaction(
    transaction: Transaction
  ): Promise<void> {
    transaction.markAsFailed();

    await this.transactionRepository.update(transaction);
  }

  private async handleRevertedGasTransaction(
    transaction: Transaction
  ): Promise<void> {
    if (transaction.isExpired()) {
      return;
    }

    await this.walletService.sendTransaction(transaction);
  }

  private async handlePendingTransaction(
    transaction: Transaction
  ): Promise<void> {
    if (transaction.isTakingTooLong()) {
      await this.walletService.retryTransaction(transaction);
    }

    await this.transactionRepository.update(transaction);
  }
}

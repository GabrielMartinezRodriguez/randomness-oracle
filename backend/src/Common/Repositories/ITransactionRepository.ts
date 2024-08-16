import { injectable } from "inversify";
import { Transaction, TransactionStatus } from "../../Common/Transaction";

export const TransactionRepositorySymbol = Symbol("TransactionRepository");

export interface ITransactionRepository {
  getAllPending(): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
}

@injectable()
export class TransactionRepository implements ITransactionRepository {
  transactions: Transaction[] = [];

  async getAllPending(): Promise<Transaction[]> {
    return this.transactions.filter((transaction) => transaction.isPending());
  }

  async save(transaction: Transaction): Promise<void> {
    this.transactions.push(transaction);
  }

  async update(transaction: Transaction): Promise<void> {
    const index = this.transactions.findIndex(
      (t) => t.getId() === transaction.getId()
    );

    if (index === -1) {
      throw new Error("Transaction not found");
    }

    this.transactions[index] = transaction;
  }
}

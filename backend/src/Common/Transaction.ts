import { Abi } from "abitype";
import { EthAddress } from "./EthAddress";

import { v4 } from "uuid";
import { ContractFunctionArgs, ContractFunctionName } from "viem";
import { getCurrentEvenTimestampInSeconds } from "./Date";
import { config } from "../config";

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface TransactionParams {
  address: EthAddress;
  abi: Abi;
  functionName: string;
  args?: ContractFunctionArgs<
    Abi | readonly unknown[],
    "pure" | "view",
    ContractFunctionName
  >;
}

export interface TransactionSent {
  transactionHash: EthAddress;
  nonce: number;
  sentAt: number;
}

export class Transaction {
  private id: string;
  private status: TransactionStatus;
  private deadline: number;
  private params: TransactionParams;
  private transactionsSent: TransactionSent[];

  constructor(
    id: string,
    status: TransactionStatus,
    deadline: number,
    params: TransactionParams,
    transactionsSent: TransactionSent[]
  ) {
    this.id = id;
    this.status = status;
    this.deadline = deadline;
    this.params = params;
    this.transactionsSent = transactionsSent;
  }

  static create(params: TransactionParams, deadline: number): Transaction {
    return new Transaction(
      v4(),
      TransactionStatus.PENDING,
      deadline,
      params,
      []
    );
  }

  public addTransactionSent(transactionSent: TransactionSent): void {
    this.transactionsSent.push(transactionSent);
  }

  public markAsSuccess(): void {
    this.status = TransactionStatus.SUCCESS;
  }

  public isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  public isExpired(): boolean {
    return getCurrentEvenTimestampInSeconds() > this.deadline;
  }

  public getParams(): TransactionParams {
    return this.params;
  }

  public getId(): string {
    return this.id;
  }

  public getCurrentTransactionSent(): TransactionSent | undefined {
    return this.transactionsSent[this.transactionsSent.length - 1];
  }

  public getCurrentHash(): EthAddress | undefined {
    return this.transactionsSent[this.transactionsSent.length - 1]
      ?.transactionHash;
  }

  public markAsRetryLastSent(): void {
    const lastSent = this.transactionsSent[this.transactionsSent.length - 1];

    if (!lastSent) {
      throw new Error("No transaction sent");
    }

    this.transactionsSent.push({
      ...lastSent,
      sentAt: getCurrentEvenTimestampInSeconds(),
    });
  }

  public isTakingTooLong(): boolean {
    const lastSent = this.transactionsSent[this.transactionsSent.length - 1];

    if (!lastSent) {
      return false;
    }

    return (
      getCurrentEvenTimestampInSeconds() - lastSent.sentAt >
      config.INCLUSION_MAX_DELAY_TO_RECALCULATE_GAS
    );
  }

  public markAsFailed(): void {
    this.status = TransactionStatus.FAILED;
  }
}

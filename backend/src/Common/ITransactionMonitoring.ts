import { symbol } from "zod";
import { EthAddress } from "./EthAddress";
import { ISendTransactionParams, IWalletService } from "./IWallet";

export const TransactionMonitoringSymbol = Symbol(
  "TransactionMonitoringSymbol"
);

export interface TransactionPending {
  id: string;
  transactionHash: EthAddress;
  sendTransactionParams: ISendTransactionParams;
  nonce: number;
  sentAt: number;
  deadline: number;
  cancelTransactionHash?: EthAddress;
}

export interface ITransactionMonitoring {
  initialize(walletService: IWalletService): Promise<void>;
}

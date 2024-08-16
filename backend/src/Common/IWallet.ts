import { EthAddress } from "./EthAddress";
import { Abi } from "abitype";
import { ContractFunctionArgs, ContractFunctionName } from "viem";
import { Transaction } from "./Transaction";

export const WalletSymbol = Symbol("Wallet");

export interface ISendTransactionParams {
  address: EthAddress;
  abi: Abi;
  functionName: string;
  args?: ContractFunctionArgs<
    Abi | readonly unknown[],
    "pure" | "view",
    ContractFunctionName
  >;
}

export interface IWalletService {
  initialize(): Promise<void>;
  sendTransaction(transaction: Transaction): Promise<void>;
  retryTransaction(transaction: Transaction): Promise<void>;
}

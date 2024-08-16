import { EthAddress } from "./EthAddress";

export const env = (variable: string) => {
  if (process.env[variable]) return process.env[variable]!;
  throw new Error(`Environment variable ${variable} is not defined`);
};

export const envAddress = (variable: string) => {
  const value = env(variable);
  if (!/^0x[0-9a-fA-F]{40}$/.test(value))
    throw new Error(
      `Environment variable ${variable} is not an Ethereum address`
    );
  return value as EthAddress;
};

import { EthAddress } from "./EthAddress";

export const env = (variable: string) => {
  if (process.env[variable]) return process.env[variable]!;
  throw new Error(`Environment variable ${variable} is not defined`);
};

export const envInt = (variable: string) => {
  const value = env(variable);
  const parsed = parseInt(value);
  if (isNaN(parsed))
    throw new Error(`Environment variable ${variable} is not an integer`);
  return parsed;
};

export const envAddress = (variable: string) => {
  const value = env(variable);
  if (!/^0x[0-9a-fA-F]{40}$/.test(value))
    throw new Error(
      `Environment variable ${variable} is not an Ethereum address`
    );
  return value as EthAddress;
};

export const envHex = (variable: string) => {
  const value = env(variable);
  if (!/^0x[0-9a-fA-F]*$/.test(value))
    throw new Error(`Environment variable ${variable} is not a hex string`);
  return value as `0x${string}`;
};

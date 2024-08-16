import { createWalletClient, custom, http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "../../config";
import { anvilChain } from "./Anvil";

export const publicClient = createPublicClient({
  chain: anvilChain,
  transport: http(anvilChain.rpcUrls.default.http[0], {
    retryCount: 3,
  }),
});

export const walletClient = createWalletClient({
  chain: anvilChain,
  transport: http(anvilChain.rpcUrls.default.http[0], {
    retryCount: 3,
  }),
  account: privateKeyToAccount(config.WALLET_PK),
});

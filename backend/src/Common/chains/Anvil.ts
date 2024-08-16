import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
} from "viem";
import { config } from "../../config";
import { privateKeyToAccount } from "viem/accounts";

export const anvilChain = defineChain({
  id: 31337,
  name: "Anvil (Foundry)",
  network: "anvil",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://localhost:8545"],
    },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: anvilChain,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: anvilChain,
  transport: http(),
  account: privateKeyToAccount(config.WALLET_PK),
});

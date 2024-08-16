import { createPublicClient, defineChain, http } from "viem";

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

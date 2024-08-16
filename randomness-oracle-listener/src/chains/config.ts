import { http, createPublicClient } from "viem";
import { anvilChain } from "./Anvil";

export const publicClient = createPublicClient({
  chain: anvilChain,
  transport: http(),
  pollingInterval: 1000,
});

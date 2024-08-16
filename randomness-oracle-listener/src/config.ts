import { envAddress } from "./env";

export const config = {
  DRAND_ORACLE_ADDRESS: envAddress("DRAND_ORACLE_ADDRESS"),
  SEQUENCER_ORACLE_ADDRESS: envAddress("SEQUENCER_ORACLE_ADDRESS"),
  RANDOMNESS_ORACLE_ADDRESS: envAddress("RANDOMNESS_ORACLE_ADDRESS"),
};

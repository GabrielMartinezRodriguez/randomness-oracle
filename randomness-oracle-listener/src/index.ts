import "dotenv/config";
import { sequencerRandomOracleABI } from "./ABIs/SequencerRandomOracleABI";
import { drandOracleABI } from "./ABIs/DrandOracleABI";
import { publicClient } from "./chains/config";
import { randomnessOracleABI } from "./ABIs/RandomnessOracleABI";
import { config } from "./config";

(async () => {
  console.log("Starting block monitoring...");

  publicClient.watchBlocks({
    onBlock: async (block) => {
      console.log("\n--- New Block Detected ---");
      console.log(`Block timestamp: ${block.timestamp}`);

      try {
        const currentDrand = await publicClient.readContract({
          address: config.DRAND_ORACLE_ADDRESS,
          abi: drandOracleABI,
          functionName: "unsafeGetDrandValue",
          args: [block.timestamp],
        });
        console.log(`drand(T): ${currentDrand}`);

        const currentSequencer = await publicClient.readContract({
          address: config.SEQUENCER_ORACLE_ADDRESS,
          abi: sequencerRandomOracleABI,
          functionName: "unsafeGetSequencerRandom",
          args: [block.timestamp],
        });
        console.log(`sequencerRandom(T): ${currentSequencer}`);

        const currentRandomness = await publicClient.readContract({
          address: config.RANDOMNESS_ORACLE_ADDRESS,
          abi: randomnessOracleABI,
          functionName: "unsafeGetRandomnessOracle",
          args: [block.timestamp],
        });
        console.log(`randomness(T): ${currentRandomness}`);

        const drandWithDelay = await publicClient.readContract({
          address: config.DRAND_ORACLE_ADDRESS,
          abi: drandOracleABI,
          functionName: "unsafeGetDrandValue",
          args: [block.timestamp - BigInt(9)],
        });
        console.log(`drand(T - DELAY): ${drandWithDelay}`);

        console.log("--- End of Block ---\n");
      } catch (error) {
        console.error("Error processing block:", error);
      }
    },
  });

  console.log("Block monitoring started. Waiting for new blocks...");
})();

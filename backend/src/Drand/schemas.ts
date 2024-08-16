import z from "zod";

export const drandRoundSchema = z.object({
  round: z.number(),
  signature: z.string(),
  randomness: z
    .string()
    .length(64)
    .refine(
      (randomness) => {
        return /^[0-9a-fA-F]+$/.test(randomness);
      },
      { message: "Randomness must be a hex string" }
    )
    .transform((randomness) => `0x${randomness}` as `0x${string}`),
});

export const chainInfoSchema = z.object({
  genesis_time: z.number(),
});

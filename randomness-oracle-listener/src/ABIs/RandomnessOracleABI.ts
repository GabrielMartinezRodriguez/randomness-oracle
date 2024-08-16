export const randomnessOracleABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_sequencerRandomOracle",
        type: "address",
        internalType: "address",
      },
      { name: "_drandOracle", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "DELAY",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "drandOracle",
    inputs: [],
    outputs: [
      { name: "", type: "address", internalType: "contract DrandOracle" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRandomnessOracle",
    inputs: [{ name: "timestamp", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sequencerRandomOracle",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract SequencerRandomOracle",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "unsafeGetRandomnessOracle",
    inputs: [{ name: "timestamp", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
] as const;

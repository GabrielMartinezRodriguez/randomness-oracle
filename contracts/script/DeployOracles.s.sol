// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/RandomnessOracle.sol";
import "../src/SequencerRandomOracle.sol";
import "../src/DrandOracle.sol";

contract DeployOracles is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        SequencerRandomOracle sequencerRandomOracle = new SequencerRandomOracle();

        console.log("SequencerRandomOracle deployed at:", address(sequencerRandomOracle));

        DrandOracle drandOracle = new DrandOracle();

        console.log("DrandOracle deployed at:", address(drandOracle));

        RandomnessOracle randomnessOracle = new RandomnessOracle(
            address(sequencerRandomOracle),
            address(drandOracle)
        );

        console.log("RandomnessOracle deployed at:", address(randomnessOracle));

        vm.stopBroadcast();
    }
}
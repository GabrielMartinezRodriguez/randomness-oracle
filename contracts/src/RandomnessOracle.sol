// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./SequencerRandomOracle.sol";
import "./DrandOracle.sol";

contract RandomnessOracle  {
    uint256 public constant DELAY = 9;

    SequencerRandomOracle public sequencerRandomOracle;
    DrandOracle public drandOracle;

    constructor(address _sequencerRandomOracle, address _drandOracle) {
        sequencerRandomOracle = SequencerRandomOracle(_sequencerRandomOracle);
        drandOracle = DrandOracle(_drandOracle);
    }

    function unsafeGetRandomnessOracle(uint256 timestamp) external view returns (bytes32) {
        bytes32 sequencerValue = sequencerRandomOracle.unsafeGetSequencerRandom(timestamp);
    
        if (sequencerValue == bytes32(0)) {
            return bytes32(0);
        }

        bytes32 drandValue = drandOracle.unsafeGetDrandValue(timestamp - DELAY);

        if (drandValue == bytes32(0)) {
            return bytes32(0);
        }

        return keccak256(abi.encodePacked(drandValue, sequencerValue));
    }

    function getRandomnessOracle(uint256 timestamp) external view returns (bytes32) {
        bytes32 sequencerValue = sequencerRandomOracle.getSequencerRandom(timestamp);
        bytes32 drandValue = drandOracle.getDrandValue(timestamp - DELAY);

        return keccak256(abi.encodePacked(drandValue, sequencerValue));
    }

}
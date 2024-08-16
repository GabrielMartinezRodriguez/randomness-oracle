// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract DrandOracle is Ownable {
    uint256 public constant DRAND_TIMEOUT = 10;
    uint256 public constant DRAND_QUICKNET_GENESIS_TIMESTAMP = 1692803367;
    uint256 public constant DRAND_QUICKNET_PERIOD = 3;
    
    mapping(uint256 => bytes32) private drandValues;
    
    event DrandValueAdded(uint256 indexed round, bytes32 value);

    constructor() Ownable(msg.sender) {}
    
    function addDrandValue(uint256 round, bytes32 value) external onlyOwner {
        require(block.timestamp <= round * 3 + DRAND_QUICKNET_GENESIS_TIMESTAMP + DRAND_TIMEOUT, "Backfill timeout expired");
        drandValues[round] = value;
        emit DrandValueAdded(round, value);
    }
    
    function unsafeGetDrandValue(uint256 timestamp) public view returns (bytes32) {
        uint256 _round = getRound(timestamp);
        return drandValues[_round]; 
    }
    
    function getDrandValue(uint256 timestamp) public view returns (bytes32) {
        uint256 _round = getRound(timestamp);
        bytes32 value = drandValues[_round];
        
        require(value != bytes32(0), "Drand value not available");
        return value;
    }
    
    function isDrandValueStillPossible(uint256 timestamp) public view returns (bool) {
        uint256 _round = getRound(timestamp);
        return drandValues[_round] != 0 || block.timestamp <= timestamp + DRAND_TIMEOUT;
    }

    function getRound(uint256 timestamp) public view returns (uint256) {
        return (timestamp - DRAND_QUICKNET_GENESIS_TIMESTAMP) / DRAND_QUICKNET_PERIOD;
    }
}
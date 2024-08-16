// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract SequencerRandomOracle is Ownable {
   uint256 public constant SEQUENCER_TIMEOUT = 10;
   uint256 public constant PRECOMMIT_DELAY = 10;

    struct Commitment {
        bytes32 commitment;
        bytes32 value;
    }

    mapping(uint256 => Commitment) public commitments;
    uint256 public lastRevealedTimestamp;

    event CommitmentPosted(uint256 indexed timestamp, bytes32 commitment);
    event ValueRevealed(uint256 indexed timestamp, bytes32 value);

    constructor() Ownable(msg.sender) {}

    function postCommitment(uint256 timestamp, bytes32 commitment) external onlyOwner {
        require(block.timestamp + PRECOMMIT_DELAY <= timestamp, "Commitment too late");
        require(commitments[timestamp].commitment == bytes32(0), "Commitment already exists");
        
        commitments[timestamp] = Commitment({
            commitment: commitment,
            value: bytes32(0)
        });

        emit CommitmentPosted(timestamp, commitment);
    }

    function revealValue(uint256 timestamp, bytes32 value) external onlyOwner {
        Commitment storage comm = commitments[timestamp];
        require(comm.commitment != bytes32(0), "No commitment found");
        require(comm.value == bytes32(0), "Value already revealed");
        require(timestamp > lastRevealedTimestamp, "Non-linear reveal");
        require(block.timestamp <= timestamp + SEQUENCER_TIMEOUT, "Reveal timeout exceeded");
        require(keccak256(abi.encodePacked(value)) == comm.commitment, "Invalid reveal");

        comm.value = value;
        lastRevealedTimestamp = timestamp;

        emit ValueRevealed(timestamp, value);
    }

    function unsafeGetSequencerRandom(uint256 timestamp) external view returns (bytes32) {
        Commitment storage comm = commitments[timestamp];
        return comm.value != bytes32(0) ? comm.value : bytes32(0);
    }

    function getSequencerRandom(uint256 timestamp) external view returns (bytes32) {
        Commitment storage comm = commitments[timestamp];
        require(comm.value != bytes32(0), "Value not revealed");
        return comm.value;
    }

    function isSequencerRandomStillPossible(uint256 timestamp) external view returns (bool) {
        Commitment storage comm = commitments[timestamp];

        if (comm.value == bytes32(0) && block.timestamp > timestamp + SEQUENCER_TIMEOUT) {
            return false;
        }

        if (comm.commitment != bytes32(0) && block.timestamp > timestamp - PRECOMMIT_DELAY) {
            return false;
        }

        return true;
    }

}
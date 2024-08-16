#!/bin/bash

current_timestamp=$(date +%s)

even_timestamp=$((current_timestamp + (current_timestamp % 2)))

block_time=2

echo "Launching Anvil with genesis timestamp: $even_timestamp seconds"
echo "Block interval: $block_time seconds"

anvil --timestamp $even_timestamp --block-time $block_time > anvil.log 2>&1 &

echo "Waiting for Anvil to start..."
sleep 2

echo "Changing to contracts directory"
cd contracts

echo "Funding account with 100 ether..."
cast send  0xA9a9E6e15E0fdA2B6A2bE1db551A9Af632c99960  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --value '100ether' --rpc-url http://localhost:8545

echo "Deploying contracts..."
forge script script/DeployOracles.s.sol --rpc-url http://127.0.0.1:8545 --broadcast

echo "Deployment completed"


echo "Starting backend server..."

cd ../backend

yarn
yarn build
yarn start
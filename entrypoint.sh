#!/bin/sh
set -e

npx hardhat run hardhat-scripts/withdrawDeposit.js --network haqqmainnet

exec "$@"
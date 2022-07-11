// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StableToken is ERC20("USDC Token", "USDC") {

    uint public constant TOTAL_SUPPLY = 400_000_000 * (10 ** 18);

    constructor() {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
}
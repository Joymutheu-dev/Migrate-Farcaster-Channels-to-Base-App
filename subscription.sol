// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract Subscription {
    address public owner;
    address public usdcToken; // USDC contract address
    uint256 public constant MONTHLY_FEE = 100 * 10**6; // 100 USDC (6 decimals)
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;
    mapping(address => uint256) public subscriptions;

    constructor(address _usdcToken) {
        owner = msg.sender;
        usdcToken = _usdcToken;
    }

    function subscribe() external {
        require(IERC20(usdcToken).transferFrom(msg.sender, owner, MONTHLY_FEE), "Payment failed");
        subscriptions[msg.sender] = block.timestamp + SUBSCRIPTION_DURATION;
    }

    function isSubscribed(address user) external view returns (bool) {
        return subscriptions[user] >= block.timestamp;
    }

    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        // Additional withdrawal logic if needed
    }
}
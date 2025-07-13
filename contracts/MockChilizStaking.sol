// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "./interfaces/IChilizStaking.sol";

/**
 * @title MockChilizStaking
 * @dev Mock implementation of Chiliz staking for testing purposes
 */
contract MockChilizStaking is IChilizStaking {
    mapping(address => mapping(address => uint256)) private stakedAmounts;
    mapping(address => uint256) private totalStaked;
    
    event Staked(address indexed validator, address indexed staker, uint256 amount);
    event Unstaked(address indexed validator, address indexed staker, uint256 amount);
    event Claimed(address indexed validator, address indexed staker, uint256 amount);
    
    /**
     * @dev Mock stake function - just records the stake
     */
    function stake(address validator) external payable {
        require(msg.value > 0, "Must stake some CHZ");
        stakedAmounts[validator][msg.sender] += msg.value;
        totalStaked[validator] += msg.value;
        emit Staked(validator, msg.sender, msg.value);
    }
    
    /**
     * @dev Mock unstake function - just records the unstake
     */
    function unstake(address validator, uint256 amount) external {
        require(stakedAmounts[validator][msg.sender] >= amount, "Insufficient staked amount");
        stakedAmounts[validator][msg.sender] -= amount;
        totalStaked[validator] -= amount;
        emit Unstaked(validator, msg.sender, amount);
    }
    
    /**
     * @dev Mock claim function - transfers the claimed amount to the caller
     */
    function claim(address validator) external {
        uint256 amount = stakedAmounts[validator][msg.sender];
        require(amount > 0, "Nothing to claim");
        
        stakedAmounts[validator][msg.sender] = 0;
        totalStaked[validator] -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Claimed(validator, msg.sender, amount);
    }
    
    /**
     * @dev Get staked amount for a validator and staker
     */
    function getStakedAmount(address validator, address staker) external view returns (uint256) {
        return stakedAmounts[validator][staker];
    }
    
    /**
     * @dev Get claimable rewards for a validator and staker (mock implementation)
     */
    function claimableRewards(address validator, address staker) external view returns (uint256) {
        // Mock implementation - returns 0 for now
        return 0;
    }
    
    /**
     * @dev Get total staked amount for a validator
     */
    function getTotalStaked(address validator) external view returns (uint256) {
        return totalStaked[validator];
    }
    
    /**
     * @dev Emergency function to recover stuck funds
     */
    function emergencyRecover() external {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to recover");
        
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Transfer failed");
    }
} 
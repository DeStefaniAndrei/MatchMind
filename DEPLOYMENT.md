# MatchMind Contract Deployment Guide

## Overview
This guide will help you deploy the MatchMind contract on Chiliz Chain for your football prediction dApp.

## Prerequisites
- MetaMask or another Web3 wallet
- CHZ tokens for deployment gas fees
- Chiliz Chain network configured in your wallet

## Chiliz Chain Network Configuration

### Mainnet
- **Network Name**: Chiliz Chain
- **RPC URL**: https://rpc.chiliz.com
- **Chain ID**: 88888
- **Currency Symbol**: CHZ
- **Block Explorer**: https://explorer.chiliz.com

### Testnet (Spicy)
- **Network Name**: Chiliz Spicy Testnet
- **RPC URL**: https://spicy-rpc.chiliz.com
- **Chain ID**: 88882
- **Currency Symbol**: CHZ
- **Block Explorer**: https://spicy-explorer.chiliz.com

## Required Addresses

You'll need these addresses for deployment:

### 1. CHZ Token Address
- **Mainnet**: `0x0000000000000000000000000000000000000000` (Replace with actual CHZ token address)
- **Testnet**: `0x0000000000000000000000000000000000000000` (Replace with actual CHZ token address)

### 2. Chiliz Staking Contract Address
- **Mainnet**: `0x0000000000000000000000000000000000000000` (Replace with actual staking contract)
- **Testnet**: `0x0000000000000000000000000000000000000000` (Replace with actual staking contract)

### 3. Validator Address
Choose a validator from the Chiliz Chain validator list:
- Visit: https://governance.chiliz.com/validators
- Select a validator and copy their address

### 4. Owner Address
- Your wallet address: `0x93d43c27746D76e7606C55493A757127b33D7763`

## Deployment Steps

### Step 1: Prepare Remix IDE
1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new workspace
3. Upload the `contracts/MatchMind.sol` file

### Step 2: Configure Compiler
1. Go to the "Solidity Compiler" tab
2. Set compiler version to `0.8.23`
3. Enable optimization with 200 runs
4. Compile the contract

### Step 3: Deploy Contract
1. Go to the "Deploy & Run Transactions" tab
2. Set environment to "Injected Provider - MetaMask"
3. Connect your wallet
4. Switch to Chiliz Chain network
5. Set the constructor parameters:
   - `_owner`: Your wallet address
   - `_chzToken`: CHZ token address
   - `_stakingContract`: Staking contract address
   - `_validator`: Validator address
6. Click "Deploy"

### Step 4: Verify Contract
1. Copy the deployed contract address
2. Go to the Chiliz Chain block explorer
3. Verify the contract with the source code

## Contract Functions

### Owner Functions
- `createGame()` - Creates a new match
- `startMatch(uint256 gameId)` - Starts a match
- `endMatch(uint256 gameId)` - Ends a match
- `distributeYield(uint256 gameId, address[] rankings)` - Distributes yield based on rankings

### Player Functions
- `stakeAndEnter(uint256 amount)` - Stake CHZ and enter a match
- `withdraw()` - Withdraw stake and yield after match ends

## Testing the Contract

### 1. Create a Game
```javascript
// Call from owner account
await matchMind.createGame()
```

### 2. Players Stake and Enter
```javascript
// Players must approve CHZ first
await chzToken.approve(gamePoolAddress, amount)
await gamePool.stakeAndEnter(amount)
```

### 3. Start Match
```javascript
// Call from owner account
await matchMind.startMatch(gameId)
```

### 4. End Match and Distribute Yield
```javascript
// Call from owner account
await matchMind.endMatch(gameId)
await matchMind.distributeYield(gameId, [player1, player2, player3])
```

### 5. Players Withdraw
```javascript
// Call from player account (after minimum 2 days)
await gamePool.withdraw()
```

## Important Notes

1. **Minimum Stake**: 0.01 CHZ
2. **Minimum Duration**: 2 days before withdrawal
3. **Yield Distribution**: Exponential based on rankings (1/rank²)
4. **Gas Fees**: Ensure sufficient CHZ for gas fees
5. **Validator Selection**: Choose a reliable validator with good uptime

## Security Considerations

1. **Owner Access**: Only the owner can control match lifecycle
2. **Emergency Functions**: Owner can recover stuck tokens
3. **Minimum Stakes**: Prevents spam attacks
4. **Time Locks**: Prevents immediate withdrawals

## Support

For deployment issues:
1. Check network configuration
2. Verify all addresses are correct
3. Ensure sufficient CHZ for gas fees
4. Test on testnet first

## Contract Addresses (After Deployment)

Once deployed, save these addresses:
- **MatchMind Contract**: `0x...`
- **Factory Contract**: `0x...`
- **Game Pool**: `0x...` (created per match) 
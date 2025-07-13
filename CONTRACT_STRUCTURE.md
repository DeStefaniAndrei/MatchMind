# MatchMind Contract Structure

## Overview
The MatchMind contracts have been separated into individual files for better organization, maintainability, and readability.

## File Structure

```
contracts/
├── interfaces/
│   ├── IERC20.sol          # ERC20 token interface
│   └── IChilizStaking.sol  # Chiliz Chain staking interface
├── libraries/
│   ├── SafeMath.sol        # Safe math operations
│   └── Address.sol         # Address utility functions
├── GamePool.sol            # Individual match management
├── GameFactory.sol         # Factory for creating game pools
├── MatchMind.sol           # Main contract entry point
└── MockCHZ.sol            # Mock CHZ token for testing
```

## Contract Dependencies

### MatchMind.sol
- **Imports**: `IERC20.sol`, `GameFactory.sol`
- **Purpose**: Main entry point and contract orchestrator
- **Functions**: 
  - `createGame()` - Creates new matches
  - `startMatch()` - Starts matches
  - `endMatch()` - Ends matches
  - `distributeYield()` - Distributes prizes

### GameFactory.sol
- **Imports**: `GamePool.sol`, `SafeMath.sol`
- **Purpose**: Factory pattern for creating game pools
- **Functions**:
  - `createGame()` - Deploys new GamePool contracts
  - `startMatch()` - Controls match lifecycle
  - `endMatch()` - Ends matches
  - `distributeYield()` - Distributes yield

### GamePool.sol
- **Imports**: `IERC20.sol`, `IChilizStaking.sol`, `SafeMath.sol`
- **Purpose**: Manages individual match logic
- **Functions**:
  - `stakeAndEnter()` - Players stake CHZ and enter
  - `withdraw()` - Players withdraw stakes and yield
  - `startMatch()` - Called by factory to start match
  - `endMatch()` - Called by factory to end match
  - `distributeYield()` - Distributes yield based on rankings

### Interfaces
- **IERC20.sol**: Standard ERC20 token interface
- **IChilizStaking.sol**: Chiliz Chain staking contract interface

### Libraries
- **SafeMath.sol**: Safe mathematical operations
- **Address.sol**: Address utility functions

## Deployment Order

When deploying to Remix IDE, upload files in this order:

1. **interfaces/IERC20.sol**
2. **interfaces/IChilizStaking.sol**
3. **libraries/SafeMath.sol**
4. **libraries/Address.sol**
5. **GamePool.sol**
6. **GameFactory.sol**
7. **MatchMind.sol**

## Key Features

### GamePool Contract
- **Minimum Stake**: 0.01 CHZ
- **Minimum Duration**: 2 days before withdrawal
- **Yield Distribution**: Exponential (1/rank²)
- **States**: PRE_MATCH → MATCH_ACTIVE → MATCH_ENDED → DISTRIBUTED

### GameFactory Contract
- **Factory Pattern**: Creates new GamePool contracts for each match
- **Access Control**: Only owner can create/manage games
- **Event Tracking**: Emits events for game creation

### MatchMind Contract
- **Main Entry Point**: Orchestrates the entire system
- **Factory Deployment**: Automatically deploys GameFactory
- **Emergency Functions**: Can recover stuck tokens

## Testing

The contracts are ready for testing on:
- **Chiliz Testnet (Spicy)**: For development and testing
- **Chiliz Mainnet**: For production deployment

## Security Features

1. **Access Control**: Only owner can manage matches
2. **Minimum Stakes**: Prevents spam attacks
3. **Time Locks**: Prevents immediate withdrawals
4. **Emergency Functions**: Can recover stuck funds
5. **Safe Math**: Prevents overflow/underflow

## Gas Optimization

- **Immutable Variables**: Used for addresses to save gas
- **Efficient Storage**: Optimized data structures
- **Minimal External Calls**: Reduced gas consumption

## Deployment Requirements

1. **CHZ Token Address**: Actual CHZ token on Chiliz Chain
2. **Staking Contract Address**: Chiliz staking contract
3. **Validator Address**: Chosen validator for delegation
4. **Owner Address**: Your wallet address for control

## Usage Flow

1. **Deploy MatchMind** with required addresses
2. **Create Game** using `createGame()`
3. **Players Stake** using `stakeAndEnter()`
4. **Start Match** using `startMatch()`
5. **End Match** using `endMatch()`
6. **Distribute Yield** using `distributeYield()`
7. **Players Withdraw** using `withdraw()` 
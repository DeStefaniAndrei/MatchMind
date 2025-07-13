# MatchMind Testing Guide

This guide covers how to test the MatchMind smart contracts using Hardhat.

## Prerequisites

1. **Node.js and npm/pnpm** installed
2. **Hardhat** configured in the project
3. **Ethers.js** and **Chai** for testing

## Test Structure

The project includes three main test files:

1. **`test/MatchMind.test.js`** - Tests for the main MatchMind contract
2. **`test/GamePool.test.js`** - Tests for individual GamePool contracts
3. **`test/ChilizChain.test.js`** - Integration tests for deployed contracts on Chiliz Chain

## Running Tests

### 1. Local Network Tests

Run tests on the local Hardhat network:

```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/MatchMind.test.js
npx hardhat test test/GamePool.test.js

# Run tests with verbose output
npx hardhat test --verbose
```

### 2. Chiliz Chain Integration Tests

To test against your deployed contracts on Chiliz Chain:

1. **Update the contract addresses** in `test/ChilizChain.test.js`:
   ```javascript
   const MATCHMIND_ADDRESS = "YOUR_DEPLOYED_MATCHMIND_ADDRESS";
   const CHZ_TOKEN_ADDRESS = "REAL_CHZ_TOKEN_ADDRESS";
   const VALIDATOR_ADDRESS = "REAL_VALIDATOR_ADDRESS";
   ```

2. **Set up your private key** (create a `.env` file):
   ```
   PRIVATE_KEY=your_private_key_here
   ```

3. **Run the integration tests**:
   ```bash
   npx hardhat test test/ChilizChain.test.js --network chiliz
   ```

### 3. Test Deployment

Deploy contracts for testing:

```bash
# Deploy to local network
npx hardhat run scripts/deploy-test.js --network localhost

# Deploy to Chiliz testnet
npx hardhat run scripts/deploy-test.js --network chilizTestnet
```

## Test Categories

### 1. Deployment Tests
- Contract deployment with correct parameters
- Factory deployment verification
- Event emission validation

### 2. Game Creation Tests
- Creating new games through the factory
- Game address verification
- Access control (owner-only functions)

### 3. Match Lifecycle Tests
- Starting matches
- Ending matches
- State transition validation
- Invalid operation prevention

### 4. Yield Distribution Tests
- Exponential weight calculation
- Ranking-based distribution
- Player final rank assignment

### 5. Emergency Functions Tests
- Owner-only emergency functions
- Token recovery capabilities

### 6. Integration Tests
- Full game lifecycle
- Multiple game handling
- Contract interaction verification

## Testing with Real Chiliz Staking

The tests are designed to work with the real Chiliz staking contract at address `0x0000000000000000000000000000000000001000`.

### Important Notes:

1. **CHZ Token Address**: You need to provide the actual CHZ token address on Chiliz Chain
2. **Validator Address**: You need to provide a real validator address
3. **Staking Integration**: The contracts interact with the real staking pool for:
   - Staking CHZ tokens
   - Unstaking tokens
   - Claiming rewards
   - Getting staked amounts

### Testing Staking Functionality

To test the staking functionality with real CHZ tokens:

1. **Ensure you have CHZ tokens** in your test wallet
2. **Approve the GamePool contract** to spend your CHZ tokens
3. **Call `stakeAndEnter()`** with the desired amount
4. **Verify staking** through the staking contract

## Test Configuration

### Network Configuration

The `hardhat.config.js` includes network configurations for:

- **Hardhat Network** (localhost) - For local testing
- **Chiliz Mainnet** - For production testing
- **Chiliz Testnet** - For staging testing

### Environment Variables

Create a `.env` file for sensitive data:

```
PRIVATE_KEY=your_private_key_here
CHZ_TOKEN_ADDRESS=real_chz_token_address
VALIDATOR_ADDRESS=real_validator_address
```

## Troubleshooting

### Common Issues

1. **"Insufficient balance" errors**: Ensure your test account has enough CHZ tokens
2. **"Only owner can call this function"**: Make sure you're using the correct signer
3. **"Game not in pre-match state"**: Follow the correct game lifecycle order
4. **Network connection issues**: Check your RPC endpoint configuration

### Debug Tips

1. **Use console.log** in tests for debugging:
   ```javascript
   console.log("Game state:", await gamePool.gameState());
   ```

2. **Check transaction receipts**:
   ```javascript
   const receipt = await tx.wait();
   console.log("Gas used:", receipt.gasUsed.toString());
   ```

3. **Verify contract states**:
   ```javascript
   const stats = await gamePool.getGameStats();
   console.log("Game stats:", stats);
   ```

## Continuous Integration

For CI/CD, you can run tests automatically:

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npm run test

# Run specific network tests
npx hardhat test test/ChilizChain.test.js --network chilizTestnet
```

## Test Coverage

The tests cover:

- ✅ Contract deployment
- ✅ Access control
- ✅ Game lifecycle management
- ✅ Yield distribution logic
- ✅ Emergency functions
- ✅ State transitions
- ✅ Event emissions
- ✅ Error handling

## Next Steps

After running tests successfully:

1. **Deploy to Chiliz testnet** for staging
2. **Run integration tests** against deployed contracts
3. **Test with real CHZ tokens** on testnet
4. **Deploy to mainnet** when ready

## Support

If you encounter issues:

1. Check the Hardhat documentation
2. Verify your network configuration
3. Ensure you have sufficient test tokens
4. Review the contract logs for detailed error messages 
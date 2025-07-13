# Wallet Integration Guide for MatchMind

This guide explains how to set up wallet connection for the MatchMind dApp on Chiliz Chain.

## Overview

The wallet integration uses:
- **Wagmi** for wallet connection management
- **Web3Modal** for wallet selection UI
- **Chiliz Chain** as the target network
- **MetaMask, WalletConnect, Coinbase Wallet** as supported connectors

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root:

```env
# WalletConnect Project ID (optional but recommended)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Contract Addresses (update with your deployed addresses)
NEXT_PUBLIC_MATCHMIND_ADDRESS=your_matchmind_contract_address
NEXT_PUBLIC_CHZ_TOKEN_ADDRESS=real_chz_token_address
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001000
NEXT_PUBLIC_VALIDATOR_ADDRESS=real_validator_address
```

### 2. Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create an account and project
3. Copy your Project ID
4. Add it to your `.env.local` file

### 3. Add Chiliz Chain to MetaMask

Users need to add Chiliz Chain to their MetaMask:

**Network Details:**
- **Network Name**: Chiliz Chain
- **RPC URL**: `https://rpc.chiliz.com`
- **Chain ID**: `88888`
- **Currency Symbol**: `CHZ`
- **Block Explorer**: `https://explorer.chiliz.com`

**For Testnet:**
- **Network Name**: Chiliz Testnet
- **RPC URL**: `https://testnet-rpc.chiliz.com`
- **Chain ID**: `88882`
- **Currency Symbol**: `CHZ`
- **Block Explorer**: `https://testnet-explorer.chiliz.com`

## How It Works

### 1. Wallet Connection Flow

1. **User clicks "Connect Wallet"**
2. **Web3Modal opens** with available wallet options
3. **User selects wallet** (MetaMask, WalletConnect, etc.)
4. **Wallet connects** and shows address/balance
5. **Network check** - warns if not on Chiliz Chain
6. **Network switcher** helps users switch to correct network

### 2. Network Detection

The app automatically detects if the user is on the correct network:
- ✅ **Chiliz Chain**: Full functionality available
- ⚠️ **Wrong Network**: Shows warning and network switcher
- ❌ **No Connection**: Shows connect wallet button

### 3. Balance Display

- Shows real CHZ balance from Chiliz Chain
- Updates automatically when balance changes
- Handles loading states and errors

## Components

### WalletButton
- Main wallet connection component
- Shows connection status and address
- Displays CHZ balance
- Network warning badge

### NetworkSwitcher
- Helps users switch to Chiliz Chain
- Shows current network status
- One-click network switching

### WalletProvider
- Manages wallet state
- Handles connection/disconnection
- Provides wallet data to components

## Usage Examples

### Basic Wallet Connection

```tsx
import { useWallet } from "@/contexts/wallet-context"

function MyComponent() {
  const { isConnected, address, chzBalance, connectWallet } = useWallet()

  if (!isConnected) {
    return <button onClick={connectWallet}>Connect Wallet</button>
  }

  return (
    <div>
      <p>Address: {address}</p>
      <p>Balance: {chzBalance} CHZ</p>
    </div>
  )
}
```

### Network-Aware Component

```tsx
import { useWallet } from "@/contexts/wallet-context"
import { NetworkSwitcher } from "@/components/wallet/network-switcher"

function StakingComponent() {
  const { isConnected, isChilizChain } = useWallet()

  if (!isConnected) {
    return <p>Please connect your wallet</p>
  }

  if (!isChilizChain) {
    return <NetworkSwitcher />
  }

  return <div>Staking interface here...</div>
}
```

## Testing

### Local Development

1. **Install MetaMask** browser extension
2. **Add Chiliz Chain** to MetaMask
3. **Get testnet CHZ** from faucet
4. **Connect wallet** in the app
5. **Test functionality** with real tokens

### Testnet Testing

1. **Switch to Chiliz Testnet** in MetaMask
2. **Get testnet CHZ** from testnet faucet
3. **Deploy contracts** to testnet
4. **Test full functionality** with real contracts

## Troubleshooting

### Common Issues

1. **"Wrong Network" Error**
   - Solution: Use NetworkSwitcher or manually switch in wallet

2. **"No Provider Found" Error**
   - Solution: Install MetaMask or other supported wallet

3. **"Connection Failed" Error**
   - Solution: Check wallet permissions and try again

4. **"Insufficient Balance" Error**
   - Solution: Get more CHZ tokens from faucet or exchange

### Debug Tips

1. **Check browser console** for detailed error messages
2. **Verify network connection** in wallet
3. **Check contract addresses** are correct
4. **Ensure sufficient gas** for transactions

## Security Considerations

1. **Never expose private keys** in the frontend
2. **Use environment variables** for sensitive data
3. **Validate all user inputs** before sending to contracts
4. **Test thoroughly** on testnet before mainnet

## Next Steps

1. **Deploy contracts** to Chiliz Chain
2. **Update contract addresses** in environment variables
3. **Test with real CHZ tokens**
4. **Add more wallet providers** if needed
5. **Implement transaction signing** for contract interactions

## Support

For issues with:
- **Wallet connection**: Check wallet permissions and network settings
- **Contract interaction**: Verify contract addresses and ABI
- **Network issues**: Ensure correct RPC endpoints
- **Balance display**: Check token contract integration 
# MatchMind Setup Guide

## Overview
This guide will help you set up the complete MatchMind system with your deployed contracts on the Spicy testnet.

## Prerequisites
- Node.js 18+ installed
- pnpm package manager
- Supabase account and project
- SportMonks API key
- Private key for admin operations

## 1. Environment Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# SportMonks API
NEXT_PUBLIC_SPORTMONKS_API_KEY=your_sportmonks_api_key

# Contract Configuration (already set in contract-config.ts)
# MatchMind: 0x76aaFd6014c708ECddaAFAA38d3305d8097acE2e
# GameFactory: 0xE14bE13B2020Eb81eb0f30683b2dfDCFa78fe1FF
# Validator: 0xbdBF08393b66130B4b243863150A265b2A5Df642
```

## 2. Database Setup

Your database tables are already created. The system uses these tables:
- `matches` - PSG matches from SportMonks API
- `users` - Wallet addresses of users
- `stakes` - User stakes for matches
- `predictions` - User predictions for questions

## 3. Contract Configuration

The system is configured with your deployed contracts:
- **Network**: Spicy Testnet (Chain ID: 88882)
- **MatchMind Contract**: `0x76aaFd6014c708ECddaAFAA38d3305d8097acE2e`
- **GameFactory Contract**: `0xE14bE13B2020Eb81eb0f30683b2dfDCFa78fe1FF`
- **Validator**: `0xbdBF08393b66130B4b243863150A265b2A5Df642`

## 4. Installation & Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 5. Admin Dashboard Setup

1. Navigate to `/admin` in your browser
2. Go to the "Contracts" tab
3. Enter your private key for admin operations
4. Click "Initialize Integration"
5. Use the sync functions to connect matches with contracts

## 6. API Integration

### SportMonks API
- **Team ID**: 591 (PSG)
- **Endpoint**: `https://api.sportmonks.com/v3/football/schedules/teams/591`
- **API Key**: Required for live data

### PSG Matches Page
- Navigate to `/psg-matches` to see upcoming PSG games
- Matches are fetched from SportMonks API
- Cards show match details and status

## 7. Smart Contract Operations

### Available Functions
1. **Sync Matches with Contracts** - Creates game pools for matches
2. **Start Upcoming Matches** - Activates games when matches begin
3. **End Finished Matches** - Ends games when matches complete
4. **Get Contract Balance** - Check contract CHZ balance

### Question System
12 predefined questions for PSG matches:
1. Will PSG score in the first half?
2. Will PSG win the match?
3. Will PSG score 2 or more goals?
4. Will PSG keep a clean sheet?
5. Will PSG score in both halves?
6. Will PSG score in the first 15 minutes?
7. Will PSG score in the last 15 minutes?
8. Will PSG have more than 5 corner kicks?
9. Will PSG have more than 10 shots on target?
10. Will PSG receive more than 2 yellow cards?
11. Will PSG score from a set piece?
12. Will PSG score from a penalty?

## 8. User Flow

1. **Connect Wallet** - Users connect via RainbowKit
2. **View Matches** - Browse upcoming PSG matches
3. **Stake CHZ** - Stake tokens for predictions
4. **Make Predictions** - Answer questions for matches
5. **Earn Rewards** - Get paid for correct predictions

## 9. Testing

### Test the Integration
1. Initialize the admin dashboard
2. Sync some matches with contracts
3. Check that game pools are created
4. Verify database records are updated

### Test User Flow
1. Connect a wallet
2. Navigate to a match
3. Try staking and making predictions
4. Check that transactions are recorded

## 10. Troubleshooting

### Common Issues

**Environment Variables Not Loading**
- Ensure `.env.local` is in project root
- Restart the development server
- Check variable names match exactly

**Contract Connection Issues**
- Verify you're on Spicy testnet
- Check contract addresses are correct
- Ensure private key has sufficient CHZ

**API Errors**
- Verify SportMonks API key is valid
- Check network connectivity
- Review API rate limits

**Database Errors**
- Verify Supabase credentials
- Check table structure matches schema
- Ensure RLS policies are configured

## 11. Deployment

### Production Setup
1. Set up production environment variables
2. Deploy to Vercel or similar platform
3. Configure production Supabase project
4. Test all functionality in production

### Monitoring
- Monitor contract events
- Track user engagement
- Monitor API usage
- Check for errors in logs

## 12. Security Considerations

- Keep private keys secure
- Use environment variables for secrets
- Implement proper access controls
- Monitor for suspicious activity
- Regular security audits

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for errors
3. Verify all configurations
4. Test with smaller amounts first

The system is now ready to handle PSG match predictions with your deployed smart contracts on the Chiliz Spicy testnet! 
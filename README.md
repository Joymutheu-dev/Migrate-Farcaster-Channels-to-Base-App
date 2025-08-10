# Migrate-Farcaster-Channels-to-Base-App
The `Farcaster-to-BaseApp-channel-migrator` is a subscription-based (100 USDC/month) tool that enables seamless migration of Farcaster channels, such as `/cryptobaddies`, to the Base App, with bidirectional access and cross-posting to channels like `/parenting` on both platforms. Built with Node.js, TypeScript, and PostgreSQL, it integrates Farcaster’s Neynar API for channel data and Base’s Ethereum L2 blockchain for scalable, low-cost storage and subscription verification via smart contracts. Authenticated via Sign In with Farcaster, subscribed users can access channels, post content, and sync posts across Farcaster and Base, with Base Pay payments. The goal of this repository is to provide a modular architecture, comprehensive API documentation, and robust security, fostering inclusive decentralized social networking.

## Features
- **Channel Migration**: Migrate Farcaster channels (posts, members, metadata) to the Base App.
- **Bidirectional Access**: View and interact with Farcaster channels in the Base App.
- **Cross-Posting**: Post to a channel via Base and sync to specified Farcaster channels.
- **Subscription Model**: 100 USDC subscription verified on-chain.
- **Sign In with Farcaster (SIWF)**: Secure user authentication using Farcaster’s AuthKit.
- **Base Integration**: Store channel and post data on Base for efficient transactions.
- **Developer-Friendly**: OpenAPI documentation, SDKs, and modular codebase.

## Prerequisites
- Node.js v18
- PostgreSQL v14
- Stripe account for payment processing
- Base blockchain provider (Alchemy)
- Neynar API key for Farcaster access
- Redis v7 for caching

## Installation
1. Clone the repository:
   ```bash
   https://github.com/Joymutheu-dev/Migrate-Farcaster-Channels-to-Base-App
   cd farcasterchannels-to-base-migrator
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
  ( Edit `.env` with your Neynar API key, Stripe secret, Alchemy provider URL, Redis connection, and database URL.)
4. Run database migrations:
   ```bash
   npm run migrate
   ```
5. Deploy the Base smart contract (`contracts/Subscription.sol`):
   ```bash
   npx hardhat run scripts/deploy.js --network base
   ```
6. Start the application:
   ```bash
   npm run start
   ```

## Usage
1. **Subscribe**: Initiate a $100/month subscription via the Base App dashboard.
2. **Authenticate**: Sign in using Sign In with Farcaster (SIWF).
3. **Access Channels**: View channels like `/cryptobaddies` in the Base App.
4. **Post Content**: Create posts in the Base App, selecting cross-posting channels (e.g., `/parenting`) for Farcaster.
5. **Migrate Channels**: Use the `/migrate` endpoint to transfer channel data to Base.
6. **Monitor**: Track subscription status and post history via the dashboard.

## Contributions 
All contributions to the project are welcome. We need all hands on deck. fork the repo and cook! 

## Support
- For inquiries Dm me on Farcaster @cryptobaddie 

## Community Focus
This tool supports communities like /lambchop, /fries /CryptoBaddies etc, empowering women in Web3 through seamless channel migration, access, and cross-posting across Farcaster and Base. Join us to build a more inclusive decentralized social ecosystem!

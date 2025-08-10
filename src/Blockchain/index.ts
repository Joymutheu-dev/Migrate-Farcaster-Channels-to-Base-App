import { ethers } from 'ethers';
import { logger } from '../utils/logger';

// Initialize provider
const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

// Subscription contract ABI
const subscriptionABI = [
  'function isSubscribed(address user) external view returns (bool)',
  'function hasChannelAccess(address user, string channelId) external view returns (bool)',
];

// Initialize contract
const subscriptionContract = new ethers.Contract(
  process.env.SUBSCRIPTION_CONTRACT_ADDRESS,
  subscriptionABI,
  provider
);

// Check subscription status
export async function isSubscribed(walletAddress: string): Promise<boolean> {
  try {
    const subscribed = await subscriptionContract.isSubscribed(walletAddress);
    logger.info(`Checked subscription for ${walletAddress}: ${subscribed}`);
    return subscribed;
  } catch (error) {
    logger.error(`Error checking subscription for ${walletAddress}: ${error.message}`);
    throw new Error('Failed to check subscription');
  }
}

// Check channel access
export async function hasChannelAccess(walletAddress: string, channelId: string): Promise<boolean> {
  try {
    const access = await subscriptionContract.hasChannelAccess(walletAddress, channelId);
    logger.info(`Checked channel access for ${walletAddress} on ${channelId}: ${access}`);
    return access;
  } catch (error) {
    logger.error(`Error checking channel access for ${walletAddress} on ${channelId}: ${error.message}`);
    throw new Error('Failed to check channel access');
  }
}
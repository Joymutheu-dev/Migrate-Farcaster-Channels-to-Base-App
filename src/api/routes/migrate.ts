import { Router } from 'express';
import { ethers } from 'ethers';
import axios from 'axios';
import { authenticateSIWF } from '../middleware/auth';
import { getDatabase } from '../../database';
import { logger } from '../../utils/logger';

const router = Router();

// Initialize ethers provider for Base blockchain
const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

// Subscription contract ABI (minimal for isSubscribed and hasChannelAccess)
const subscriptionABI = [
  'function isSubscribed(address user) external view returns (bool)',
  'function hasChannelAccess(address user, string channelId) external view returns (bool)',
];

// Initialize subscription contract
const subscriptionContract = new ethers.Contract(
  process.env.SUBSCRIPTION_CONTRACT_ADDRESS,
  subscriptionABI,
  provider
);

// Migrate a Farcaster channel to Base
router.post('/migrate', authenticateSIWF, async (req, res) => {
  try {
    const { channelId } = req.body; // e.g., "/cryptobaddies"
    const user = req.user; // From SIWF middleware (contains wallet address)
    const walletAddress = user.walletAddress;

    // Verify subscription
    const isSubscribed = await subscriptionContract.isSubscribed(walletAddress);
    if (!isSubscribed) {
      return res.status(403).json({ success: false, error: 'Active subscription required' });
    }

    // Verify channel access (optional, if restricted to specific channels)
    const hasAccess = await subscriptionContract.hasChannelAccess(walletAddress, channelId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, error: `No access to channel ${channelId}` });
    }

    // Fetch channel data from Neynar API
    const neynarResponse = await axios.get(`https://api.neynar.com/v2/channel/${channelId}`, {
      headers: { Authorization: `Bearer ${process.env.NEYNAR_API_KEY}` },
    });
    const channelData = neynarResponse.data;

    // Store channel metadata on Base (simplified, assumes IPFS for content)
    const ipfsHash = await storeOnIPFS(channelData); // Placeholder for IPFS storage
    await storeChannelOnBase(walletAddress, channelId, ipfsHash); // Placeholder for Base storage

    // Log migration in database
    const db = await getDatabase();
    await db.query(
      'INSERT INTO migrations (user_id, wallet_address, channel_id, ipfs_hash, status) VALUES ($1, $2, $3, $4, $5)',
      [user.id, walletAddress, channelId, ipfsHash, 'completed']
    );

    logger.info(`Channel ${channelId} migrated for user ${user.id} with wallet ${walletAddress}`);

    res.json({
      success: true,
      message: `Channel ${channelId} migrated to Base`,
      data: { channelId, ipfsHash },
    });
  } catch (error) {
    logger.error(`Migration error for user ${req.user?.id}, channel ${req.body.channelId}: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to migrate channel' });
  }
});

// Placeholder function for storing channel data on IPFS
async function storeOnIPFS(channelData: any): Promise<string> {
  // Implement IPFS storage logic (e.g., using Pinata or Infura IPFS API)
  // Returns a mock IPFS hash for demonstration
  return 'QmExampleHash123';
}

// Placeholder function for storing channel metadata on Base
async function storeChannelOnBase(walletAddress: string, channelId: string, ipfsHash: string): Promise<void> {
  // Implement logic to store channel metadata in a Base smart contract
  // Example: Call a contract to record channelId and ipfsHash
  logger.info(`Stored channel ${channelId} with IPFS hash ${ipfsHash} for ${walletAddress}`);
}

export default router;
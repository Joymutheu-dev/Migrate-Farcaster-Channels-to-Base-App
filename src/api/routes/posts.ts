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

// Post to a channel with optional cross-posting
router.post('/posts', authenticateSIWF, async (req, res) => {
  try {
    const { channelId, content, crossPost } = req.body; // e.g., { channelId: "/cryptobaddies", content: "Empowering women in Web3!", crossPost: ["/parenting"] }
    const user = req.user; // From SIWF middleware (contains wallet address)
    const walletAddress = user.walletAddress;

    // Verify subscription
    const isSubscribed = await subscriptionContract.isSubscribed(walletAddress);
    if (!isSubscribed) {
      return res.status(403).json({ success: false, error: 'Active subscription required' });
    }

    // Verify channel access
    const hasAccess = await subscriptionContract.hasChannelAccess(walletAddress, channelId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, error: `No access to channel ${channelId}` });
    }

    // Post to primary channel via Neynar API
    const neynarResponse = await axios.post(
      'https://api.neynar.com/v2/cast',
      { channel_id: channelId, text: content },
      { headers: { Authorization: `Bearer ${process.env.NEYNAR_API_KEY}` } }
    );
    const postId = neynarResponse.data.cast_id;

    // Handle cross-posting to other channels
    const crossPostIds: string[] = [];
    if (crossPost && Array.isArray(crossPost)) {
      for (const crossChannelId of crossPost) {
        const crossResponse = await axios.post(
          'https://api.neynar.com/v2/cast',
          { channel_id: crossChannelId, text: content },
          { headers: { Authorization: `Bearer ${process.env.NEYNAR_API_KEY}` } }
        );
        crossPostIds.push(crossResponse.data.cast_id);
      }
    }

    // Store post metadata on Base (simplified, assumes IPFS for content)
    const ipfsHash = await storeOnIPFS({ channelId, content, crossPost }); // Placeholder for IPFS storage
    await storePostOnBase(walletAddress, channelId, ipfsHash, crossPost); // Placeholder for Base storage

    // Log post in database
    const db = await getDatabase();
    await db.query(
      'INSERT INTO posts (user_id, wallet_address, channel_id, content, ipfs_hash, cross_post_channels, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [user.id, walletAddress, channelId, content, ipfsHash, crossPost, 'posted']
    );

    logger.info(`Post created by user ${user.id} in channel ${channelId} with cross-posts to ${crossPost}`);

    res.json({
      success: true,
      message: `Posted to ${channelId}${crossPost ? ` and cross-posted to ${crossPost.join(', ')}` : ''}`,
      data: { postId, crossPostIds, ipfsHash },
    });
  } catch (error) {
    logger.error(`Post error for user ${req.user?.id}, channel ${req.body.channelId}: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

// Placeholder function for storing post data on IPFS
async function storeOnIPFS(postData: any): Promise<string> {
  // Implement IPFS storage logic (e.g., using Pinata or Infura IPFS API)
  // Returns a mock IPFS hash for demonstration
  return 'QmPostHash123';
}

// Placeholder function for storing post metadata on Base
async function storePostOnBase(walletAddress: string, channelId: string, ipfsHash: string, crossPost: string[]): Promise<void> {
  // Implement logic to store post metadata in a Base smart contract
  // Example: Call a contract to record channelId, ipfsHash, and crossPost channels
  logger.info(`Stored post for channel ${channelId} with IPFS hash ${ipfsHash} for ${walletAddress}`);
}

export default router;
import { Router } from 'express';
import { ethers } from 'ethers';
import { authenticateSIWF } from '../middleware/auth';
import { getDatabase } from '../../database';
import { logger } from '../../utils/logger';

const router = Router();

// Initialize ethers provider for Base blockchain
const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

// Subscription contract ABI (minimal for subscribe and isSubscribed)
const subscriptionABI = [
  'function subscribe() external',
  'function isSubscribed(address user) external view returns (bool)',
];

// Initialize contract instance
const subscriptionContract = new ethers.Contract(
  process.env.SUBSCRIPTION_CONTRACT_ADDRESS,
  subscriptionABI,
  provider
);

// Subscribe endpoint
router.post('/subscribe', authenticateSIWF, async (req, res) => {
  try {
    const user = req.user; // From SIWF middleware (contains wallet address)
    const walletAddress = user.walletAddress; // Assumes SIWF provides wallet address

    // Check if user is already subscribed
    const isSubscribed = await subscriptionContract.isSubscribed(walletAddress);
    if (isSubscribed) {
      return res.status(400).json({ success: false, error: 'User already subscribed' });
    }

    // Note: USDC approval and contract interaction are handled client-side via Base Pay
    // The frontend (React/Next.js) calls Subscription.sol's subscribe() function
    // This API logs the subscription attempt and prepares for post-payment verification
    const db = await getDatabase();
    await db.query(
      'INSERT INTO subscriptions (user_id, wallet_address, status) VALUES ($1, $2, $3) ON CONFLICT (user_id) UPDATE SET status = $3',
      [user.id, walletAddress, 'pending']
    );

    logger.info(`Subscription initiated for user ${user.id} with wallet ${walletAddress}`);

    // Respond with instructions for client-side payment
    res.json({
      success: true,
      message: 'Initiate 100 USDC payment via Base Pay to complete subscription',
      contractAddress: process.env.SUBSCRIPTION_CONTRACT_ADDRESS,
      usdcContractAddress: process.env.USDC_CONTRACT_ADDRESS,
    });
  } catch (error) {
    logger.error(`Subscription error for user ${req.user?.id}: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to initiate subscription' });
  }
});

// Verify subscription status (called after payment)
router.get('/verify-subscription', authenticateSIWF, async (req, res) => {
  try {
    const user = req.user;
    const walletAddress = user.walletAddress;

    // Check subscription status on-chain
    const isSubscribed = await subscriptionContract.isSubscribed(walletAddress);
    if (!isSubscribed) {
      return res.status(400).json({ success: false, error: 'No active subscription' });
    }

    // Update database with confirmed subscription
    const db = await getDatabase();
    await db.query(
      'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE user_id = $2',
      ['active', user.id]
    );

    logger.info(`Subscription verified for user ${user.id} with wallet ${walletAddress}`);
    res.json({ success: true, message: 'Subscription active', walletAddress });
  } catch (error) {
    logger.error(`Verification error for user ${req.user?.id}: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to verify subscription' });
  }
});

export default router;
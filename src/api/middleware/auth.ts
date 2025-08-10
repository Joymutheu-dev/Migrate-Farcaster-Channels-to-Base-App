import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { logger } from '../../utils/logger';

// Extend Express Request interface to include user property
interface AuthRequest extends Request {
  user?: { id: string; walletAddress: string };
}

// SIWF authentication middleware
export async function authenticateSIWF(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid Authorization header');
      return res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      logger.warn('Missing token in Authorization header');
      return res.status(401).json({ success: false, error: 'Missing token' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { fid: string; walletAddress: string };
    if (!decoded.fid || !decoded.walletAddress) {
      logger.warn('Invalid token payload');
      return res.status(401).json({ success: false, error: 'Invalid token payload' });
    }

    // Verify user with Neynar API (validate Farcaster user)
    const neynarResponse = await axios.get(`https://api.neynar.com/v2/user/${decoded.fid}`, {
      headers: { Authorization: `Bearer ${process.env.NEYNAR_API_KEY}` },
    });
    const userData = neynarResponse.data;
    if (!userData || userData.wallet_address !== decoded.walletAddress) {
      logger.warn(`Neynar user verification failed for FID ${decoded.fid}`);
      return res.status(401).json({ success: false, error: 'User verification failed' });
    }

    // Attach user data to request
    req.user = {
      id: decoded.fid,
      walletAddress: decoded.walletAddress,
    };

    logger.info(`User authenticated: FID ${decoded.fid}, Wallet ${decoded.walletAddress}`);
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
}
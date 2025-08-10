import { create } from 'ipfs-http-client';
import { logger } from './logger';

// Initialize IPFS client (assumes Pinata or Infura IPFS)
const ipfs = create({
  url: 'https://ipfs.infura.io:5001/api/v0', // Replace with your IPFS provider
});

export async function storeOnIPFS(data: any): Promise<string> {
  try {
    const dataString = JSON.stringify(data);
    const { cid } = await ipfs.add(dataString);
    const ipfsHash = cid.toString();
    logger.info(`Stored data on IPFS with hash: ${ipfsHash}`);
    return ipfsHash;
  } catch (error) {
    logger.error(`IPFS storage error: ${error.message}`);
    throw new Error('Failed to store data on IPFS');
  }
}
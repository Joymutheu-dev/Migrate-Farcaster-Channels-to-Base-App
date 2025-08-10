import { Pool } from 'pg';
import { logger } from '../utils/logger';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout for establishing connections
});

// Handle connection errors
pool.on('error', (err: Error) => {
  logger.error(`Database connection error: ${err.message}`);
});

// Database connection utility
export async function getDatabase() {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    logger.info('Database connected successfully');
    return pool;
  } catch (err) {
    logger.error(`Failed to connect to database: ${err.message}`);
    throw new Error('Database connection failed');
  }
}

// Gracefully close the pool on application shutdown
export async function closeDatabase() {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (err) {
    logger.error(`Error closing database pool: ${err.message}`);
  }
}
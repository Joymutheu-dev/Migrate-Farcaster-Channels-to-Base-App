-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'active', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Create migrations table
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  channel_id VARCHAR(255) NOT NULL,
  ipfs_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES subscriptions (user_id)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  channel_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  ipfs_hash VARCHAR(255) NOT NULL,
  cross_post_channels TEXT[] DEFAULT '{}',
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'posted', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES subscriptions (user_id)
);

-- Create index for faster queries
CREATE INDEX idx_subscriptions_wallet_address ON subscriptions (wallet_address);
CREATE INDEX idx_migrations_channel_id ON migrations (channel_id);
CREATE INDEX idx_posts_channel_id ON posts (channel_id);
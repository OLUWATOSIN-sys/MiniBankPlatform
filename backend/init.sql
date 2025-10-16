-- Initialize MiniBank Database
-- This script will be run when PostgreSQL container starts

-- Create database if it doesn't exist (already created by POSTGRES_DB)
-- CREATE DATABASE IF NOT EXISTS minibank;

-- Grant all privileges to minibank user
GRANT ALL PRIVILEGES ON DATABASE minibank TO minibank;

-- Extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set up proper permissions
ALTER DATABASE minibank OWNER TO minibank;

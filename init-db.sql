-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for better UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

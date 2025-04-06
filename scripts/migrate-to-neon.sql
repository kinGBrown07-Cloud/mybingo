-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
DO $$ BEGIN
    CREATE TYPE game_type AS ENUM ('CLASSIC', 'MAGIC', 'GOLD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE region AS ENUM ('BLACK_AFRICA', 'NORTH_AFRICA', 'EUROPE', 'AMERICAS', 'ASIA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE currency AS ENUM ('XOF', 'MAD', 'EUR', 'USD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'REFUND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    coins INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    points_rate FLOAT NOT NULL DEFAULT 300,
    vip_level_id UUID,
    referrer_id UUID REFERENCES profiles(id),
    region region NOT NULL DEFAULT 'BLACK_AFRICA',
    currency currency NOT NULL DEFAULT 'XOF',
    role user_role NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type game_type NOT NULL,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    has_won BOOLEAN NOT NULL DEFAULT false,
    matched_pairs INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create card_flips table
CREATE TABLE IF NOT EXISTS card_flips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    card_index INTEGER NOT NULL,
    image_id UUID NOT NULL,
    is_matched BOOLEAN NOT NULL DEFAULT false,
    is_winner BOOLEAN NOT NULL DEFAULT false,
    prize_amount INTEGER,
    flipped_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    points_amount INTEGER NOT NULL DEFAULT 0,
    type transaction_type NOT NULL,
    status transaction_status NOT NULL DEFAULT 'PENDING',
    currency currency NOT NULL,
    game_session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create region_rates table
CREATE TABLE IF NOT EXISTS region_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region region UNIQUE NOT NULL,
    currency currency NOT NULL,
    rate FLOAT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default region rates
INSERT INTO region_rates (region, currency, rate) VALUES
    ('BLACK_AFRICA', 'XOF', 300),    -- 2 points = 300 XOF
    ('NORTH_AFRICA', 'MAD', 500),    -- 2 points = 500 MAD
    ('EUROPE', 'EUR', 2),            -- 2 points = 2 EUR
    ('AMERICAS', 'USD', 2),          -- 2 points = 2 USD
    ('ASIA', 'USD', 2)               -- 2 points = 2 USD
ON CONFLICT (region) DO UPDATE
SET currency = EXCLUDED.currency,
    rate = EXCLUDED.rate,
    updated_at = CURRENT_TIMESTAMP;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON game_sessions;
CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_region_rates_updated_at ON region_rates;
CREATE TRIGGER update_region_rates_updated_at
    BEFORE UPDATE ON region_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Add RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_flips ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_rates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = current_user_id());
CREATE POLICY profiles_delete ON profiles FOR DELETE USING (id = current_user_id());

-- Game sessions policies
CREATE POLICY game_sessions_select ON game_sessions FOR SELECT USING (profile_id = current_user_id());
CREATE POLICY game_sessions_insert ON game_sessions FOR INSERT WITH CHECK (profile_id = current_user_id());
CREATE POLICY game_sessions_update ON game_sessions FOR UPDATE USING (profile_id = current_user_id());

-- Card flips policies
CREATE POLICY card_flips_select ON card_flips FOR SELECT USING (
    game_session_id IN (SELECT id FROM game_sessions WHERE profile_id = current_user_id())
);
CREATE POLICY card_flips_insert ON card_flips FOR INSERT WITH CHECK (
    game_session_id IN (SELECT id FROM game_sessions WHERE profile_id = current_user_id())
);

-- Transactions policies
CREATE POLICY transactions_select ON transactions FOR SELECT USING (profile_id = current_user_id());
CREATE POLICY transactions_insert ON transactions FOR INSERT WITH CHECK (profile_id = current_user_id());

-- Region rates policies (admin only)
CREATE POLICY region_rates_select ON region_rates FOR SELECT USING (true);
CREATE POLICY region_rates_modify ON region_rates USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = current_user_id() AND role = 'ADMIN')
);

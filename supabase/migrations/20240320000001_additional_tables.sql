-- Create promotions table
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('POINTS_PACK', 'COMMUNITY_GAME', 'VIP_BONUS', 'SUPER_LOT')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    points_required INTEGER,
    points_bonus INTEGER,
    prize_value INTEGER,
    prize_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create communities table
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    cause_description TEXT NOT NULL,
    target_amount INTEGER NOT NULL,
    current_amount INTEGER DEFAULT 0,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create vip_levels table
CREATE TABLE vip_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    level INTEGER NOT NULL UNIQUE,
    points_required INTEGER NOT NULL,
    cashback_rate DECIMAL(5,2) NOT NULL,
    bonus_multiplier DECIMAL(5,2) NOT NULL,
    exclusive_promotions BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create super_lot_entries table
CREATE TABLE super_lot_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(user_id),
    promotion_id UUID NOT NULL REFERENCES promotions(id),
    tickets_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add missing columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS birthdate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'FR',
ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'EUROPE',
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS vip_level_id UUID REFERENCES vip_levels(id),
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Add missing columns to game_sessions table
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS matched_pairs INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS result JSONB,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;

-- Add missing columns to card_flips table
ALTER TABLE card_flips
ADD COLUMN IF NOT EXISTS is_matched BOOLEAN DEFAULT false;

-- Add missing columns to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS coins_amount INTEGER DEFAULT 0;

-- Enable Row Level Security for new tables
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_lot_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Anyone can view promotions"
    ON promotions FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view communities"
    ON communities FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view vip levels"
    ON vip_levels FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own super lot entries"
    ON super_lot_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own super lot entries"
    ON super_lot_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for new tables
CREATE INDEX idx_promotions_type ON promotions(type);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_communities_is_active ON communities(is_active);
CREATE INDEX idx_vip_levels_level ON vip_levels(level);
CREATE INDEX idx_super_lot_entries_user ON super_lot_entries(user_id);
CREATE INDEX idx_super_lot_entries_promotion ON super_lot_entries(promotion_id); 
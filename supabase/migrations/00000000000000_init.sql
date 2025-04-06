-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    username TEXT UNIQUE,
    hashed_password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    name TEXT,
    phone_number TEXT,
    country TEXT,
    region TEXT CHECK (region IN ('BLACK_AFRICA', 'NORTH_AFRICA', 'EUROPE', 'AMERICAS', 'ASIA')) DEFAULT 'BLACK_AFRICA',
    currency TEXT DEFAULT 'XOF',
    points INTEGER DEFAULT 0,
    points_rate INTEGER DEFAULT 300,
    role TEXT CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')) DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('CLASSIC', 'MAGIC', 'GOLD')) NOT NULL,
    description TEXT,
    image_url TEXT,
    min_points INTEGER DEFAULT 0,
    max_points INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_treasury table
CREATE TABLE IF NOT EXISTS admin_treasury (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'XOF',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create update_timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_games_timestamp
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_admin_treasury_timestamp
    BEFORE UPDATE ON admin_treasury
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Create indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE INDEX IF NOT EXISTS games_type_idx ON games(type);

-- Insert initial data
INSERT INTO games (name, type, description, image_url, min_points, max_points) VALUES
('Classic Cards', 'CLASSIC', 'Trouvez 2 images identiques et gagnez des kits alimentaires', '/images/games/cards/classic-cards.jpg', 0, 100),
('Magic Fortune', 'MAGIC', 'Trouvez 2 images identiques et gagnez des vêtements de marque', '/images/games/cards/magic-fortune.jpg', 50, 200),
('Gold Digger', 'GOLD', 'Trouvez 2 images identiques et gagnez des lots exceptionnels', '/images/games/cards/gold-digger.jpg', 100, 500)
ON CONFLICT (id) DO NOTHING;

-- Insert initial admin treasury
INSERT INTO admin_treasury (amount, currency) VALUES
(1000000, 'XOF')
ON CONFLICT (id) DO NOTHING;

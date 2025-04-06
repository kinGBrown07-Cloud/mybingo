-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  username TEXT UNIQUE,
  hashed_password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  phone_number TEXT,
  country TEXT,
  region TEXT CHECK (region IN ('BLACK_AFRICA', 'NORTH_AFRICA', 'EUROPE', 'AMERICAS', 'ASIA')),
  currency TEXT NOT NULL DEFAULT 'XOF',
  points INTEGER NOT NULL DEFAULT 0,
  points_rate INTEGER NOT NULL DEFAULT 300,
  role TEXT CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')) NOT NULL DEFAULT 'USER',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('CLASSIC', 'MAGIC', 'GOLD')) NOT NULL,
  description TEXT,
  image_url TEXT,
  min_points INTEGER NOT NULL DEFAULT 1,
  max_points INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create admin_treasury table
CREATE TABLE IF NOT EXISTS admin_treasury (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'XOF',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_treasury ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Games policies
CREATE POLICY "Anyone can view active games" ON games
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage games" ON games
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admin treasury policies
CREATE POLICY "Only admins can view treasury" ON admin_treasury
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can update treasury" ON admin_treasury
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER admin_treasury_updated_at
  BEFORE UPDATE ON admin_treasury
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

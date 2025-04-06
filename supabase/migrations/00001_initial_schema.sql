-- Enable les extensions nécessaires
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Création des types enum
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE game_type AS ENUM ('classic', 'magic', 'gold');
CREATE TYPE prize_status AS ENUM ('pending', 'shipped', 'delivered', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('win', 'loss', 'refund');

-- Table des utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    role user_role DEFAULT 'user',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    points INTEGER DEFAULT 0,
    total_games_played INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    CONSTRAINT sessions_token_key UNIQUE (token)
);

-- Table des jeux
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type game_type NOT NULL,
    description TEXT,
    min_points INTEGER NOT NULL DEFAULT 0,
    max_points INTEGER NOT NULL,
    win_rate DECIMAL(4,3) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des parties jouées
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id),
    points_wagered INTEGER NOT NULL,
    points_won INTEGER,
    result JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    ip_address VARCHAR(45)
);

-- Table des lots/prix
CREATE TABLE prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    points_cost INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des lots gagnés
CREATE TABLE user_prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    prize_id UUID NOT NULL REFERENCES prizes(id),
    game_session_id UUID REFERENCES game_sessions(id),
    status prize_status DEFAULT 'pending',
    tracking_number VARCHAR(100),
    shipping_address TEXT,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    notes TEXT
);

-- Table des transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    game_session_id UUID REFERENCES game_sessions(id),
    type transaction_type NOT NULL,
    points_amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

-- Table des statistiques quotidiennes
CREATE TABLE daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_games_played INTEGER DEFAULT 0,
    total_points_wagered INTEGER DEFAULT 0,
    total_points_won INTEGER DEFAULT 0,
    total_prizes_claimed INTEGER DEFAULT 0,
    unique_players INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_user_prizes_user_id ON user_prizes(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_daily_stats_date ON daily_stats(date);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prizes_updated_at
    BEFORE UPDATE ON prizes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at
    BEFORE UPDATE ON daily_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Données initiales pour les jeux
INSERT INTO games (name, type, description, min_points, max_points, win_rate) VALUES
('Classic Cards', 'classic', 'Gagnez des kits alimentaires avec ce jeu simple et amusant', 0, 100, 0.40),
('Magic Fortune', 'magic', 'Des vêtements et accessoires de marque à gagner', 50, 200, 0.30),
('Gold Digger', 'gold', 'Des lots exceptionnels : voitures, voyages et plus', 100, 500, 0.20);

-- Fonction pour calculer les statistiques quotidiennes
CREATE OR REPLACE FUNCTION calculate_daily_stats()
RETURNS void AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
BEGIN
    INSERT INTO daily_stats (date)
    VALUES (current_date)
    ON CONFLICT (date) DO NOTHING;

    WITH daily_calculations AS (
        SELECT
            COUNT(DISTINCT gs.id) as games_played,
            SUM(gs.points_wagered) as points_wagered,
            SUM(gs.points_won) as points_won,
            COUNT(DISTINCT up.id) as prizes_claimed,
            COUNT(DISTINCT gs.user_id) as unique_players
        FROM game_sessions gs
        LEFT JOIN user_prizes up ON up.game_session_id = gs.id
        WHERE DATE(gs.started_at) = current_date
    )
    UPDATE daily_stats
    SET
        total_games_played = dc.games_played,
        total_points_wagered = dc.points_wagered,
        total_points_won = dc.points_won,
        total_prizes_claimed = dc.prizes_claimed,
        unique_players = dc.unique_players
    FROM daily_calculations dc
    WHERE daily_stats.date = current_date;
END;
$$ LANGUAGE plpgsql;

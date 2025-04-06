-- Ajouter les champs d'affiliation à la table profiles
ALTER TABLE profiles
ADD COLUMN affiliate_code VARCHAR(8) UNIQUE,
ADD COLUMN referred_by UUID REFERENCES profiles(id),
ADD COLUMN affiliate_earnings INTEGER DEFAULT 0 NOT NULL;

-- Créer un index sur le code d'affiliation pour des recherches rapides
CREATE INDEX idx_profiles_affiliate_code ON profiles(affiliate_code);

-- Créer une table pour suivre les gains d'affiliation
CREATE TABLE affiliate_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES profiles(id) NOT NULL,
    referred_id UUID REFERENCES profiles(id) NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_referral UNIQUE(referrer_id, referred_id)
);

-- Activer RLS sur la nouvelle table
ALTER TABLE affiliate_earnings ENABLE ROW LEVEL SECURITY;

-- Politique pour les gains d'affiliation
CREATE POLICY "Les utilisateurs peuvent voir leurs propres gains d'affiliation"
    ON affiliate_earnings
    FOR SELECT
    USING (auth.uid() = referrer_id);

-- Politique pour l'insertion (gérée par les fonctions du serveur)
CREATE POLICY "Seul le système peut insérer des gains d'affiliation"
    ON affiliate_earnings
    FOR INSERT
    WITH CHECK (false);  -- Seules les fonctions avec security definer peuvent insérer

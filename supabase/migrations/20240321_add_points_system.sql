-- Ajout de la colonne points à la table profiles si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'points') THEN
        ALTER TABLE profiles ADD COLUMN points INTEGER NOT NULL DEFAULT 0;
    END IF;
END$$;

-- Ajout de la colonne points_earned à la table card_flips si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'card_flips' AND column_name = 'points_earned') THEN
        ALTER TABLE card_flips ADD COLUMN points_earned INTEGER NOT NULL DEFAULT 1;
    END IF;
END$$;

-- Création ou mise à jour de la fonction pour incrémenter les points d'un utilisateur
CREATE OR REPLACE FUNCTION increment_user_points(p_user_id UUID, p_points INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET points = COALESCE(points, 0) + p_points
  WHERE id = p_user_id;
END;
$$;

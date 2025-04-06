-- Création de la table promotions si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotions') THEN
        CREATE TABLE promotions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          type VARCHAR(20) NOT NULL CHECK (type IN ('POINTS_PACK', 'COMMUNITY_GAME', 'VIP_BONUS', 'SUPER_LOT')),
          start_date TIMESTAMP WITH TIME ZONE NOT NULL,
          end_date TIMESTAMP WITH TIME ZONE NOT NULL,
          points_required INTEGER,
          points_bonus INTEGER,
          prize_value DECIMAL(10,2),
          prize_description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END$$;

-- Création de la table communities si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communities') THEN
        CREATE TABLE communities (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          cause_description TEXT NOT NULL,
          target_amount DECIMAL(10,2) NOT NULL,
          current_amount DECIMAL(10,2) DEFAULT 0,
          image_url VARCHAR(255) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END$$;

-- Création de la table vip_levels si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vip_levels') THEN
        CREATE TABLE vip_levels (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          level INTEGER NOT NULL UNIQUE,
          points_required INTEGER NOT NULL,
          cashback_rate DECIMAL(5,2) NOT NULL,
          bonus_multiplier DECIMAL(5,2) NOT NULL,
          exclusive_promotions BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END$$;

-- Création de la table super_lot_entries si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'super_lot_entries') THEN
        CREATE TABLE super_lot_entries (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES profiles(id),
          promotion_id UUID NOT NULL REFERENCES promotions(id),
          tickets_count INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, promotion_id)
        );
    END IF;
END$$;

-- Ajout de la colonne vip_level_id aux profils si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'vip_level_id') THEN
        ALTER TABLE profiles ADD COLUMN vip_level_id UUID REFERENCES vip_levels(id);
    END IF;
END$$;

-- Création ou mise à jour du trigger pour le niveau VIP
CREATE OR REPLACE FUNCTION update_vip_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le niveau VIP si les points ont changé
  IF (TG_OP = 'UPDATE' AND NEW.points IS DISTINCT FROM OLD.points) OR TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET vip_level_id = (
      SELECT id FROM vip_levels
      WHERE points_required <= NEW.points
      ORDER BY points_required DESC
      LIMIT 1
    )
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Suppression du trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_update_vip_level ON profiles;

-- Création du trigger
CREATE TRIGGER trigger_update_vip_level
AFTER INSERT OR UPDATE OF points ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_vip_level();

-- Création ou mise à jour de la fonction pour ajouter des tickets au super lot
CREATE OR REPLACE FUNCTION add_super_lot_tickets(p_user_id UUID, p_promotion_id UUID, p_tickets INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO super_lot_entries (user_id, promotion_id, tickets_count)
  VALUES (p_user_id, p_promotion_id, p_tickets)
  ON CONFLICT (user_id, promotion_id)
  DO UPDATE SET tickets_count = super_lot_entries.tickets_count + p_tickets;
END;
$$;

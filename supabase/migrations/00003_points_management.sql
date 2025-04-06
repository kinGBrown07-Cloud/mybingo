-- Table pour gérer la caisse administrative
CREATE TABLE admin_treasury (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    points_balance INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    min_required_balance INTEGER NOT NULL DEFAULT 0
);

-- Insertion du solde initial
INSERT INTO admin_treasury (points_balance, min_required_balance)
SELECT 
    (SELECT SUM(points_cost * stock) * 4 FROM prizes WHERE is_active = true) as initial_balance,
    (SELECT SUM(points_cost * stock) * 4 FROM prizes WHERE is_active = true) as min_balance;

-- Fonction pour mettre à jour le solde minimum requis
CREATE OR REPLACE FUNCTION update_min_required_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE admin_treasury
    SET min_required_balance = (
        SELECT SUM(points_cost * stock) * 4
        FROM prizes
        WHERE is_active = true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le solde minimum quand les prix changent
CREATE TRIGGER update_min_balance_on_prize_change
    AFTER INSERT OR UPDATE OR DELETE ON prizes
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_min_required_balance();

-- Fonction pour attribuer des points à un utilisateur
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_points INTEGER,
    p_game_session_id UUID,
    p_description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_treasury_balance INTEGER;
    v_min_required INTEGER;
BEGIN
    -- Vérifie le solde de la caisse
    SELECT points_balance, min_required_balance 
    INTO v_treasury_balance, v_min_required
    FROM admin_treasury LIMIT 1;

    -- Vérifie si le solde reste suffisant après l'attribution des points
    IF (v_treasury_balance - p_points) < v_min_required THEN
        RETURN FALSE;
    END IF;

    -- Débite la caisse
    UPDATE admin_treasury
    SET points_balance = points_balance - p_points,
        last_updated = NOW();

    -- Crédite l'utilisateur
    UPDATE users
    SET points = points + p_points
    WHERE id = p_user_id;

    -- Enregistre la transaction
    INSERT INTO transactions (
        user_id,
        game_session_id,
        type,
        points_amount,
        description
    ) VALUES (
        p_user_id,
        p_game_session_id,
        'win',
        p_points,
        p_description
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour échanger des points contre un lot
CREATE OR REPLACE FUNCTION claim_prize(
    p_user_id UUID,
    p_prize_id UUID,
    p_game_session_id UUID,
    p_shipping_address TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_prize_cost INTEGER;
    v_user_points INTEGER;
    v_prize_stock INTEGER;
BEGIN
    -- Récupère les informations nécessaires
    SELECT points_cost, stock INTO v_prize_cost, v_prize_stock
    FROM prizes
    WHERE id = p_prize_id AND is_active = true;

    SELECT points INTO v_user_points
    FROM users
    WHERE id = p_user_id;

    -- Vérifie les conditions
    IF v_prize_stock <= 0 THEN
        RETURN FALSE;
    END IF;

    IF v_user_points < v_prize_cost THEN
        RETURN FALSE;
    END IF;

    -- Débite les points de l'utilisateur
    UPDATE users
    SET points = points - v_prize_cost
    WHERE id = p_user_id;

    -- Décrémente le stock
    UPDATE prizes
    SET stock = stock - 1
    WHERE id = p_prize_id;

    -- Crée l'entrée dans user_prizes
    INSERT INTO user_prizes (
        user_id,
        prize_id,
        game_session_id,
        shipping_address,
        status
    ) VALUES (
        p_user_id,
        p_prize_id,
        p_game_session_id,
        p_shipping_address,
        'pending'
    );

    -- Enregistre la transaction
    INSERT INTO transactions (
        user_id,
        game_session_id,
        type,
        points_amount,
        description
    ) VALUES (
        p_user_id,
        p_game_session_id,
        'loss',
        v_prize_cost,
        'Échange de points contre lot: ' || (SELECT name FROM prizes WHERE id = p_prize_id)
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les points gagnés selon le type de jeu
CREATE OR REPLACE FUNCTION calculate_game_points(
    p_game_type game_type,
    p_cards_turned INTEGER
)
RETURNS INTEGER AS $$
BEGIN
    -- 1 point par carte retournée pour tous les jeux
    RETURN p_cards_turned;
END;
$$ LANGUAGE plpgsql;

-- Vue pour voir les statistiques des lots par catégorie
CREATE OR REPLACE VIEW prize_statistics AS
SELECT 
    p.category,
    COUNT(DISTINCT p.id) as total_prizes,
    SUM(p.stock) as available_stock,
    COUNT(DISTINCT up.id) as claimed_prizes,
    ROUND(AVG(p.points_cost)) as avg_points_cost,
    MIN(p.points_cost) as min_points_cost,
    MAX(p.points_cost) as max_points_cost
FROM prizes p
LEFT JOIN user_prizes up ON p.id = up.prize_id
WHERE p.is_active = true
GROUP BY p.category
ORDER BY p.category;

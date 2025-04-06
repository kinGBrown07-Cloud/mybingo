-- Insertion des lots pour Classic Cards (Kits alimentaires)
INSERT INTO prizes (name, description, category, points_cost, stock, image_url) VALUES
('Kit Alimentaire Essentiel', 'Un assortiment de produits alimentaires de base', 'classic', 100, 50, '/images/prizes/classic/food-kit-basic.jpg'),
('Kit Gourmet', 'Une sélection de produits fins et délicatesses', 'classic', 200, 30, '/images/prizes/classic/food-kit-gourmet.jpg'),
('Panier Bio', 'Un assortiment de produits biologiques locaux', 'classic', 150, 40, '/images/prizes/classic/food-kit-bio.jpg'),
('Bon d''Achat Supermarché', 'Bon d''achat valable dans nos supermarchés partenaires', 'classic', 100, 100, '/images/prizes/classic/food-voucher.jpg');

-- Insertion des lots pour Magic Fortune (Vêtements et accessoires de marque)
INSERT INTO prizes (name, description, category, points_cost, stock, image_url) VALUES
('Sac de Luxe', 'Sac à main de créateur', 'magic', 500, 10, '/images/prizes/magic/luxury-bag.jpg'),
('Montre Fashion', 'Montre tendance de marque', 'magic', 400, 15, '/images/prizes/magic/fashion-watch.jpg'),
('Ensemble Sportswear', 'Tenue complète de marque premium', 'magic', 300, 20, '/images/prizes/magic/sportswear.jpg'),
('Accessoires Tendance', 'Lot d''accessoires de marque (ceinture, portefeuille, etc.)', 'magic', 250, 25, '/images/prizes/magic/accessories.jpg'),
('Sneakers Edition Limitée', 'Baskets en édition limitée', 'magic', 450, 12, '/images/prizes/magic/limited-sneakers.jpg');

-- Insertion des lots pour Gold Digger (Lots exceptionnels)
INSERT INTO prizes (name, description, category, points_cost, stock, image_url) VALUES
('Voiture Citadine', 'Voiture compacte neuve', 'gold', 10000, 2, '/images/prizes/gold/city-car.jpg'),
('Voyage de Luxe', 'Séjour all-inclusive pour 2 personnes', 'gold', 5000, 5, '/images/prizes/gold/luxury-trip.jpg'),
('Smart TV OLED', 'Téléviseur haut de gamme 65 pouces', 'gold', 3000, 8, '/images/prizes/gold/oled-tv.jpg'),
('Console de Jeu Premium', 'Dernière console de jeu avec accessoires', 'gold', 2000, 10, '/images/prizes/gold/gaming-console.jpg'),
('Smartphone Haut de Gamme', 'Dernier modèle de smartphone premium', 'gold', 2500, 10, '/images/prizes/gold/premium-phone.jpg'),
('Week-end Spa', 'Week-end bien-être pour 2 personnes', 'gold', 1500, 15, '/images/prizes/gold/spa-weekend.jpg');

-- Création d'une vue pour vérifier la valeur totale des lots disponibles
CREATE OR REPLACE VIEW prize_value_summary AS
SELECT
    category,
    SUM(points_cost * stock) as total_value,
    COUNT(*) as prize_count,
    SUM(stock) as total_stock
FROM prizes
WHERE is_active = true
GROUP BY category
ORDER BY total_value DESC;

-- Fonction pour vérifier si un gain peut être autorisé
CREATE OR REPLACE FUNCTION can_award_prize(prize_id UUID, admin_balance INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    prize_value INTEGER;
    total_prize_value INTEGER;
BEGIN
    -- Récupère la valeur du lot spécifique
    SELECT points_cost INTO prize_value
    FROM prizes
    WHERE id = prize_id AND is_active = true;

    -- Récupère la valeur totale de tous les lots disponibles
    SELECT SUM(points_cost * stock) INTO total_prize_value
    FROM prizes
    WHERE is_active = true;

    -- Vérifie si le solde administratif est suffisant (4 fois la valeur totale des lots)
    RETURN admin_balance >= (total_prize_value * 4);
END;
$$ LANGUAGE plpgsql;

import { Region, Currency, RewardType, Reward } from '@/types/rewards';
import { NextRequest, NextResponse } from 'next/server';

// Taux de conversion des points selon les régions
const pointsConversionRates = {
  [Region.AFRICA_SUB]: { points: 3, value: 300, currency: Currency.XOF },
  [Region.AFRICA_NORTH]: { points: 3, value: 500, currency: Currency.XOF },
  [Region.EUROPE]: { points: 3, value: 2, currency: Currency.EURO },
  [Region.ASIA]: { points: 3, value: 2, currency: Currency.DOLLAR },
  [Region.AMERICA]: { points: 3, value: 2, currency: Currency.DOLLAR },
};

// Catalogue des récompenses alimentaires
const foodRewards: Reward[] = [
  {
    id: "food-1",
    type: RewardType.FOOD,
    name: "Sac de riz premium",
    description: "Sac de riz de qualité supérieure (25kg)",
    value: 50,
    image: "https://ext.same-assets.com/3982680000/1071144000.png"
  },
  {
    id: "food-2",
    type: RewardType.FOOD,
    name: "Pack de pâtes",
    description: "Assortiment de pâtes italiennes (10kg)",
    value: 30,
    image: "https://ext.same-assets.com/841830000/394320000.png"
  },
  {
    id: "food-3",
    type: RewardType.FOOD,
    name: "Huile d'olive vierge",
    description: "Huile d'olive extra vierge (5L)",
    value: 45,
    image: "https://ext.same-assets.com/3039654000/4047120000.png"
  },
  {
    id: "food-4",
    type: RewardType.FOOD,
    name: "Pack conserves",
    description: "Assortiment de conserves de tomates et sardines",
    value: 35,
    image: "https://ext.same-assets.com/137952000/3108964000.png"
  },
];

// Catalogue des récompenses vestimentaires
const clothingRewards: Reward[] = [
  {
    id: "clothing-1",
    type: RewardType.CLOTHING,
    name: "Montre élégante",
    description: "Montre analogique de marque",
    value: 120,
    image: "https://ext.same-assets.com/1994760000/1773891000.png"
  },
  {
    id: "clothing-2",
    type: RewardType.CLOTHING,
    name: "Chaussures de luxe",
    description: "Paire de chaussures de designer",
    value: 150,
    image: "https://ext.same-assets.com/3108964000/137952000.png"
  },
  {
    id: "clothing-3",
    type: RewardType.CLOTHING,
    name: "Veste tendance",
    description: "Veste en cuir de qualité supérieure",
    value: 200,
    image: "https://ext.same-assets.com/1242873736/1584893613.jpeg"
  },
  {
    id: "clothing-4",
    type: RewardType.CLOTHING,
    name: "Bracelet de luxe",
    description: "Bracelet en or 18 carats",
    value: 250,
    image: "https://ext.same-assets.com/659082293/1969560824.jpeg"
  },
  {
    id: "clothing-5",
    type: RewardType.CLOTHING,
    name: "Robe de soirée",
    description: "Robe de grande marque pour occasions spéciales",
    value: 300,
    image: "https://ext.same-assets.com/1552588343/1770970808.jpeg"
  },
];

// Le super-lot actuel
const jackpotReward: Reward = {
  id: "jackpot-1",
  type: RewardType.JACKPOT,
  name: "Scooter Électrique Vespa",
  description: "Vespa Elettrica, autonomie jusqu'à 100km, 0 émission",
  value: 7000,
  image: "https://ext.same-assets.com/3747852000/1986124000.jpeg"
};

// État de la caisse de l'administration (dans un environnement réel, ce serait une base de données)
const adminTreasury = {
  balance: 50000, // Solde initial de 50,000 unités
  lastUpdated: new Date()
};

// Route pour ajouter des fonds à la caisse
export async function POST(request: NextRequest) {
  const { amount } = await request.json();

  if (!amount || typeof amount !== 'number') {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
  }

  adminTreasury.balance += amount;
  adminTreasury.lastUpdated = new Date();

  return NextResponse.json({ success: true, balance: adminTreasury.balance });
}

// Route pour obtenir une récompense basée sur des points
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const points = parseInt(searchParams.get('points') || '0');
  const region = searchParams.get('region') as Region || Region.EUROPE;
  const rewardType = searchParams.get('type') as RewardType | null;

  if (points <= 0) {
    return NextResponse.json({ error: 'Points invalides' }, { status: 400 });
  }

  // Convertir les points en valeur monétaire selon la région
  const rate = pointsConversionRates[region];
  const valuePerPoint = rate.value / rate.points;
  const value = points * valuePerPoint;
  const currency = rate.currency;

  // Vérifier si la caisse a suffisamment de fonds
  if (adminTreasury.balance < value * 3) {
    return NextResponse.json({
      success: false,
      reward: null,
      cashValue: value,
      currency
    });
  }

  let reward: Reward | null = null;

  // Si un type de récompense est spécifié
  if (rewardType) {
    switch (rewardType) {
      case RewardType.FOOD:
        reward = foodRewards[Math.floor(Math.random() * foodRewards.length)];
        break;
      case RewardType.CLOTHING:
        reward = clothingRewards[Math.floor(Math.random() * clothingRewards.length)];
        break;
      case RewardType.JACKPOT:
        reward = jackpotReward;
        break;
      default:
        // Aucun type valide spécifié
        break;
    }

    // Si une récompense est disponible et que la caisse a suffisamment de fonds
    if (reward && adminTreasury.balance >= reward.value * 3) {
      adminTreasury.balance -= reward.value;
      return NextResponse.json({
        success: true,
        reward,
        cashValue: value,
        currency
      });
    }
  }

  // Si aucun type n'est spécifié ou si la récompense spécifiée n'est pas disponible,
  // sélectionner aléatoirement parmi les types disponibles
  const typeIndex = Math.floor(Math.random() * 3); // 0: nourriture, 1: vêtements, 2: jackpot

  switch (typeIndex) {
    case 0:
      reward = foodRewards[Math.floor(Math.random() * foodRewards.length)];
      break;
    case 1:
      reward = clothingRewards[Math.floor(Math.random() * clothingRewards.length)];
      break;
    case 2:
      reward = jackpotReward;
      break;
    default:
      reward = null;
  }

  // Si une récompense est disponible et que la caisse a suffisamment de fonds
  if (reward && adminTreasury.balance >= reward.value * 3) {
    adminTreasury.balance -= reward.value;
    return NextResponse.json({
      success: true,
      reward,
      cashValue: value,
      currency
    });
  }

  // Si aucune récompense n'est disponible ou si la caisse n'a pas suffisamment de fonds,
  // offrir la valeur en espèces si la caisse peut se le permettre
  if (adminTreasury.balance >= value * 3) {
    adminTreasury.balance -= value;
    return NextResponse.json({
      success: true,
      reward: {
        id: "cash-reward",
        type: RewardType.CASH,
        name: "Récompense en espèces",
        description: `Valeur en ${currency}`,
        value,
        image: "https://ext.same-assets.com/841830000/394320000.png"
      },
      cashValue: value,
      currency
    });
  }

  // Si tout échoue, retourner un objet indiquant l'échec
  return NextResponse.json({
    success: false,
    reward: null,
    cashValue: value,
    currency
  });
}

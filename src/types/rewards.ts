// Types de récompenses
export enum RewardType {
  FOOD = "food",
  CLOTHING = "clothing",
  JACKPOT = "jackpot",
  CASH = "cash"
}

// Régions géographiques
export enum Region {
  AFRICA_SUB = "africa_sub", // Afrique noire
  AFRICA_NORTH = "africa_north", // Afrique blanche
  EUROPE = "europe",
  ASIA = "asia",
  AMERICA = "america"
}

// Types de devises
export enum Currency {
  XOF = "XOF",
  EURO = "€",
  DOLLAR = "$"
}

// Interface pour une récompense
export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  value: number; // Valeur monétaire équivalente
  image: string;
}

// Interface pour la réponse de récompense
export interface RewardResponse {
  success: boolean;
  reward: Reward | null;
  cashValue: number;
  currency: Currency;
}

// Interface pour les taux de conversion selon les régions
export interface ConversionRate {
  points: number;
  value: number;
  currency: Currency;
}

// Interface pour le trésor administratif
export interface AdminTreasury {
  balance: number;
  lastUpdated: Date;
}

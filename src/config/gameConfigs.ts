// Types de jeux et leurs configurations
export type GameType = 'FOODS' | 'MODE' | 'JACKPOT';

interface GameConfig {
  name: string;
  description: string;
  minBet: number;
  minCoinBet: number;
  cardCount: number;
  prizes: number[];
  winChance: number;
}

export const gameConfigs: Record<GameType, GameConfig> = {
  FOODS: {
    name: "Foods Cards",
    description: "Gagnez des kits alimentaires de qualité ou leur équivalent en argent.",
    minBet: 2,
    minCoinBet: 200, // Equivalent en Coins
    cardCount: 9,
    prizes: [5, 10, 20, 50, 75, 100],
    winChance: 0.15, // 15% de chance de gagner
  },
  MODE: {
    name: "Mode Cards",
    description: "Remportez des vêtements tendance et accessoires de marque.",
    minBet: 2,
    minCoinBet: 200, // Equivalent en Coins
    cardCount: 12,
    prizes: [10, 25, 50, 100, 150, 200],
    winChance: 0.12, // 12% de chance de gagner
  },
  JACKPOT: {
    name: "Jackpot Cards",
    description: "Tentez votre chance pour gagner des lots exceptionnels!",
    minBet: 2,
    minCoinBet: 200, // Equivalent en Coins
    cardCount: 16,
    prizes: [50, 100, 500, 1000, 2000, 3800],
    winChance: 0.1, // 10% de chance de gagner
  }
};

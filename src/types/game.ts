import type { Database } from './database';
import { Prisma } from '@prisma/client';

// Types de jeux disponibles
export const GameTypes = {
  CLASSIC: 'CLASSIC',
  MAGIC: 'MAGIC',
  GOLD: 'GOLD'
} as const;

export type GameType = typeof GameTypes[keyof typeof GameTypes];

export interface GameConfig {
  type: GameType;
  gridSize: number;
  name: string;
  minBet: number;
  prize: number;
  maxFlips: number;
  minFlips: number;
  flipCost: number;
  winningImage: string;
}

export const GAME_CONFIGS = {
  [GameTypes.CLASSIC]: {
    type: GameTypes.CLASSIC,
    gridSize: 9,
    name: 'Classic Game',
    minBet: 5,
    prize: 100,
    maxFlips: 10,
    minFlips: 2,
    flipCost: 1,
    winningImage: 'classic-card'
  },
  [GameTypes.MAGIC]: {
    type: GameTypes.MAGIC,
    gridSize: 12,
    name: 'Magic Game',
    minBet: 10,
    prize: 200,
    maxFlips: 10,
    minFlips: 2,
    flipCost: 1,
    winningImage: 'magic-card'
  },
  [GameTypes.GOLD]: {
    type: GameTypes.GOLD,
    gridSize: 16,
    name: 'Gold Game',
    minBet: 20,
    prize: 3800,
    maxFlips: 10,
    minFlips: 2,
    flipCost: 1,
    winningImage: 'gold-card'
  }
} as const;

export interface Card {
  id: string;
  index: number;
  isFlipped: boolean;
  isWinning: boolean;
  prize: number | null;
  type: GameType;
  image: string;
}

export interface Prize {
  name: string;
  value: number;
}

export interface GameSession {
  id: string;
  userId: string;
  gameType: GameType;
  hasWon: boolean;
  prize: number;
  createdAt: string;
  updatedAt: string;
}

export type CardFlip = Database['public']['Tables']['card_flips']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];

export interface GameState {
  currentSession: GameSession | null;
  cards: Card[];
  flippedCards: number;
  hasWon: boolean;
  currentPrize: Prize | null;
  isGameOver: boolean;
}

export interface GameControls {
  betAmount: number;
  useCoins: boolean;
  isPlaying: boolean;
}

export interface GameResult {
  won: boolean;
  prize?: number;
}

export interface TransactionType {
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'REFUND';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

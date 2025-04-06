export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  hashedPassword?: string;
  authProvider: 'EMAIL' | 'GOOGLE' | 'FACEBOOK';
  authProviderId?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile?: Profile;
  settings?: UserSettings;
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  country: string;
  region: string;
  currency: string;
  coins: number;
  points: number;
  pointsRate: number;
  vipLevelId: string | null;
  referrerId: string | null;
  termsAccepted: boolean;
  termsAcceptedAt: Date | null;
  referralCode: string | null;
  image_url: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  notifications: boolean;
  soundEnabled: boolean;
  volume: number;
  darkMode: boolean;
  language: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Region = 'BLACK_AFRICA' | 'NORTH_AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA';
export type Currency = 'XOF' | 'MAD' | 'EUR' | 'USD';

export interface GameSession {
  id: string;
  profileId: string;
  type: 'FOODS' | 'MODE' | 'JACKPOT';
  points: number;
  hasWon: boolean;
  matchedPairs: number;
  createdAt: Date;
  updatedAt: Date;
  cardFlips: CardFlip[];
}

export interface CardFlip {
  id: string;
  gameSessionId: string;
  cardIndex: number;
  isWinning: boolean;
  prizeAmount: number | null;
  flippedAt: Date;
}

export interface Transaction {
  id: string;
  profileId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'REFUND';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  currency: 'XOF' | 'MAD' | 'EUR' | 'USD';
  gameSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameStats {
  totalGames: number;
  winCount: number;
  lossCount: number;
  totalBetAmount: number;
  totalWinAmount: number;
  biggestWin: number;
  winRate: number;
}

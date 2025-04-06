export enum Region {
  BLACK_AFRICA = 'BLACK_AFRICA',
  NORTH_AFRICA = 'NORTH_AFRICA',
  EUROPE = 'EUROPE',
  AMERICAS = 'AMERICAS',
  ASIA = 'ASIA'
}

export enum Currency {
  XOF = 'XOF',
  MAD = 'MAD',
  EUR = 'EUR',
  USD = 'USD'
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK'
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  country: string;
  coins: number;
  points: number;
  vipLevel: number;
  isVip: boolean;
  imageUrl: string | null;
  vipLevelId: string | null;
  referrerId: string | null;
  termsAccepted: boolean;
  termsAcceptedAt: Date | null;
  referralCode: string | null;
  birthdate: Date | null;
  region: Region;
  currency: Currency;
  pointsRate: number;
  createdAt: Date;
  updatedAt: Date;
}

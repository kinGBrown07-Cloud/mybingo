export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK'
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export interface LoginData {
  email: string;
  password?: string;
  provider: AuthProvider;
  providerToken?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  birthdate?: string;
  country: string;
  region: string;
  currency: string;
  acceptTerms: boolean;
  referralCode?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  birthDate?: Date;
  country: string;
  region: string;
  currency: string;
  coins: number;
  points: number;
  pointsRate: number;
  termsAccepted: boolean;
  termsAcceptedAt: Date;
  referralCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expires: Date;
  createdAt: Date;
  lastActivity: Date;
}

export interface VerificationToken {
  id: string;
  userId: string;
  token: string;
  expires: Date;
  createdAt: Date;
}

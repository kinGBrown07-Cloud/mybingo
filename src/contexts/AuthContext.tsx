"use client";

import { createContext, useContext, ReactNode } from 'react';
import { Profile } from '@prisma/client';
import { useAuth } from '@/hooks/useAuth';

interface AuthResponse {
  profile: Profile | null;
  error: string | null;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  country: string;
  region: 'BLACK_AFRICA' | 'NORTH_AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA';
  currency?: 'XOF' | 'MAD' | 'EUR' | 'USD';
  referralCode?: string;
  acceptTerms: boolean;
}

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (data: SignUpData) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

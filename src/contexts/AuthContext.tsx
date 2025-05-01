"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RegistrationData } from '@/services/authService';
import { UserProfile } from '@/services/authService';

interface AuthResult {
  success: boolean;
  message?: string;
  user?: UserProfile;
  profile?: UserProfile;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegistrationData) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<AuthResult | { success: boolean; profile: null }>;
  clearMessages: () => void;
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

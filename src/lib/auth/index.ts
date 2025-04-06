'use client';

import { Profile, Region, Currency } from '@prisma/client';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  birthdate?: string;
  country: string;
  region: Region;
  currency: Currency;
  acceptTerms: boolean;
  referralCode?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  token?: string;
  profile?: Omit<Profile, 'hashedPassword'>;
}

class Auth {
  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Une erreur est survenue lors de l\'inscription'
        };
      }

      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de l\'inscription'
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Email ou mot de passe incorrect'
        };
      }

      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de la connexion'
      };
    }
  }

  async getCurrentUser(token: string): Promise<Profile | null> {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.profile;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}

export const auth = new Auth();

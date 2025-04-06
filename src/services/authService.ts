'use client';

import { authOptions } from '@/lib/auth';
import { cookieHelper } from '@/lib/client-cookies';
import { prisma } from '@/lib/db';

// Types pour les énumérations
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

// Interface pour le profil utilisateur
export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  birthdate: Date | null;
  country: string;
  region: Region;
  currency: Currency;
  coins: number;
  points: number;
  pointsRate: number;
  vipLevelId: string | null;
  referrerId: string | null;
  termsAccepted: boolean;
  termsAcceptedAt: Date | null;
  referralCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les données d'inscription
export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  birthdate: string;
  country: string;
  region: Region;
  currency: Currency;
  isOver18: boolean;
  acceptTerms: boolean;
  referralCode?: string;
}

// Interface pour la réponse d'inscription/connexion
export interface AuthResult {
  success: boolean;
  message: string;
  profile?: UserProfile;
  authenticated?: boolean;
  userId?: string;
}

/**
 * Vérifie si un email est déjà utilisé
 */
async function isEmailInUse(email: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

/**
 * Crée un compte utilisateur
 */
export async function registerUser(data: RegistrationData): Promise<AuthResult> {
  try {
    // Vérifier si l'email est déjà utilisé
    if (await isEmailInUse(data.email)) {
      return {
        success: false,
        message: 'Cette adresse email est déjà utilisée'
      };
    }

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
        message: result.error || 'Une erreur est survenue lors de l\'inscription',
      };
    }

    // Sauvegarder le token
    cookieHelper.setAuthCookie(result.token);

    return {
      success: true,
      message: 'Inscription réussie',
      profile: result.profile,
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: 'Une erreur est survenue lors de l\'inscription',
    };
  }
}

/**
 * Connecte un utilisateur
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || 'Email ou mot de passe incorrect',
      };
    }

    // Sauvegarder le token
    if (result.token) {
      cookieHelper.setAuthCookie(result.token);
    }

    // Vérifier que le profil est présent
    if (!result.profile) {
      return {
        success: false,
        message: 'Profil non trouvé',
      };
    }

    // Redirection après connexion réussie
    window.location.href = '/dashboard';

    return {
      success: true,
      message: 'Connexion réussie',
      profile: result.profile,
      authenticated: true
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Une erreur est survenue lors de la connexion',
    };
  }
}

/**
 * Déconnecte l'utilisateur
 */
export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    cookieHelper.removeAuthCookie();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Vérifie si un utilisateur est authentifié
 */
export async function isAuthenticated(): Promise<AuthResult> {
  const token = cookieHelper.getAuthCookie();
  if (!token) {
    return {
      success: false,
      message: 'Non authentifié',
      authenticated: false
    };
  }

  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    const result = await response.json();

    if (!response.ok) {
      cookieHelper.removeAuthCookie();
      return {
        success: false,
        message: 'Non authentifié',
        authenticated: false
      };
    }

    if (!result.profile) {
      cookieHelper.removeAuthCookie();
      return {
        success: false,
        message: 'Profil non trouvé',
        authenticated: false
      };
    }

    return {
      success: true,
      message: 'Authentifié',
      authenticated: true,
      profile: result.profile,
      userId: result.profile.userId
    };
  } catch (error) {
    console.error('Auth check error:', error);
    cookieHelper.removeAuthCookie();
    return {
      success: false,
      message: 'Une erreur est survenue lors de la vérification de l\'authentification',
      authenticated: false
    };
  }
}

/**
 * Récupère les informations du profil utilisateur
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const token = cookieHelper.getAuthCookie();
    if (!token) {
      return null;
    }

    const response = await fetch('/api/auth/profile');
    const result = await response.json();

    if (!response.ok) {
      return null;
    }

    return result.profile;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
}

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import type { User } from '@supabase/supabase-js';

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

// Interface pour la réponse d'authentification
export interface AuthResult {
  success: boolean;
  message: string;
  profile?: UserProfile;
  authenticated?: boolean;
  userId?: string;
}

const supabase = createClientComponentClient<Database>();

/**
 * Vérifie si un email est déjà utilisé
 */
async function isEmailInUse(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

// Fonction de validation du mot de passe
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  return { valid: true };
}

/**
 * Crée un compte utilisateur
 */
export async function registerUser(data: RegistrationData): Promise<AuthResult> {
  try {
    // Validation du mot de passe
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      return {
        success: false,
        message: passwordValidation.message || 'Mot de passe invalide'
      };
    }

    // Vérifier si l'email est déjà utilisé
    if (await isEmailInUse(data.email)) {
      return {
        success: false,
        message: 'Cette adresse email est déjà utilisée'
      };
    }

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          birthdate: data.birthdate,
          country: data.country,
          region: data.region,
          currency: data.currency,
          is_over_18: data.isOver18,
          accept_terms: data.acceptTerms,
          referral_code: data.referralCode
        }
      }
    });

    if (authError) throw authError;

    // Créer le profil utilisateur
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user?.id,
        username: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}`,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        birthdate: data.birthdate,
        country: data.country,
        region: data.region,
        currency: data.currency,
        coins: 0,
        points: 0,
        points_rate: 1.0,
        terms_accepted: data.acceptTerms,
        terms_accepted_at: new Date().toISOString(),
        referral_code: data.referralCode
      })
      .select()
      .single();

    if (profileError) throw profileError;

    return {
      success: true,
      message: 'Inscription réussie',
      profile: profileData,
      userId: authData.user?.id
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription'
    };
  }
}

/**
 * Connecte un utilisateur
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    if (!email || !password) {
      return {
        success: false,
        message: 'Email et mot de passe requis'
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Récupérer le profil utilisateur
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      success: true,
      message: 'Connexion réussie',
      profile: profileData,
      authenticated: true,
      userId: data.user.id
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Email ou mot de passe incorrect'
    };
  }
}

/**
 * Déconnecte l'utilisateur
 */
export async function logoutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Vérifie si un utilisateur est authentifié
 */
export async function isAuthenticated(): Promise<AuthResult> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return {
        success: false,
        message: 'Non authentifié',
        authenticated: false
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return {
        success: false,
        message: 'Profil non trouvé',
        authenticated: false
      };
    }

    return {
      success: true,
      message: 'Authentifié',
      profile,
      authenticated: true,
      userId: user.id
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      success: false,
      message: 'Erreur de vérification d\'authentification',
      authenticated: false
    };
  }
}

/**
 * Récupère le profil d'un utilisateur
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

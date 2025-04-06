import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, userService } from '@/lib/supabase';
import type { Profile } from '@/types/database';

interface UseSupabaseReturn {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useSupabase(): UseSupabaseReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Récupérer l'utilisateur actuel
    const getCurrentUser = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const userProfile = await userService.getProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const userProfile = await userService.getProfile(session.user.id);
          setProfile(userProfile);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue lors de la déconnexion'));
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await userService.getProfile(user.id);
      setProfile(userProfile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue lors du rafraîchissement du profil'));
    }
  };

  return {
    user,
    profile,
    isLoading,
    error,
    signOut,
    refreshProfile
  };
}

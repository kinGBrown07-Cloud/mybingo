'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import type { Database } from '@/types/database';

interface Profile {
  id: string;
  balance: number;
  coins: number;
}

export function useSupabase() {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Mock user data for development
    const mockUser = {
      id: 'mock-user-id',
      email: 'user@example.com'
    };

    const mockProfile = {
      id: mockUser.id,
      balance: 1000,
      coins: 5000
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setLoading(false);
  }, []);

  return {
    user,
    profile,
    loading,
    error
  };
}
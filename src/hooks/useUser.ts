"use client";

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { Profile } from '@prisma/client';

interface JwtPayload {
  userId: string;
  email: string;
  exp: number;
}

export function useUser() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Vérifier le cookie auth_token
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];

        if (token) {
          // Décoder le token et vérifier l'expiration
          const decoded = jwtDecode<JwtPayload>(token);
          const isExpired = decoded.exp * 1000 < Date.now();

          if (!isExpired) {
            // Charger le profil utilisateur
            const response = await fetch('/api/auth/me');
            if (response.ok) {
              const profile = await response.json();
              setUser(profile);
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return { user, loading };
}

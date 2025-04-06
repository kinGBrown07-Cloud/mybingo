'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userService } from '@/lib/db-service';

interface GlobalBalanceStore {
  coins: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
  userId: string | null;
  setCoins: (coins: number) => void;
  updateCoins: (delta: number) => Promise<void>;
  fetchBalance: (userId: string) => Promise<void>;
  syncBalance: () => Promise<void>;
}

export const useGlobalBalance = create<GlobalBalanceStore>()(
  persist(
    (set, get) => ({
      coins: 0,
      isLoading: false,
      error: null,
      lastUpdated: 0,
      userId: null,
      setCoins: (coins: number) => set({ coins, lastUpdated: Date.now() }),
      updateCoins: async (delta: number) => {
        const currentCoins = get().coins;
        const newCoins = currentCoins + delta;
        set({ coins: newCoins, lastUpdated: Date.now() });

        // Mettre à jour le profil dans la base de données
        const userId = get().userId;
        if (userId) {
          try {
            await userService.updateProfile(userId, { coins: newCoins });
          } catch (error) {
            set({ error: 'Erreur lors de la mise à jour du solde' });
          }
        }
      },
      fetchBalance: async (userId: string) => {
        set({ isLoading: true, error: null, userId });
        try {
          const profile = await userService.getProfile(userId);
          if (profile) {
            set({ 
              coins: profile.coins,
              lastUpdated: Date.now()
            });
          }
        } catch (error) {
          set({ error: 'Erreur lors de la récupération du solde' });
        } finally {
          set({ isLoading: false });
        }
      },
      syncBalance: async () => {
        const { userId, lastUpdated } = get();
        if (!userId || Date.now() - lastUpdated < 5000) return; // Ne pas synchroniser plus d'une fois toutes les 5 secondes

        set({ isLoading: true, error: null });
        try {
          const profile = await userService.getProfile(userId);
          if (profile && profile.coins !== get().coins) {
            set({ 
              coins: profile.coins,
              lastUpdated: Date.now()
            });
          }
        } catch (error) {
          set({ error: 'Erreur lors de la synchronisation du solde' });
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'user-balance',
      skipHydration: true,
    }
  )
);

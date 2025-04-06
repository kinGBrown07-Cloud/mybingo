'use client';

import { create } from 'zustand';

interface BalanceStore {
  coins: number;
  setCoins: (coins: number) => void;
  updateCoins: (delta: number) => void;
}

export const useBalance = create<BalanceStore>((set: any) => ({
  coins: 0,
  setCoins: (coins: number) => set({ coins }),
  updateCoins: (delta: number) => set((state: BalanceStore) => ({ coins: state.coins + delta })),
}));

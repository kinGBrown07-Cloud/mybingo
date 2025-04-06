'use client';

import { useState, useEffect } from 'react';

interface Profile {
  id: string;
  balance: number;
  coins: number;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'REFUND';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  completed_at: string | null;
}

export function useTransactions() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Mock profile data
    setProfile({
      id: 'mock-user-id',
      balance: 1000,
      coins: 5000
    });
  }, []);

  const createTransaction = async (type: Transaction['type'], amount: number): Promise<Transaction> => {
    setIsLoading(true);
    try {
      // Mock transaction creation
      const transaction: Transaction = {
        id: `mock-transaction-${Date.now()}`,
        user_id: 'mock-user-id',
        amount,
        type,
        status: 'COMPLETED',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };

      // Update profile balance
      if (profile) {
        const newBalance = type === 'WIN' || type === 'DEPOSIT'
          ? profile.balance + amount
          : profile.balance - amount;
        setProfile({ ...profile, balance: newBalance });
      }

      setTransactions(prev => [...prev, transaction]);
      return transaction;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getAdminBalance = async (): Promise<number> => {
    // Mock admin balance
    return 5000; // Valeur fixe pour le test
  };

  return {
    profile,
    transactions,
    isLoading,
    error,
    createTransaction,
    getAdminBalance
  };
}
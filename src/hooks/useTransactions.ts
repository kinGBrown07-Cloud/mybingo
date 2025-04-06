import { useState, useEffect } from 'react';
import { transactionService, referralService } from '@/lib/supabase';
import type { Transaction } from '@/types/game';
import type { Profile } from '@/types/database';

export function useTransactions(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const userProfile = await transactionService.getUserProfile(userId);
        setProfile(userProfile);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const createTransaction = async (
    type: Transaction['type'],
    amount: number,
    useCoins: boolean,
    sessionId?: string
  ): Promise<Transaction | null> => {
    if (!userId) return null;

    setIsLoading(true);
    try {
      // Créer la transaction principale
      const transaction = await transactionService.createTransaction(
        userId,
        type,
        amount,
        useCoins ? amount : 0,
        sessionId
      );

      if (!transaction) throw new Error('Failed to create transaction');

      // Si c'est une transaction WIN, vérifier le parrainage
      if (type === 'WIN') {
        const referrer = await referralService.getReferrer(userId);
        if (referrer) {
          const commissionRate = await referralService.getReferralCommissionRate(referrer.id, userId);
          if (commissionRate) {
            const commissionAmount = Math.floor(amount * commissionRate);
            // Créer la transaction de commission pour le parrain
            await referralService.createReferralCommission(
              referrer.id,
              commissionAmount,
              useCoins ? commissionAmount : 0,
              sessionId || ''
            );
          }
        }
      }

      return transaction;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransactionStatus = async (
    transactionId: string,
    status: Transaction['status']
  ): Promise<Transaction | null> => {
    setIsLoading(true);
    try {
      const updatedTransaction = await transactionService.updateTransactionStatus(transactionId, status);
      return updatedTransaction;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    createTransaction,
    updateTransactionStatus
  };
}

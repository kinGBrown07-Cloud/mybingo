import { prisma } from '@/lib/prisma';
import { Region } from '@/lib/constants/regions';
import { Prisma, User, TransactionType } from '@prisma/client';

export type PaymentDetails = {
  userId: string;
  amount: number;
  currency: string;
  points: number;
  bonus?: number;
  region: Region;
};

export type PaymentError = {
  message: string;
  code?: string;
  details?: unknown;
};

export const paypalService = {
  async createOrder(details: PaymentDetails) {
    try {
      // Créer une transaction en attente
      const transaction = await prisma.transaction.create({
        data: {
          userId: details.userId,
          amount: details.amount,
          currency: details.currency,
          points: details.points,
          bonus: details.bonus || 0,
          type: TransactionType.PAYMENT,
          pointsAmount: details.points + (details.bonus || 0),
          description: `Achat de ${details.points} points`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return {
        transactionId: transaction.id,
        amount: details.amount,
        currency: details.currency
      };
    } catch (error) {
      console.error('Erreur lors de la création de la commande PayPal:', error);
      throw new Error('Impossible de créer la commande PayPal');
    }
  },

  async capturePayment(orderId: string, transactionId: string) {
    try {
      // Mettre à jour la transaction
      const transaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          type: TransactionType.PAYMENT,
          description: `Paiement PayPal ${orderId}`,
          updatedAt: new Date()
        }
      });

      // Ajouter les points à l'utilisateur
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          points: {
            increment: transaction.pointsAmount
          },
          updatedAt: new Date()
        }
      });

      return transaction;
    } catch (error) {
      console.error('Erreur lors de la capture du paiement PayPal:', error);
      throw new Error('Impossible de capturer le paiement PayPal');
    }
  },

  async handlePaymentError(transactionId: string, error: PaymentError) {
    try {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          type: TransactionType.PAYMENT_FAILED,
          description: error.message || 'Erreur inconnue',
          updatedAt: new Date()
        }
      });
    } catch (dbError) {
      console.error('Erreur lors de la mise à jour de la transaction:', dbError);
    }
  }
};

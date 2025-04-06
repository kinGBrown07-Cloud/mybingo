import { prisma } from '@/lib/db';
import type { GameSession, Transaction } from '@/types/game';
import { Prisma } from '@prisma/client';

export const userService = {
  async getProfile(userId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });
    return profile;
  },

  async updateProfile(userId: string, data: { coins?: number }) {
    const profile = await prisma.profile.update({
      where: { userId },
      data
    });
    return profile;
  }
};

export const gameService = {
  async createGameSession(userId: string, type: Prisma.GameType, points: number, useCoins: boolean): Promise<GameSession | null> {
    const session = await prisma.gameSession.create({
      data: {
        profile: { connect: { userId } },
        type,
        points,
        hasWon: false,
        matchedPairs: 0
      }
    });

    return {
      id: session.id,
      userId,
      type,
      points,
      hasWon: session.hasWon,
      matchedPairs: session.matchedPairs,
      gameType: type,
      prize: null,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };
  },

  async flipCard(gameSessionId: string, cardIndex: number, isWinning: boolean, prize: number | null) {
    const cardFlip = await prisma.cardFlip.create({
      data: {
        gameSession: { connect: { id: gameSessionId } },
        cardIndex,
        isWinning,
        prize,
        pointsEarned: isWinning ? prize : 0
      }
    });

    // Récupérer la session pour avoir l'ID de l'utilisateur
    const session = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
      include: { profile: true }
    });

    if (session?.profile) {
      // Déduire un point pour le retournement
      await prisma.profile.update({
        where: { id: session.profile.id },
        data: {
          coins: {
            decrement: 1
          }
        }
      });
    }

    return cardFlip;
  },

  async completeGameSession(sessionId: string, hasWon: boolean, prize: number | null) {
    const session = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        hasWon,
        points: prize || 0,
        updatedAt: new Date()
      }
    });

    return {
      id: session.id,
      userId: session.profileId,
      type: session.type,
      points: session.points,
      hasWon: session.hasWon,
      matchedPairs: session.matchedPairs,
      gameType: session.type,
      prize: prize ? { value: prize } : null,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };
  }
};

export const transactionService = {
  async createTransaction(
    userId: string,
    type: Prisma.TransactionType,
    amount: number,
    useCoins: boolean,
    sessionId?: string
  ) {
    const transaction = await prisma.transaction.create({
      data: {
        profile: { connect: { userId } },
        type,
        amount: new Prisma.Decimal(amount),
        useCoins,
        gameSession: sessionId ? { connect: { id: sessionId } } : undefined,
        status: 'PENDING'
      }
    });
    return transaction;
  },

  async updateTransactionStatus(transactionId: string, status: Prisma.TransactionStatus) {
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status }
    });
    return transaction;
  },

  async getUserTransactions(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { profileId: userId },
      orderBy: { createdAt: 'desc' }
    });
    return transactions;
  }
};

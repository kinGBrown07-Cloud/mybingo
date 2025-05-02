import { prisma } from '@/lib/prisma';
import { GameType, Prisma, CommunityTransactionType } from '@prisma/client';
import { recordCommunityTransaction } from './communityService';

export const gameService = {
  async getGameById(gameId: string) {
    return prisma.game.findUnique({
      where: { id: gameId }
    });
  },

  async getAvailableGames() {
    return prisma.game.findMany({
      where: { isActive: true },
      orderBy: { type: 'asc' }
    });
  },

  async createGameSession(
    profileId: string, 
    gameId: string, 
    points: number, 
    communityId?: string
  ) {
    return prisma.gameSession.create({
      data: {
        profileId,
        gameId,
        type: GameType.FOODS, // Valeur par défaut ou à déterminer selon la logique
        points,
        metadata: communityId ? { communityId } : undefined
      }
    });
  },

  async endGameSession(
    sessionId: string, 
    hasWon: boolean, 
    result: Record<string, unknown>,
    winAmount?: number
  ) {
    // Mettre à jour la session de jeu
    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        hasWon,
        result: result as Prisma.InputJsonValue,
        endedAt: new Date()
      },
      include: {
        profile: true
      }
    });

    // Si le joueur a gagné et qu'il y a un montant de gain et une communauté associée
    if (hasWon && winAmount && winAmount > 0 && result.communityId) {
      const communityId = result.communityId as string;
      const userId = updatedSession.profile.userId;
      
      // Calculer le montant à attribuer à la communauté (10% du gain)
      const communityAmount = Math.round(winAmount * 0.1);
      
      if (communityAmount > 0) {
        // Créer une transaction pour la communauté
        await recordCommunityTransaction({
          communityId,
          userId,
          amount: communityAmount,
          type: CommunityTransactionType.GAME_WIN,
          description: `Gain du Jackpot Communautaire (${winAmount}€)`
        });
      }
    }

    return updatedSession;
  },

  async getUserGameHistory(profileId: string) {
    return prisma.gameSession.findMany({
      where: { profileId },
      include: {
        game: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getCommunityGameHistory(communityId: string) {
    return prisma.gameSession.findMany({
      where: {
        metadata: {
          path: ['communityId'],
          equals: communityId
        }
      },
      include: {
        profile: {
          include: {
            user: true
          }
        },
        game: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async calculateWinChance(gameType: GameType) {
    const game = await prisma.game.findFirst({
      where: { type: gameType }
    });
    return game?.winRate || 0;
  },

  async getCommunityGameStats(communityId: string) {
    // Récupérer toutes les sessions de jeu pour cette communauté
    const sessions = await this.getCommunityGameHistory(communityId);
    
    // Calculer les statistiques
    const totalGames = sessions.length;
    const wonGames = sessions.filter(session => session.hasWon).length;
    const totalEarnings = sessions.reduce((sum, session) => {
      if (session.hasWon && session.result) {
        const result = session.result as Record<string, unknown>;
        const win = typeof result.win === 'number' ? result.win : 0;
        return sum + win;
      }
      return sum;
    }, 0);
    
    return {
      totalGames,
      wonGames,
      winRate: totalGames > 0 ? (wonGames / totalGames) * 100 : 0,
      totalEarnings
    };
  }
};

import { prisma } from '@/lib/prisma';
import { GameType, Prisma } from '@prisma/client';

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

  async createGameSession(profileId: string, gameId: string, points: number) {
    return prisma.gameSession.create({
      data: {
        profileId,
        gameId,
        type: GameType.FOODS, // Valeur par défaut ou à déterminer selon la logique
        points
      }
    });
  },

  async endGameSession(sessionId: string, hasWon: boolean, result: Record<string, unknown>) {
    return prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        hasWon,
        result: result as Prisma.InputJsonValue,
        endedAt: new Date()
      }
    });
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

  async calculateWinChance(gameType: GameType) {
    const game = await prisma.game.findFirst({
      where: { type: gameType }
    });
    return game?.winRate || 0;
  }
};

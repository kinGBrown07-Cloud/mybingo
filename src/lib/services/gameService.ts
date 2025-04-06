import { prisma } from '@/lib/prisma';
import { GameType } from '@prisma/client';

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

  async createGameSession(userId: string, gameId: string, pointsWagered: number) {
    return prisma.gameSession.create({
      data: {
        userId,
        gameId,
        pointsWagered
      }
    });
  },

  async endGameSession(sessionId: string, pointsWon: number, result: any) {
    return prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        pointsWon,
        result,
        endedAt: new Date()
      }
    });
  },

  async getUserGameHistory(userId: string) {
    return prisma.gameSession.findMany({
      where: { userId },
      include: {
        game: true,
        prize: true
      },
      orderBy: { startedAt: 'desc' }
    });
  },

  async calculateWinChance(gameType: GameType) {
    const game = await prisma.game.findFirst({
      where: { type: gameType }
    });
    return game?.winRate || 0;
  }
};

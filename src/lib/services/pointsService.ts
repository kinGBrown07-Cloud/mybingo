import { prisma } from '@/lib/prisma';
import { GameType } from '@prisma/client';

export const pointsService = {
  async awardPoints(
    userId: string,
    points: number,
    gameSessionId: string,
    description: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Vérifier le solde de la caisse
      const treasury = await tx.adminTreasury.findFirst();
      if (!treasury) {
        throw new Error('Erreur de configuration de la caisse');
      }

      // Calculer le solde minimum requis (4x la valeur totale des lots)
      const totalPrizeValue = await tx.prize.aggregate({
        _sum: {
          pointsCost: true
        },
        where: {
          isActive: true,
          stock: { gt: 0 }
        }
      });

      const minRequired = (totalPrizeValue._sum.pointsCost || 0) * 4;

      // Vérifier si le solde reste suffisant après l'attribution des points
      if (treasury.pointsBalance - points < minRequired) {
        throw new Error('La caisse ne peut pas garantir ces points pour le moment');
      }

      // Débiter la caisse
      await tx.adminTreasury.update({
        where: { id: treasury.id },
        data: {
          pointsBalance: { decrement: points },
          lastUpdated: new Date()
        }
      });

      // Créditer l'utilisateur
      await tx.user.update({
        where: { id: userId },
        data: {
          points: { increment: points },
          totalGamesPlayed: { increment: 1 }
        }
      });

      // Enregistrer la transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          gameSessionId,
          type: 'WIN',
          pointsAmount: points,
          description
        }
      });

      // Mettre à jour les statistiques quotidiennes
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await tx.dailyStats.upsert({
        where: { date: today },
        create: {
          date: today,
          totalGamesPlayed: 1,
          totalPointsWagered: points,
          totalPointsWon: points,
          uniquePlayers: 1
        },
        update: {
          totalGamesPlayed: { increment: 1 },
          totalPointsWagered: { increment: points },
          totalPointsWon: { increment: points },
          uniquePlayers: {
            increment: await tx.gameSession.count({
              where: {
                userId,
                startedAt: {
                  gte: today
                }
              }
            }) === 1 ? 1 : 0
          }
        }
      });

      return transaction;
    });
  },

  async calculateGamePoints(gameType: GameType, cardsTurned: number) {
    // Selon la mémoire, tous les jeux donnent 1 point par carte retournée
    return cardsTurned;
  },

  async getUserPoints(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true }
    });
    return user?.points || 0;
  },

  async getPointsTransactions(userId: string) {
    return prisma.transaction.findMany({
      where: { userId },
      include: {
        gameSession: {
          include: {
            game: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getUserDailyGamesCount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.gameSession.count({
      where: {
        userId,
        startedAt: {
          gte: today
        }
      }
    });
  },

  async canPlayMore(userId: string): Promise<boolean> {
    const maxDailyGames = parseInt(process.env.MAX_DAILY_GAMES || '100');
    const gamesPlayed = await this.getUserDailyGamesCount(userId);
    return gamesPlayed < maxDailyGames;
  }
};

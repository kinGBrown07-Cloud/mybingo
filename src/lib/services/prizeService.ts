import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const prizeService = {
  async getAvailablePrizes() {
    return prisma.prize.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 }
      },
      orderBy: { pointsCost: 'asc' }
    });
  },

  async getPrizesByCategory(category: string) {
    return prisma.prize.findMany({
      where: {
        category,
        isActive: true,
        stock: { gt: 0 }
      },
      orderBy: { pointsCost: 'asc' }
    });
  },

  async claimPrize(
    userId: string,
    prizeId: string,
    gameSessionId?: string,
    shippingAddress?: string
  ) {
    // Utiliser une transaction pour s'assurer que toutes les opérations sont atomiques
    return prisma.$transaction(async (tx) => {
      // Vérifier le prix et les points de l'utilisateur
      const [prize, user] = await Promise.all([
        tx.prize.findUnique({ where: { id: prizeId } }),
        tx.user.findUnique({ where: { id: userId } })
      ]);

      if (!prize || !user) {
        throw new Error('Prix ou utilisateur non trouvé');
      }

      if (prize.stock <= 0) {
        throw new Error('Ce lot n\'est plus disponible');
      }

      if (user.points < prize.pointsCost) {
        throw new Error('Points insuffisants');
      }

      // Vérifier le solde de la caisse
      const treasury = await tx.adminTreasury.findFirst();
      if (!treasury) {
        throw new Error('Erreur de configuration de la caisse');
      }

      const totalPrizeValue = prize.pointsCost * prize.stock;
      if (treasury.pointsBalance < totalPrizeValue * 4) {
        throw new Error('La caisse ne peut pas garantir ce lot pour le moment');
      }

      // Mettre à jour les points de l'utilisateur
      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: prize.pointsCost } }
      });

      // Décrémenter le stock
      await tx.prize.update({
        where: { id: prizeId },
        data: { stock: { decrement: 1 } }
      });

      // Créer l'entrée dans user_prizes
      const userPrize = await tx.userPrize.create({
        data: {
          userId,
          prizeId,
          gameSessionId,
          shippingAddress,
          status: 'PENDING'
        }
      });

      // Enregistrer la transaction
      await tx.transaction.create({
        data: {
          userId,
          gameSessionId,
          type: 'LOSS',
          pointsAmount: prize.pointsCost,
          description: `Échange de points contre lot: ${prize.name}`
        }
      });

      return userPrize;
    });
  },

  async getUserPrizes(userId: string) {
    return prisma.userPrize.findMany({
      where: { userId },
      include: {
        prize: true,
        gameSession: true
      },
      orderBy: { claimedAt: 'desc' }
    });
  },

  // Fonction pour vérifier si un lot peut être attribué en fonction du solde de la caisse
  async canAwardPrize(prizeId: string): Promise<boolean> {
    const [prize, treasury] = await Promise.all([
      prisma.prize.findUnique({ where: { id: prizeId } }),
      prisma.adminTreasury.findFirst()
    ]);

    if (!prize || !treasury) {
      return false;
    }

    const totalPrizeValue = await prisma.prize.aggregate({
      _sum: {
        pointsCost: true
      },
      where: {
        isActive: true,
        stock: { gt: 0 }
      }
    });

    const requiredBalance = (totalPrizeValue._sum.pointsCost || 0) * 4;
    return treasury.pointsBalance >= requiredBalance;
  }
};

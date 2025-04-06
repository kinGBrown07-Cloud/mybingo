import { Region, Currency, Profile } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type UserWithPricing = Profile & {
  region: Region;
  currency: Currency;
  pointsRate: number;
};

const POINTS_RATES: Record<Region, number> = {
  BLACK_AFRICA: 200,
  NORTH_AFRICA: 180,
  EUROPE: 100,
  AMERICAS: 100,
  ASIA: 120
};

const CURRENCIES: Record<Region, { code: Currency; symbol: string }> = {
  BLACK_AFRICA: { code: 'XOF', symbol: 'CFA' },
  NORTH_AFRICA: { code: 'MAD', symbol: 'MAD' },
  EUROPE: { code: 'EUR', symbol: '€' },
  AMERICAS: { code: 'USD', symbol: '$' },
  ASIA: { code: 'USD', symbol: '$' }
};

export const pricingService = {
  getPointsRate(region: Region): number {
    return POINTS_RATES[region];
  },

  getCurrency(region: Region): { code: Currency; symbol: string } {
    return CURRENCIES[region];
  },

  calculatePoints(amount: number, region: Region): number {
    const rate = this.getPointsRate(region);
    return Math.floor(amount * rate);
  },

  async calculateGameCost(userId: string, cardsToTurn: number) {
    const profile = await prisma.profile.findUnique({
      where: { id: userId }
    }) as UserWithPricing | null;

    if (!profile) {
      throw new Error('User not found');
    }

    // Chaque carte coûte 1 point
    const pointsCost = cardsToTurn;
    const config = this.getCurrency(profile.region);
    const pointsRate = this.getPointsRate(profile.region);
    
    return {
      points: pointsCost,
      cost: (pointsCost / 2) * pointsRate,
      currency: config.code,
      currencySymbol: config.symbol
    };
  },

  async validatePurchase(amount: number, userId: string) {
    // Vérifier que le montant est valide (> 0)
    if (amount <= 0) {
      return false;
    }

    // Vérifier le montant maximum autorisé
    const MAX_AMOUNT = 1000;
    if (amount > MAX_AMOUNT) {
      return false;
    }

    const profile = await prisma.profile.findUnique({ 
      where: { id: userId } 
    });

    if (!profile) {
      return false;
    }

    const points = this.calculatePoints(amount, profile.region);
    
    // Vérifier si c'est le premier achat pour appliquer le bonus
    const hasCompletedPurchases = await prisma.transaction.findFirst({
      where: { 
        profileId: userId,
        type: "DEPOSIT"
      }
    });

    return {
      points,
      bonus: !hasCompletedPurchases ? Math.floor(points * Number(process.env.NEXT_PUBLIC_FIRST_PURCHASE_BONUS) / 100) : 0
    };
  }
};

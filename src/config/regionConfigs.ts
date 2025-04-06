import { Region, Currency } from '@/types/db';

export interface RegionConfig {
  currency: Currency;
  pointCost: number; // Coût pour 2 points dans la devise locale
}

export const regionConfigs: Record<Region, RegionConfig> = {
  BLACK_AFRICA: {
    currency: 'XOF',
    pointCost: 300, // 300 XOF pour 2 points
  },
  NORTH_AFRICA: {
    currency: 'MAD',
    pointCost: 500, // 500 MAD pour 2 points
  },
  EUROPE: {
    currency: 'EUR',
    pointCost: 2, // 2 EUR pour 2 points
  },
  AMERICAS: {
    currency: 'USD',
    pointCost: 2, // 2 USD pour 2 points
  },
  ASIA: {
    currency: 'USD',
    pointCost: 2, // 2 USD pour 2 points
  }
};

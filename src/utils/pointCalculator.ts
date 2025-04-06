import { regionConfigs } from '@/config/regionConfigs';
import { Region, Currency } from '@/types/db';

/**
 * Calcule le coût des points selon la région
 */
export function calculatePointCost(points: number, region: Region): { amount: number; currency: Currency } {
  const config = regionConfigs[region];
  // Le coût est calculé proportionnellement (2 points = pointCost)
  const amount = (points * config.pointCost) / 2;
  return {
    amount,
    currency: config.currency
  };
}

/**
 * Convertit des points en monnaie locale
 */
export function pointsToLocalCurrency(points: number, region: Region): string {
  const { amount, currency } = calculatePointCost(points, region);
  return `${amount} ${currency}`;
}

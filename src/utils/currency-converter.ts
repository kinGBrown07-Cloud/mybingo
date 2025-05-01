/**
 * Utilitaire pour la conversion de devises
 * Utilisé pour standardiser les paiements PayPal en EUR ou USD
 */

import { Region, Currency } from '@/lib/constants/regions';

// Taux de conversion approximatifs (à mettre à jour régulièrement)
// Ces taux sont simplifiés et devraient être remplacés par une API de taux de change en production
const EXCHANGE_RATES: Record<Currency, Record<Currency, number>> = {
  [Currency.XOF]: {
    [Currency.XOF]: 1,
    [Currency.EUR]: 0.0015, // 1 XOF = 0.0015 EUR
    [Currency.USD]: 0.0016, // 1 XOF = 0.0016 USD
    [Currency.MAD]: 0.016   // 1 XOF = 0.016 MAD
  },
  [Currency.EUR]: {
    [Currency.XOF]: 655.96, // 1 EUR = 655.96 XOF
    [Currency.EUR]: 1,
    [Currency.USD]: 1.08,   // 1 EUR = 1.08 USD
    [Currency.MAD]: 10.85   // 1 EUR = 10.85 MAD
  },
  [Currency.USD]: {
    [Currency.XOF]: 607.37, // 1 USD = 607.37 XOF
    [Currency.EUR]: 0.93,   // 1 USD = 0.93 EUR
    [Currency.USD]: 1,
    [Currency.MAD]: 10.05   // 1 USD = 10.05 MAD
  },
  [Currency.MAD]: {
    [Currency.XOF]: 60.44,  // 1 MAD = 60.44 XOF
    [Currency.EUR]: 0.092,  // 1 MAD = 0.092 EUR
    [Currency.USD]: 0.099,  // 1 MAD = 0.099 USD
    [Currency.MAD]: 1
  }
};

/**
 * Convertit un montant d'une devise à une autre
 * @param amount Le montant à convertir
 * @param fromCurrency La devise source
 * @param toCurrency La devise cible
 * @returns Le montant converti
 */
export function convertCurrency(
  amount: number, 
  fromCurrency: Currency, 
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const rate = EXCHANGE_RATES[fromCurrency][toCurrency];
  return amount * rate;
}

/**
 * Détermine la devise standard pour les paiements PayPal en fonction de la région
 * @param region La région de l'utilisateur
 * @returns La devise standard pour PayPal (EUR ou USD)
 */
export function getPaypalCurrency(region: Region): Currency {
  switch (region) {
    case Region.EUROPE:
      return Currency.EUR;
    default:
      return Currency.USD; // USD comme devise par défaut pour toutes les autres régions
  }
}

/**
 * Convertit un montant de la devise locale vers la devise standard PayPal
 * @param amount Le montant dans la devise locale
 * @param localCurrency La devise locale
 * @param region La région de l'utilisateur
 * @returns Le montant converti dans la devise standard PayPal
 */
export function convertToPaypalCurrency(
  amount: number,
  localCurrency: Currency,
  region: Region
): { amount: number; currency: Currency } {
  const paypalCurrency = getPaypalCurrency(region);
  const convertedAmount = convertCurrency(amount, localCurrency, paypalCurrency);
  
  // Arrondir à 2 décimales
  const roundedAmount = Math.round(convertedAmount * 100) / 100;
  
  return {
    amount: roundedAmount,
    currency: paypalCurrency
  };
}

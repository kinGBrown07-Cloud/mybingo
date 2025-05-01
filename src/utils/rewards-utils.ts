import { Currency } from "@/types/rewards";

// Formater la valeur monétaire avec la devise
export function formatCurrency(value: number, currency: Currency): string {
  switch (currency) {
    case Currency.XOF:
      return `${value.toLocaleString()} ${currency}`;
    case Currency.EURO:
      return `${value.toLocaleString()}${currency}`;
    case Currency.DOLLAR:
      return `${currency}${value.toLocaleString()}`;
    default:
      return `${value.toLocaleString()}`;
  }
}

// Convertir des points en montant de mise pour l'affichage
export function pointsToBetAmount(points: number): number {
  // Conversion simple: 10 points = 1 unité de mise
  return Math.ceil(points / 10);
}

// Obtenir le nom de la région en français
export function getRegionName(regionCode: string): string {
  switch (regionCode) {
    case 'africa_sub':
      return "Afrique Subsaharienne";
    case 'africa_north':
      return "Afrique du Nord";
    case 'europe':
      return "Europe";
    case 'asia':
      return "Asie";
    case 'america':
      return "Amérique";
    default:
      return "Région inconnue";
  }
}

// Obtenir le symbole de la devise
export function getCurrencySymbol(currencyCode: string): string {
  switch (currencyCode) {
    case 'XOF':
      return "XOF";
    case '€':
      return "€";
    case '$':
      return "$";
    default:
      return currencyCode;
  }
}

// Convertir des points en valeur selon la région
export function calculatePointsValue(points: number, region: string): { value: number, currency: string } {
  const conversionRates = {
    'africa_sub': { points: 2, value: 300, currency: 'XOF' },
    'africa_north': { points: 2, value: 500, currency: 'XOF' },
    'europe': { points: 2, value: 2, currency: '€' },
    'asia': { points: 2, value: 2, currency: '$' },
    'america': { points: 2, value: 2, currency: '$' },
  };

  const rate = conversionRates[region as keyof typeof conversionRates] || conversionRates.europe;
  const valuePerPoint = rate.value / rate.points;
  return {
    value: Math.round(points * valuePerPoint * 100) / 100,
    currency: rate.currency
  };
}

// Fonction pour mélanger un tableau
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

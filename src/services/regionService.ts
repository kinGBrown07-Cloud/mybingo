export type Region = 'BLACK_AFRICA' | 'WHITE_AFRICA' | 'EUROPE' | 'ASIA_AMERICA';

export type Currency = 'XOF' | 'EUR' | 'USD';

export interface RegionConfig {
  region: Region;
  currency: Currency;
  pointsRate: number; // Combien coûte 2 points dans la devise locale
  currencySymbol: string;
}

export const REGION_CONFIGS: Record<Region, RegionConfig> = {
  BLACK_AFRICA: {
    region: 'BLACK_AFRICA',
    currency: 'XOF',
    pointsRate: 300,
    currencySymbol: 'XOF'
  },
  WHITE_AFRICA: {
    region: 'WHITE_AFRICA',
    currency: 'XOF',
    pointsRate: 500,
    currencySymbol: 'XOF'
  },
  EUROPE: {
    region: 'EUROPE',
    currency: 'EUR',
    pointsRate: 2,
    currencySymbol: '€'
  },
  ASIA_AMERICA: {
    region: 'ASIA_AMERICA',
    currency: 'USD',
    pointsRate: 2,
    currencySymbol: '$'
  }
};

export function calculatePrice(points: number, region: Region): number {
  const config = REGION_CONFIGS[region];
  const basePrice = (points * config.pointsRate) / 2;
  
  // Appliquer les réductions selon le nombre de points
  if (points >= 5000) {
    return basePrice * 0.85; // -15%
  } else if (points >= 2500) {
    return basePrice * 0.9; // -10%
  } else if (points >= 1000) {
    return basePrice * 0.95; // -5%
  }
  return basePrice;
}

export async function detectUserRegion(): Promise<Region> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    // Liste des pays d'Afrique noire (codes ISO)
    const blackAfricaCountries = ['BJ', 'BF', 'CM', 'CF', 'TD', 'CG', 'CD', 'CI', 'GQ', 'GA', 'GN', 'GW', 'ML', 'NE', 'NG', 'SN', 'TG'];
    
    // Liste des pays d'Afrique blanche
    const whiteAfricaCountries = ['DZ', 'EG', 'LY', 'MA', 'TN'];
    
    // Liste des pays européens
    const europeanCountries = ['FR', 'DE', 'IT', 'ES', 'GB', 'NL', 'BE', 'PT', 'CH', 'AT', 'SE', 'DK', 'NO', 'FI', 'IE', 'LU'];
    
    if (blackAfricaCountries.includes(data.country_code)) {
      return 'BLACK_AFRICA';
    } else if (whiteAfricaCountries.includes(data.country_code)) {
      return 'WHITE_AFRICA';
    } else if (europeanCountries.includes(data.country_code)) {
      return 'EUROPE';
    }
    
    return 'ASIA_AMERICA'; // Par défaut
  } catch (error) {
    console.error('Error detecting region:', error);
    return 'EUROPE'; // Région par défaut en cas d'erreur
  }
}

export function formatPrice(price: number, region: Region): string {
  const config = REGION_CONFIGS[region];
  
  if (config.currency === 'XOF') {
    return `${Math.round(price).toLocaleString()} ${config.currencySymbol}`;
  }
  
  return `${config.currencySymbol}${price.toFixed(2)}`;
}

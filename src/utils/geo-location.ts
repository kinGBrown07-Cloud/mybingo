import { Region } from '@/lib/constants/regions';

// Définition des pays par région
const REGION_MAPPING: Record<string, Region> = {
  // Afrique Subsaharienne
  'BJ': Region.BLACK_AFRICA, // Bénin
  'BF': Region.BLACK_AFRICA, // Burkina Faso
  'CM': Region.BLACK_AFRICA, // Cameroun
  'CV': Region.BLACK_AFRICA, // Cap-Vert
  'CF': Region.BLACK_AFRICA, // République centrafricaine
  'TD': Region.BLACK_AFRICA, // Tchad
  'KM': Region.BLACK_AFRICA, // Comores
  'CG': Region.BLACK_AFRICA, // Congo
  'CD': Region.BLACK_AFRICA, // République démocratique du Congo
  'CI': Region.BLACK_AFRICA, // Côte d'Ivoire
  'DJ': Region.BLACK_AFRICA, // Djibouti
  'GQ': Region.BLACK_AFRICA, // Guinée équatoriale
  'ER': Region.BLACK_AFRICA, // Érythrée
  'ET': Region.BLACK_AFRICA, // Éthiopie
  'GA': Region.BLACK_AFRICA, // Gabon
  'GM': Region.BLACK_AFRICA, // Gambie
  'GH': Region.BLACK_AFRICA, // Ghana
  'GN': Region.BLACK_AFRICA, // Guinée
  'GW': Region.BLACK_AFRICA, // Guinée-Bissau
  'KE': Region.BLACK_AFRICA, // Kenya
  'LS': Region.BLACK_AFRICA, // Lesotho
  'LR': Region.BLACK_AFRICA, // Libéria
  'MG': Region.BLACK_AFRICA, // Madagascar
  'MW': Region.BLACK_AFRICA, // Malawi
  'ML': Region.BLACK_AFRICA, // Mali
  'MR': Region.BLACK_AFRICA, // Mauritanie
  'MU': Region.BLACK_AFRICA, // Maurice
  'MZ': Region.BLACK_AFRICA, // Mozambique
  'NA': Region.BLACK_AFRICA, // Namibie
  'NE': Region.BLACK_AFRICA, // Niger
  'NG': Region.BLACK_AFRICA, // Nigeria
  'RW': Region.BLACK_AFRICA, // Rwanda
  'ST': Region.BLACK_AFRICA, // Sao Tomé-et-Principe
  'SN': Region.BLACK_AFRICA, // Sénégal
  'SC': Region.BLACK_AFRICA, // Seychelles
  'SL': Region.BLACK_AFRICA, // Sierra Leone
  'SO': Region.BLACK_AFRICA, // Somalie
  'ZA': Region.BLACK_AFRICA, // Afrique du Sud
  'SS': Region.BLACK_AFRICA, // Soudan du Sud
  'SD': Region.BLACK_AFRICA, // Soudan
  'SZ': Region.BLACK_AFRICA, // Eswatini
  'TZ': Region.BLACK_AFRICA, // Tanzanie
  'TG': Region.BLACK_AFRICA, // Togo
  'UG': Region.BLACK_AFRICA, // Ouganda
  'ZM': Region.BLACK_AFRICA, // Zambie
  'ZW': Region.BLACK_AFRICA, // Zimbabwe
  
  // Afrique du Nord
  'DZ': Region.NORTH_AFRICA, // Algérie
  'EG': Region.NORTH_AFRICA, // Égypte
  'LY': Region.NORTH_AFRICA, // Libye
  'MA': Region.NORTH_AFRICA, // Maroc
  'TN': Region.NORTH_AFRICA, // Tunisie
  
  // Europe
  'AL': Region.EUROPE, 'AD': Region.EUROPE, 'AT': Region.EUROPE, 'BY': Region.EUROPE,
  'BE': Region.EUROPE, 'BA': Region.EUROPE, 'BG': Region.EUROPE, 'HR': Region.EUROPE,
  'CY': Region.EUROPE, 'CZ': Region.EUROPE, 'DK': Region.EUROPE, 'EE': Region.EUROPE,
  'FI': Region.EUROPE, 'FR': Region.EUROPE, 'DE': Region.EUROPE, 'GR': Region.EUROPE,
  'HU': Region.EUROPE, 'IS': Region.EUROPE, 'IE': Region.EUROPE, 'IT': Region.EUROPE,
  'LV': Region.EUROPE, 'LI': Region.EUROPE, 'LT': Region.EUROPE, 'LU': Region.EUROPE,
  'MT': Region.EUROPE, 'MD': Region.EUROPE, 'MC': Region.EUROPE, 'ME': Region.EUROPE,
  'NL': Region.EUROPE, 'MK': Region.EUROPE, 'NO': Region.EUROPE, 'PL': Region.EUROPE,
  'PT': Region.EUROPE, 'RO': Region.EUROPE, 'RU': Region.EUROPE, 'SM': Region.EUROPE,
  'RS': Region.EUROPE, 'SK': Region.EUROPE, 'SI': Region.EUROPE, 'ES': Region.EUROPE,
  'SE': Region.EUROPE, 'CH': Region.EUROPE, 'UA': Region.EUROPE, 'GB': Region.EUROPE,
  'VA': Region.EUROPE,
  
  // Amériques
  'US': Region.AMERICAS, 'CA': Region.AMERICAS, 'MX': Region.AMERICAS, 'AR': Region.AMERICAS,
  'BO': Region.AMERICAS, 'BR': Region.AMERICAS, 'CL': Region.AMERICAS, 'CO': Region.AMERICAS,
  'CR': Region.AMERICAS, 'CU': Region.AMERICAS, 'DO': Region.AMERICAS, 'EC': Region.AMERICAS,
  'SV': Region.AMERICAS, 'GT': Region.AMERICAS, 'HT': Region.AMERICAS, 'HN': Region.AMERICAS,
  'JM': Region.AMERICAS, 'NI': Region.AMERICAS, 'PA': Region.AMERICAS, 'PY': Region.AMERICAS,
  'PE': Region.AMERICAS, 'PR': Region.AMERICAS, 'UY': Region.AMERICAS, 'VE': Region.AMERICAS,
  
  // Asie
  'AF': Region.ASIA, 'AM': Region.ASIA, 'AZ': Region.ASIA, 'BH': Region.ASIA,
  'BD': Region.ASIA, 'BT': Region.ASIA, 'BN': Region.ASIA, 'KH': Region.ASIA,
  'CN': Region.ASIA, 'GE': Region.ASIA, 'IN': Region.ASIA, 'ID': Region.ASIA,
  'IR': Region.ASIA, 'IQ': Region.ASIA, 'IL': Region.ASIA, 'JP': Region.ASIA,
  'JO': Region.ASIA, 'KZ': Region.ASIA, 'KW': Region.ASIA, 'KG': Region.ASIA,
  'LA': Region.ASIA, 'LB': Region.ASIA, 'MY': Region.ASIA, 'MV': Region.ASIA,
  'MN': Region.ASIA, 'MM': Region.ASIA, 'NP': Region.ASIA, 'KP': Region.ASIA,
  'OM': Region.ASIA, 'PK': Region.ASIA, 'PS': Region.ASIA, 'PH': Region.ASIA,
  'QA': Region.ASIA, 'SA': Region.ASIA, 'SG': Region.ASIA, 'KR': Region.ASIA,
  'LK': Region.ASIA, 'SY': Region.ASIA, 'TW': Region.ASIA, 'TJ': Region.ASIA,
  'TH': Region.ASIA, 'TR': Region.ASIA, 'TM': Region.ASIA, 'AE': Region.ASIA,
  'UZ': Region.ASIA, 'VN': Region.ASIA, 'YE': Region.ASIA,
};

interface GeoLocationResponse {
  country_code: string;
  country_name: string;
  city: string;
  ip: string;
}

/**
 * Détecte la région de l'utilisateur en fonction de son adresse IP
 * @returns La région détectée ou Region.BLACK_AFRICA par défaut
 */
export async function detectUserRegion(): Promise<Region> {
  try {
    // Utiliser un service de géolocalisation IP public
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      console.error('Erreur lors de la détection de la région:', response.statusText);
      return Region.BLACK_AFRICA; // Par défaut Afrique subsaharienne
    }
    
    const data: GeoLocationResponse = await response.json();
    const countryCode = data.country_code;
    
    // Retourner la région correspondante ou BLACK_AFRICA par défaut
    return REGION_MAPPING[countryCode] || Region.BLACK_AFRICA;
  } catch (error) {
    console.error('Erreur lors de la détection de la région:', error);
    return Region.BLACK_AFRICA; // Par défaut Afrique subsaharienne
  }
}

/**
 * Obtient le taux de conversion pour une région donnée
 * @param region La région
 * @returns Le taux de conversion (combien vaut 1 point dans la devise locale)
 */
export function getConversionRate(region: Region): number {
  switch(region) {
    case Region.BLACK_AFRICA:
      return 150; // 1 point = 150 XOF
    case Region.NORTH_AFRICA:
      return 250; // 1 point = 250 XOF
    case Region.EUROPE:
      return 1; // 1 point = 1€
    case Region.AMERICAS:
    case Region.ASIA:
      return 1; // 1 point = 1$
    default:
      return 150; // Par défaut
  }
}

/**
 * Obtient le symbole de la devise pour une région donnée
 * @param region La région
 * @returns Le symbole de la devise
 */
export function getCurrencyForRegion(region: Region): string {
  switch(region) {
    case Region.BLACK_AFRICA:
    case Region.NORTH_AFRICA:
      return 'XOF';
    case Region.EUROPE:
      return '€';
    case Region.AMERICAS:
    case Region.ASIA:
      return '$';
    default:
      return 'XOF'; // Par défaut
  }
}

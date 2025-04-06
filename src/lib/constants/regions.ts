export enum Currency {
  XOF = "XOF",
  MAD = "MAD",
  EUR = "EUR",
  USD = "USD"
}

export enum Region {
  BLACK_AFRICA = "BLACK_AFRICA",
  NORTH_AFRICA = "NORTH_AFRICA",
  EUROPE = "EUROPE",
  AMERICAS = "AMERICAS",
  ASIA = "ASIA"
}

export type CountryInfo = {
  code: string;
  name: string;
  region: Region;
};

export const ALL_COUNTRIES: CountryInfo[] = [
  // Afrique Noire
  { code: "BJ", name: "Bénin", region: Region.BLACK_AFRICA },
  { code: "BF", name: "Burkina Faso", region: Region.BLACK_AFRICA },
  { code: "CM", name: "Cameroun", region: Region.BLACK_AFRICA },
  { code: "CF", name: "République centrafricaine", region: Region.BLACK_AFRICA },
  { code: "CG", name: "Congo", region: Region.BLACK_AFRICA },
  { code: "CI", name: "Côte d'Ivoire", region: Region.BLACK_AFRICA },
  { code: "GA", name: "Gabon", region: Region.BLACK_AFRICA },
  { code: "GW", name: "Guinée-Bissau", region: Region.BLACK_AFRICA },
  { code: "GQ", name: "Guinée Équatoriale", region: Region.BLACK_AFRICA },
  { code: "ML", name: "Mali", region: Region.BLACK_AFRICA },
  { code: "NE", name: "Niger", region: Region.BLACK_AFRICA },
  { code: "SN", name: "Sénégal", region: Region.BLACK_AFRICA },
  { code: "TD", name: "Tchad", region: Region.BLACK_AFRICA },
  { code: "TG", name: "Togo", region: Region.BLACK_AFRICA },
  { code: "NG", name: "Nigeria", region: Region.BLACK_AFRICA },
  { code: "GH", name: "Ghana", region: Region.BLACK_AFRICA },
  { code: "SL", name: "Sierra Leone", region: Region.BLACK_AFRICA },
  { code: "LR", name: "Libéria", region: Region.BLACK_AFRICA },
  { code: "GN", name: "Guinée", region: Region.BLACK_AFRICA },
  { code: "AO", name: "Angola", region: Region.BLACK_AFRICA },
  { code: "CD", name: "République démocratique du Congo", region: Region.BLACK_AFRICA },
  { code: "RW", name: "Rwanda", region: Region.BLACK_AFRICA },
  { code: "BI", name: "Burundi", region: Region.BLACK_AFRICA },
  { code: "UG", name: "Ouganda", region: Region.BLACK_AFRICA },
  { code: "KE", name: "Kenya", region: Region.BLACK_AFRICA },
  { code: "TZ", name: "Tanzanie", region: Region.BLACK_AFRICA },
  { code: "MZ", name: "Mozambique", region: Region.BLACK_AFRICA },
  { code: "MG", name: "Madagascar", region: Region.BLACK_AFRICA },
  { code: "KM", name: "Comores", region: Region.BLACK_AFRICA },
  { code: "ZM", name: "Zambie", region: Region.BLACK_AFRICA },
  { code: "ZW", name: "Zimbabwe", region: Region.BLACK_AFRICA },
  { code: "MW", name: "Malawi", region: Region.BLACK_AFRICA },
  { code: "ZA", name: "Afrique du Sud", region: Region.BLACK_AFRICA },
  { code: "NA", name: "Namibie", region: Region.BLACK_AFRICA },
  { code: "BW", name: "Botswana", region: Region.BLACK_AFRICA },

  // Afrique du Nord
  { code: "MA", name: "Maroc", region: Region.NORTH_AFRICA },
  { code: "DZ", name: "Algérie", region: Region.NORTH_AFRICA },
  { code: "TN", name: "Tunisie", region: Region.NORTH_AFRICA },
  { code: "LY", name: "Libye", region: Region.NORTH_AFRICA },
  { code: "EG", name: "Égypte", region: Region.NORTH_AFRICA },
  { code: "SD", name: "Soudan", region: Region.NORTH_AFRICA },
  { code: "MR", name: "Mauritanie", region: Region.NORTH_AFRICA },

  // Europe
  { code: "FR", name: "France", region: Region.EUROPE },
  { code: "DE", name: "Allemagne", region: Region.EUROPE },
  { code: "IT", name: "Italie", region: Region.EUROPE },
  { code: "ES", name: "Espagne", region: Region.EUROPE },
  { code: "PT", name: "Portugal", region: Region.EUROPE },
  { code: "GB", name: "Royaume-Uni", region: Region.EUROPE },
  { code: "IE", name: "Irlande", region: Region.EUROPE },
  { code: "BE", name: "Belgique", region: Region.EUROPE },
  { code: "NL", name: "Pays-Bas", region: Region.EUROPE },
  { code: "LU", name: "Luxembourg", region: Region.EUROPE },
  { code: "CH", name: "Suisse", region: Region.EUROPE },
  { code: "AT", name: "Autriche", region: Region.EUROPE },
  { code: "GR", name: "Grèce", region: Region.EUROPE },
  { code: "SE", name: "Suède", region: Region.EUROPE },
  { code: "NO", name: "Norvège", region: Region.EUROPE },
  { code: "FI", name: "Finlande", region: Region.EUROPE },
  { code: "DK", name: "Danemark", region: Region.EUROPE },
  { code: "PL", name: "Pologne", region: Region.EUROPE },
  { code: "CZ", name: "République tchèque", region: Region.EUROPE },
  { code: "SK", name: "Slovaquie", region: Region.EUROPE },
  { code: "HU", name: "Hongrie", region: Region.EUROPE },
  { code: "RO", name: "Roumanie", region: Region.EUROPE },
  { code: "BG", name: "Bulgarie", region: Region.EUROPE },
  { code: "HR", name: "Croatie", region: Region.EUROPE },
  { code: "SI", name: "Slovénie", region: Region.EUROPE },
  { code: "RS", name: "Serbie", region: Region.EUROPE },
  { code: "ME", name: "Monténégro", region: Region.EUROPE },
  { code: "MK", name: "Macédoine du Nord", region: Region.EUROPE },
  { code: "AL", name: "Albanie", region: Region.EUROPE },
  { code: "MT", name: "Malte", region: Region.EUROPE },
  { code: "CY", name: "Chypre", region: Region.EUROPE },

  // Amériques
  { code: "US", name: "États-Unis", region: Region.AMERICAS },
  { code: "CA", name: "Canada", region: Region.AMERICAS },
  { code: "MX", name: "Mexique", region: Region.AMERICAS },
  { code: "BR", name: "Brésil", region: Region.AMERICAS },
  { code: "AR", name: "Argentine", region: Region.AMERICAS },
  { code: "CL", name: "Chili", region: Region.AMERICAS },
  { code: "CO", name: "Colombie", region: Region.AMERICAS },
  { code: "PE", name: "Pérou", region: Region.AMERICAS },
  { code: "VE", name: "Venezuela", region: Region.AMERICAS },
  { code: "EC", name: "Équateur", region: Region.AMERICAS },
  { code: "BO", name: "Bolivie", region: Region.AMERICAS },
  { code: "PY", name: "Paraguay", region: Region.AMERICAS },
  { code: "UY", name: "Uruguay", region: Region.AMERICAS },
  { code: "GY", name: "Guyana", region: Region.AMERICAS },
  { code: "SR", name: "Suriname", region: Region.AMERICAS },
  { code: "GF", name: "Guyane française", region: Region.AMERICAS },
  { code: "PA", name: "Panama", region: Region.AMERICAS },
  { code: "CR", name: "Costa Rica", region: Region.AMERICAS },
  { code: "NI", name: "Nicaragua", region: Region.AMERICAS },
  { code: "HN", name: "Honduras", region: Region.AMERICAS },
  { code: "SV", name: "El Salvador", region: Region.AMERICAS },
  { code: "GT", name: "Guatemala", region: Region.AMERICAS },
  { code: "BZ", name: "Belize", region: Region.AMERICAS },
  { code: "JM", name: "Jamaïque", region: Region.AMERICAS },
  { code: "HT", name: "Haïti", region: Region.AMERICAS },
  { code: "DO", name: "République dominicaine", region: Region.AMERICAS },
  { code: "CU", name: "Cuba", region: Region.AMERICAS },
  { code: "BS", name: "Bahamas", region: Region.AMERICAS },
  { code: "BB", name: "Barbade", region: Region.AMERICAS },
  { code: "TT", name: "Trinidad-et-Tobago", region: Region.AMERICAS },

  // Asie
  { code: "CN", name: "Chine", region: Region.ASIA },
  { code: "JP", name: "Japon", region: Region.ASIA },
  { code: "KR", name: "Corée du Sud", region: Region.ASIA },
  { code: "KP", name: "Corée du Nord", region: Region.ASIA },
  { code: "VN", name: "Vietnam", region: Region.ASIA },
  { code: "KH", name: "Cambodge", region: Region.ASIA },
  { code: "LA", name: "Laos", region: Region.ASIA },
  { code: "TH", name: "Thaïlande", region: Region.ASIA },
  { code: "MM", name: "Myanmar", region: Region.ASIA },
  { code: "MY", name: "Malaisie", region: Region.ASIA },
  { code: "SG", name: "Singapour", region: Region.ASIA },
  { code: "ID", name: "Indonésie", region: Region.ASIA },
  { code: "PH", name: "Philippines", region: Region.ASIA },
  { code: "BN", name: "Brunei", region: Region.ASIA },
  { code: "TL", name: "Timor oriental", region: Region.ASIA },
  { code: "MN", name: "Mongolie", region: Region.ASIA },
  { code: "KZ", name: "Kazakhstan", region: Region.ASIA },
  { code: "KG", name: "Kirghizistan", region: Region.ASIA },
  { code: "TJ", name: "Tadjikistan", region: Region.ASIA },
  { code: "UZ", name: "Ouzbékistan", region: Region.ASIA },
  { code: "TM", name: "Turkménistan", region: Region.ASIA },
  { code: "AF", name: "Afghanistan", region: Region.ASIA },
  { code: "PK", name: "Pakistan", region: Region.ASIA },
  { code: "IN", name: "Inde", region: Region.ASIA },
  { code: "BD", name: "Bangladesh", region: Region.ASIA },
  { code: "NP", name: "Népal", region: Region.ASIA },
  { code: "BT", name: "Bhoutan", region: Region.ASIA },
  { code: "LK", name: "Sri Lanka", region: Region.ASIA },
  { code: "MV", name: "Maldives", region: Region.ASIA }
];

export type RegionConfig = {
  name: string;
  currency: string;
  currencySymbol: string;
  pointsRate: number; // Combien coûtent 2 points dans la devise locale
};

export const REGIONS: Record<Region, RegionConfig> = {
  [Region.BLACK_AFRICA]: {
    name: "Afrique de l'Ouest",
    currency: "XOF",
    currencySymbol: "FCFA",
    pointsRate: 300 // 2 points = 300 FCFA
  },
  [Region.NORTH_AFRICA]: {
    name: "Afrique du Nord",
    currency: "XOF",
    currencySymbol: "FCFA",
    pointsRate: 500 // 2 points = 500 FCFA
  },
  [Region.EUROPE]: {
    name: "Europe",
    currency: "EUR",
    currencySymbol: "€",
    pointsRate: 2 // 2 points = 2€
  },
  [Region.AMERICAS]: {
    name: "Amériques",
    currency: "USD",
    currencySymbol: "$",
    pointsRate: 2 // 2 points = 2$
  },
  [Region.ASIA]: {
    name: "Asie",
    currency: "USD",
    currencySymbol: "$",
    pointsRate: 2 // 2 points = 2$
  }
};

export function getRegionByCountry(countryCode: string): Region | null {
  const country = ALL_COUNTRIES.find(c => c.code === countryCode);
  return country ? country.region : null;
}

export function getPointsCost(region: Region, points: number): number {
  const config = REGIONS[region];
  // Convertir le nombre de points en paires (car 2 points = taux)
  const pairs = Math.ceil(points / 2);
  return pairs * config.pointsRate;
}

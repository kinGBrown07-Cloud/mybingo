// Mapping des codes de pays vers les indicatifs téléphoniques
export const COUNTRY_PHONE_CODES: Record<string, string> = {
  // Afrique Noire
  "BJ": "+229", // Bénin
  "BF": "+226", // Burkina Faso
  "CM": "+237", // Cameroun
  "CF": "+236", // République centrafricaine
  "CG": "+242", // Congo
  "CI": "+225", // Côte d'Ivoire
  "GA": "+241", // Gabon
  "GW": "+245", // Guinée-Bissau
  "ML": "+223", // Mali
  "NE": "+227", // Niger
  "SN": "+221", // Sénégal
  "TG": "+228", // Togo
  
  // Afrique du Nord
  "DZ": "+213", // Algérie
  "EG": "+20",  // Égypte
  "LY": "+218", // Libye
  "MA": "+212", // Maroc
  "TN": "+216", // Tunisie
  
  // Europe
  "BE": "+32",  // Belgique
  "FR": "+33",  // France
  "DE": "+49",  // Allemagne
  "IT": "+39",  // Italie
  "LU": "+352", // Luxembourg
  "PT": "+351", // Portugal
  "ES": "+34",  // Espagne
  "CH": "+41",  // Suisse
  "GB": "+44",  // Royaume-Uni
  
  // Amériques
  "CA": "+1",   // Canada
  "US": "+1",   // États-Unis
  "MX": "+52",  // Mexique
  "BR": "+55",  // Brésil
  
  // Asie
  "CN": "+86",  // Chine
  "JP": "+81",  // Japon
  "KR": "+82",  // Corée du Sud
  "IN": "+91",  // Inde
};

/**
 * Obtient l'indicatif téléphonique pour un code de pays donné
 * @param countryCode Code du pays (ISO 2)
 * @returns Indicatif téléphonique avec le signe + ou une chaîne vide si non trouvé
 */
export function getPhoneCodeForCountry(countryCode: string): string {
  return COUNTRY_PHONE_CODES[countryCode] || "";
}

/**
 * Formate un numéro de téléphone en ajoutant l'indicatif du pays s'il n'est pas déjà présent
 * @param phoneNumber Numéro de téléphone à formater
 * @param countryCode Code du pays (ISO 2)
 * @returns Numéro de téléphone formaté avec l'indicatif
 */
export function formatPhoneWithCountryCode(phoneNumber: string, countryCode: string): string {
  const phoneCode = getPhoneCodeForCountry(countryCode);
  
  // Si le numéro commence déjà par un +, on le renvoie tel quel
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // Si le numéro commence par un 0, on le supprime avant d'ajouter l'indicatif
  if (phoneNumber.startsWith('0')) {
    return `${phoneCode}${phoneNumber.substring(1)}`;
  }
  
  // Sinon, on ajoute simplement l'indicatif
  return `${phoneCode}${phoneNumber}`;
}

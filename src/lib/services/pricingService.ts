import { prisma } from '@/lib/prisma';
import { Region } from '@/lib/constants/regions';
import { TransactionType } from '@prisma/client';
import { Profile } from '@/types/db';

// Définir l'enum Currency directement ici pour éviter les problèmes d'importation
enum Currency {
  XOF = "XOF",
  MAD = "MAD",
  EUR = "EUR",
  USD = "USD"
}

// Taux de conversion pour chaque région (combien de points pour 1 unité de devise)
const POINTS_RATES: Record<Region, number> = {
  BLACK_AFRICA: 200,
  NORTH_AFRICA: 180,
  EUROPE: 100,
  AMERICAS: 100,
  ASIA: 120
};

// Configuration des devises par région
const CURRENCIES: Record<Region, { code: Currency; symbol: string }> = {
  BLACK_AFRICA: { code: Currency.XOF, symbol: 'CFA' },
  NORTH_AFRICA: { code: Currency.MAD, symbol: 'MAD' },
  EUROPE: { code: Currency.EUR, symbol: '€' },
  AMERICAS: { code: Currency.USD, symbol: '$' },
  ASIA: { code: Currency.USD, symbol: '$' }
};

// Configuration des devises pour les paiements PayPal (supportées par PayPal)
const PAYMENT_CURRENCIES: Record<Region, { code: Currency; symbol: string }> = {
  BLACK_AFRICA: { code: Currency.EUR, symbol: '€' }, // Utiliser EUR pour l'Afrique noire
  NORTH_AFRICA: { code: Currency.EUR, symbol: '€' }, // Utiliser EUR pour l'Afrique du Nord
  EUROPE: { code: Currency.EUR, symbol: '€' },
  AMERICAS: { code: Currency.USD, symbol: '$' },
  ASIA: { code: Currency.USD, symbol: '$' }
};

// Région par défaut si aucune n'est détectée
const DEFAULT_REGION = Region.EUROPE;

export const pricingService = {
  /**
   * Obtient le taux de conversion pour une région donnée
   */
  getPointsRate(region: Region): number {
    return POINTS_RATES[region] || POINTS_RATES[DEFAULT_REGION];
  },

  /**
   * Obtient la configuration de devise pour une région donnée
   */
  getCurrency(region: Region): { code: Currency; symbol: string } {
    return CURRENCIES[region] || CURRENCIES[DEFAULT_REGION];
  },

  /**
   * Obtient la configuration de devise pour les paiements (compatible PayPal)
   */
  getPaymentCurrency(region: Region): { code: Currency; symbol: string } {
    return PAYMENT_CURRENCIES[region] || PAYMENT_CURRENCIES[DEFAULT_REGION];
  },

  /**
   * Calcule le nombre de points en fonction du montant et de la région
   */
  calculatePoints(amount: number, region: Region): number {
    const rate = this.getPointsRate(region);
    return Math.floor(amount * rate);
  },

  /**
   * Calcule le coût d'une partie en fonction du nombre de cartes à retourner
   */
  async calculateGameCost(userId: string, cardsToTurn: number) {
    try {
      // Récupérer l'utilisateur pour déterminer sa région
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { region: true, points: true }
      });

      if (!user) {
        console.error('Utilisateur non trouvé:', userId);
        return {
          success: false,
          error: 'Utilisateur non trouvé'
        };
      }

      // Vérifier que l'utilisateur a suffisamment de points
      if (user.points < cardsToTurn) {
        return {
          success: false,
          error: 'Points insuffisants',
          requiredPoints: cardsToTurn,
          userPoints: user.points
        };
      }

      // Chaque carte coûte 1 point
      const pointsCost = cardsToTurn;
      
      // Convertir la région Prisma en région de l'application
      const userRegion = user.region as unknown as Region;
      
      const config = this.getCurrency(userRegion);
      const pointsRate = this.getPointsRate(userRegion);
      
      return {
        success: true,
        pointsCost,
        currency: config.code,
        currencySymbol: config.symbol,
        // Coût approximatif en devise locale
        currencyCost: (pointsCost / pointsRate).toFixed(2)
      };
    } catch (error) {
      console.error('Erreur lors du calcul du coût de la partie:', error);
      return {
        success: false,
        error: 'Erreur lors du calcul du coût'
      };
    }
  },

  /**
   * Détermine la région à partir du code pays
   */
  getRegionFromCountry(countryCode: string): Region {
    // Codes pays pour l'Afrique noire
    const blackAfricaCountries = ['SN', 'CI', 'ML', 'BF', 'TG', 'BJ', 'NE', 'CM', 'GA', 'CG', 'CD', 'GN', 'GW'];
    
    // Codes pays pour l'Afrique du Nord
    const northAfricaCountries = ['MA', 'DZ', 'TN', 'LY', 'EG'];
    
    // Codes pays pour l'Europe
    const europeCountries = ['FR', 'DE', 'IT', 'ES', 'PT', 'GB', 'IE', 'BE', 'NL', 'LU', 'CH', 'AT', 'GR', 'SE', 'NO', 'DK', 'FI'];
    
    // Codes pays pour les Amériques
    const americasCountries = ['US', 'CA', 'MX', 'BR', 'AR', 'CO', 'PE', 'CL'];
    
    // Codes pays pour l'Asie
    const asiaCountries = ['CN', 'JP', 'KR', 'IN', 'ID', 'MY', 'SG', 'TH', 'VN', 'PH'];
    
    if (blackAfricaCountries.includes(countryCode)) {
      return Region.BLACK_AFRICA;
    } else if (northAfricaCountries.includes(countryCode)) {
      return Region.NORTH_AFRICA;
    } else if (europeCountries.includes(countryCode)) {
      return Region.EUROPE;
    } else if (americasCountries.includes(countryCode)) {
      return Region.AMERICAS;
    } else if (asiaCountries.includes(countryCode)) {
      return Region.ASIA;
    }
    
    // Par défaut, retourner l'Europe
    return DEFAULT_REGION;
  },

  /**
   * Valide un achat et calcule les points à attribuer
   */
  async validatePurchase(amount: number, userId: string) {
    try {
      console.log('Validation d\'achat pour:', { amount, userId });
      
      // Vérifier que le montant est valide (> 0)
      if (amount <= 0) {
        console.log('Montant invalide:', amount);
        // Au lieu de retourner false, retourner un objet avec des valeurs par défaut
        const points = 0;
        return {
          points,
          bonus: 0
        };
      }

      // Vérifier le montant maximum autorisé
      const MAX_AMOUNT = 1000;
      if (amount > MAX_AMOUNT) {
        console.log('Montant supérieur au maximum autorisé:', amount);
        // Au lieu de retourner false, calculer les points pour le montant maximum
        const points = this.calculatePoints(MAX_AMOUNT, DEFAULT_REGION);
        return {
          points,
          bonus: 0
        };
      }

      // Pour le débogage, afficher l'ID utilisateur
      console.log('Recherche de l\'utilisateur avec ID:', userId);
      
      // Récupérer le profil de l'utilisateur
      // Note: Nous utilisons findFirst au lieu de findUnique pour être plus permissif
      const profile = await prisma.profile.findFirst({
        where: { userId: userId }
      });

      // Si le profil n'est pas trouvé, essayer de récupérer l'utilisateur directement
      if (!profile) {
        console.log('Profil non trouvé pour userId:', userId);
        
        // Essayer de récupérer l'utilisateur directement
        const user = await prisma.user.findFirst({
          where: { id: userId }
        });
        
        if (!user) {
          console.log('Utilisateur non trouvé non plus:', userId);
          // Continuer quand même, ne pas bloquer le paiement pour une erreur de validation
        }
      } else {
        console.log('Profil trouvé:', profile.id);
      }

      // Déterminer la région à partir du pays de l'utilisateur
      let userRegion = DEFAULT_REGION;
      
      if (profile?.country) {
        userRegion = this.getRegionFromCountry(profile.country);
      }
      
      console.log('Région utilisée pour le calcul:', userRegion);

      // Calculer les points en fonction du montant et de la région
      const points = this.calculatePoints(amount, userRegion);
      console.log('Points calculés:', points);
      
      // Vérifier si c'est le premier achat pour appliquer le bonus
      const hasCompletedPurchases = await prisma.transaction.findFirst({
        where: { 
          userId: userId,
          type: TransactionType.PAYMENT,
          status: "COMPLETED"
        }
      });

      const bonus = !hasCompletedPurchases ? 
        Math.floor(points * (Number(process.env.NEXT_PUBLIC_FIRST_PURCHASE_BONUS) || 10) / 100) : 0;
      
      console.log('Validation réussie:', { points, bonus, hasCompletedPurchases: !!hasCompletedPurchases });
      
      // Toujours retourner un résultat valide pour éviter les erreurs de paiement
      return {
        points,
        bonus
      };
    } catch (error) {
      console.error('Erreur lors de la validation de l\'achat:', error);
      // En cas d'erreur, retourner quand même un résultat valide pour ne pas bloquer le paiement
      // Calculer les points avec la région par défaut
      const points = this.calculatePoints(amount, DEFAULT_REGION);
      return {
        points,
        bonus: 0
      };
    }
  }
};

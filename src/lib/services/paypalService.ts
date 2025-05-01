import { prisma } from '@/lib/prisma';
import { Region } from '@/lib/constants/regions';
import { Prisma, User, TransactionType, TransactionStatus } from '@prisma/client';
import { PAYPAL_BASE_URL, PAYPAL_CARD_PAYMENT_URL } from '@/lib/constants/paypal';

// Déterminer le mode PayPal (live ou sandbox)
// Utiliser NEXT_PUBLIC_PAYPAL_MODE pour que la variable soit accessible côté client
const PAYPAL_MODE = process.env.NEXT_PUBLIC_PAYPAL_MODE || process.env.PAYPAL_MODE || 'sandbox';
console.log('Mode PayPal détecté:', PAYPAL_MODE);

// Sélectionner l'ID client et le secret en fonction du mode
// Vérifier d'abord si NEXT_PUBLIC_PAYPAL_CLIENT_ID est défini (pour la compatibilité avec le code existant)
let PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

// Si NEXT_PUBLIC_PAYPAL_CLIENT_ID n'est pas défini, utiliser les variables spécifiques au mode
if (!PAYPAL_CLIENT_ID) {
  PAYPAL_CLIENT_ID = PAYPAL_MODE === 'live' 
    ? process.env.PAYPAL_CLIENT_ID_LIVE 
    : process.env.PAYPAL_CLIENT_ID_SANDBOX;
}

// Vérifier si l'ID client PayPal est défini
if (!PAYPAL_CLIENT_ID) {
  console.warn(`ATTENTION: Les identifiants PayPal ne sont pas définis dans les variables d'environnement.`);
  console.warn(`Vérifiez NEXT_PUBLIC_PAYPAL_CLIENT_ID ou PAYPAL_CLIENT_ID_${PAYPAL_MODE.toUpperCase()}.`);
}

// Note: Le secret PayPal n'est pas utilisé dans cette implémentation côté client
// Il serait nécessaire uniquement pour des opérations côté serveur comme les webhooks

console.log(`PayPal configuré en mode: ${PAYPAL_MODE}`);
if (PAYPAL_CLIENT_ID) {
  console.log(`ID Client PayPal configuré: ${PAYPAL_CLIENT_ID.substring(0, 8)}...`);
}

export type PaymentDetails = {
  userId: string;
  amount: number;
  currency: string;
  points: number;
  bonus?: number;
  region: Region;
};

export type PaymentError = {
  message: string;
  code?: string;
  details?: unknown;
};

export const paypalService = {
  // Vérifier si l'ID client PayPal est configuré
  isConfigured() {
    return !!PAYPAL_CLIENT_ID;
  },
  
  // Obtenir l'ID client PayPal
  getClientId() {
    return PAYPAL_CLIENT_ID;
  },
  
  // Obtenir le mode PayPal actuel
  getMode() {
    return PAYPAL_MODE;
  },
  
  // Générer les paramètres pour un formulaire PayPal
  generatePaypalParams(details: PaymentDetails): Record<string, string> {
    // Calculer le nombre de points en fonction du montant et de la région
    const points = details.points;
    
    // Récupérer l'email du compte PayPal (doit être configuré dans les variables d'environnement)
    const paypalEmail = process.env.NEXT_PUBLIC_PAYPAL_EMAIL || process.env.PAYPAL_EMAIL || '';
    
    if (!paypalEmail) {
      console.error('Erreur: Email PayPal non configuré dans les variables d\'environnement');
    }
    
    // Formater le montant avec 2 décimales
    const formattedAmount = Number(details.amount).toFixed(2);
    
    // URL complète de l'application pour les retours
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Créer l'objet de paramètres
    return {
      cmd: '_xclick',
      business: paypalEmail,
      item_name: `${points} points Bingoo`,
      amount: formattedAmount,
      currency_code: details.currency,
      return: `${appUrl}/api/payments/success`,
      cancel_return: `${appUrl}/api/payments/cancel`,
      custom: JSON.stringify({
        userId: details.userId,
        points: points,
        region: details.region
      }),
      no_shipping: '1',
      no_note: '1',
      lc: 'FR',
      charset: 'UTF-8'
    };
  },
  
  // Obtenir l'URL de base PayPal
  getPaypalBaseUrl(): string {
    return PAYPAL_BASE_URL;
  },
  
  // Obtenir l'URL pour le paiement direct par carte sans compte PayPal
  getPaypalCardPaymentUrl(): string {
    return PAYPAL_CARD_PAYMENT_URL;
  },
  
  // Générer une URL de redirection PayPal directe (ancienne méthode, gardée pour référence)
  generatePaypalRedirectUrl(details: PaymentDetails): string {
    console.warn('Cette méthode est dépréciée, utilisez generatePaypalForm à la place');
    
    // Utiliser le bon endpoint PayPal
    const baseUrl = this.getPaypalBaseUrl();
    
    // Calculer le nombre de points en fonction du montant et de la région
    const points = details.points;
    
    // Récupérer l'email du compte PayPal (doit être configuré dans les variables d'environnement)
    const paypalEmail = process.env.NEXT_PUBLIC_PAYPAL_EMAIL || process.env.PAYPAL_EMAIL || '';
    
    if (!paypalEmail) {
      console.error('Erreur: Email PayPal non configuré dans les variables d\'environnement');
      return '';
    }
    
    // Formater le montant avec 2 décimales
    const formattedAmount = Number(details.amount).toFixed(2);
    
    // URL complète de l'application pour les retours
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Créer l'URL de redirection
    const params = new URLSearchParams({
      cmd: '_xclick',
      business: paypalEmail,
      item_name: `${points} points Bingoo`,
      amount: formattedAmount,
      currency_code: details.currency,
      return: `${appUrl}/api/payments/success`,
      cancel_return: `${appUrl}/api/payments/cancel`,
      custom: JSON.stringify({
        userId: details.userId,
        points: points,
        region: details.region
      }),
      no_shipping: '1',
      no_note: '1',
      lc: 'FR',
      charset: 'UTF-8'
    });
    
    return `${baseUrl}?${params.toString()}`;
  },
  
  // Générer une URL pour le paiement direct par carte sans compte PayPal
  generateCardPaymentUrl(details: PaymentDetails): string {
    // Utiliser l'URL spécifique pour le paiement par carte
    const baseUrl = this.getPaypalCardPaymentUrl();
    
    // Récupérer l'email du compte PayPal (doit être configuré dans les variables d'environnement)
    const paypalEmail = process.env.NEXT_PUBLIC_PAYPAL_EMAIL || process.env.PAYPAL_EMAIL || '';
    
    if (!paypalEmail) {
      console.error('Erreur: Email PayPal non configuré dans les variables d\'environnement');
      return '';
    }
    
    // Formater le montant avec 2 décimales
    const formattedAmount = Number(details.amount).toFixed(2);
    
    // URL complète de l'application pour les retours
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Données personnalisées pour le traitement du paiement
    const customData = JSON.stringify({
      userId: details.userId,
      points: details.points,
      region: details.region
    });
    
    // Créer l'URL de redirection pour le paiement par carte
    const params = new URLSearchParams({
      business: paypalEmail,
      amount: formattedAmount,
      currency_code: details.currency,
      item_name: `${details.points} points Bingoo`,
      custom: customData,
      return: `${appUrl}/api/payments/success`,
      cancel_return: `${appUrl}/api/payments/cancel`
    });
    
    return `${baseUrl}?${params.toString()}`;
  },
  
  async createOrder(details: PaymentDetails) {
    try {
      if (!details.userId) {
        throw new Error('ID utilisateur manquant pour la création de la commande');
      }

      // Vérifier que l'utilisateur existe
      const userExists = await prisma.user.findUnique({
        where: { id: details.userId }
      });

      if (!userExists) {
        throw new Error('Utilisateur non trouvé');
      }

      // Créer une transaction en attente
      const transaction = await prisma.transaction.create({
        data: {
          userId: details.userId,
          pointsAmount: details.points + (details.bonus || 0),
          type: TransactionType.PAYMENT_PENDING, // Marquer comme en attente
          status: TransactionStatus.PENDING,
          description: `Achat de ${details.points} points`,
        }
      });

      console.log('Transaction créée avec succès:', transaction.id);

      return {
        transactionId: transaction.id,
        amount: details.amount,
        currency: details.currency
      };
    } catch (error) {
      console.error('Erreur lors de la création de la commande PayPal:', error);
      throw new Error(error instanceof Error ? error.message : 'Impossible de créer la commande PayPal');
    }
  },

  async capturePayment(orderId: string, transactionId: string) {
    try {
      console.log('Tentative de capture du paiement:', { orderId, transactionId });
      
      // Vérifier que la transaction existe
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });

      if (!existingTransaction) {
        throw new Error(`Transaction ${transactionId} non trouvée`);
      }

      // Mettre à jour la transaction
      const transaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          type: TransactionType.PAYMENT,
          status: TransactionStatus.COMPLETED,
          description: `Paiement PayPal ${orderId}`
        }
      });

      console.log('Transaction mise à jour avec succès:', transaction.id);

      // Ajouter les points à l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          points: {
            increment: transaction.pointsAmount
          },
          updatedAt: new Date()
        }
      });

      console.log('Points ajoutés à l\'utilisateur:', {
        userId: updatedUser.id,
        pointsAdded: transaction.pointsAmount,
        newTotalPoints: updatedUser.points
      });

      return transaction;
    } catch (error) {
      console.error('Erreur lors de la capture du paiement PayPal:', error);
      throw new Error(error instanceof Error ? error.message : 'Impossible de capturer le paiement PayPal');
    }
  },

  async handlePaymentError(transactionId: string, error: PaymentError) {
    try {
      console.log('Gestion de l\'erreur de paiement:', { transactionId, error });
      
      // Vérifier que la transaction existe
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });

      if (!existingTransaction) {
        console.error(`Transaction ${transactionId} non trouvée lors de la gestion de l'erreur`);
        return;
      }

      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          type: TransactionType.PAYMENT_FAILED,
          status: TransactionStatus.FAILED,
          description: error.message || 'Erreur inconnue'
        }
      });
      
      console.log('Transaction marquée comme échouée');
    } catch (dbError) {
      console.error('Erreur lors de la mise à jour de la transaction:', dbError);
    }
  }
};

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TransactionStatus, TransactionType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de l'URL
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const transactionId = searchParams.get('transactionId');

    if (transactionId) {
      console.log('Callback d\'annulation PayPal reçu:', { orderId, transactionId });

      // Vérifier que la transaction existe
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });

      if (transaction) {
        // Mettre à jour la transaction pour indiquer qu'elle a été annulée
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            type: TransactionType.PAYMENT_FAILED,
            status: TransactionStatus.FAILED, // Utiliser FAILED au lieu de CANCELLED qui n'existe pas
            description: `Paiement PayPal annulé par l'utilisateur`
          }
        });

        console.log('Transaction marquée comme annulée:', transactionId);
      }
    }

    // Rediriger vers la page d'annulation
    return NextResponse.redirect(new URL('/points/buy?cancelled=true', request.url));
  } catch (error) {
    console.error('Erreur lors du traitement du callback d\'annulation PayPal:', error);
    return NextResponse.redirect(new URL('/points/buy?error=true', request.url));
  }
}

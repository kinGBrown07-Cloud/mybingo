import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TransactionStatus, TransactionType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de l'URL
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const transactionId = searchParams.get('transactionId');

    if (!orderId || !transactionId) {
      console.error('Paramètres manquants dans la callback de succès PayPal');
      // Rediriger vers la page d'erreur
      return NextResponse.redirect(new URL('/payment-error?reason=missing-params', request.url));
    }

    console.log('Callback de succès PayPal reçu:', { orderId, transactionId });

    // Vérifier que la transaction existe
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      console.error(`Transaction ${transactionId} non trouvée`);
      return NextResponse.redirect(new URL('/payment-error?reason=transaction-not-found', request.url));
    }

    // Mettre à jour la transaction si elle n'est pas déjà complétée
    if (transaction.status !== TransactionStatus.COMPLETED) {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          type: TransactionType.PAYMENT,
          status: TransactionStatus.COMPLETED,
          description: `Paiement PayPal ${orderId} (callback)`
        }
      });

      // Ajouter les points à l'utilisateur
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          points: {
            increment: transaction.pointsAmount
          },
          updatedAt: new Date()
        }
      });

      console.log('Points ajoutés à l\'utilisateur:', {
        userId: transaction.userId,
        pointsAdded: transaction.pointsAmount
      });
    }

    // Rediriger vers la page de succès
    return NextResponse.redirect(new URL('/payment-success', request.url));
  } catch (error) {
    console.error('Erreur lors du traitement du callback de succès PayPal:', error);
    return NextResponse.redirect(new URL('/payment-error?reason=server-error', request.url));
  }
}

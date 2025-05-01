import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Récupérer l'ID utilisateur depuis les paramètres de requête
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }
    
    // Récupérer toutes les transactions de l'utilisateur
    const userTransactions = await prisma.transaction.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
    
    // Calculer le solde manuellement
    let balance = 0;
    
    // Convertir les transactions pour l'API
    const transactions = userTransactions.map(transaction => {
      // Calculer le solde
      if (transaction.status === 'COMPLETED') {
        if (transaction.type === 'PAYMENT') {
          // Utiliser 0 comme valeur par défaut pour bonus puisque cette propriété peut ne pas exister
          balance += transaction.pointsAmount;
        } else if (transaction.type === 'WIN') {
          balance += transaction.pointsAmount;
        } else if (transaction.type === 'WITHDRAWAL') {
          balance -= transaction.pointsAmount;
        }
      }
      
      // Formater la transaction pour l'API
      return {
        id: transaction.id,
        type: transaction.type,
        status: transaction.status,
        pointsAmount: transaction.pointsAmount,
        // Utiliser undefined comme valeur par défaut pour bonus
        bonus: undefined,
        createdAt: transaction.createdAt,
        description: transaction.description || ''
      };
    });
    
    return NextResponse.json({
      balance,
      transactions
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des transactions' },
      { status: 500 }
    );
  }
}

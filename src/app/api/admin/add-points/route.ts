import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, amount, note } = await request.json();

    // Vérifier les données requises
    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'User ID and amount are required' },
        { status: 400 }
      );
    }

    // Mettre à jour les points de l'utilisateur
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Ajouter la transaction
      await tx.transaction.create({
        data: {
          profileId: userId,
          amount: 0, // Pas de montant monétaire
          pointsAmount: amount,
          type: 'ADMIN_POINTS',
          status: 'COMPLETED',
        }
      });

      // Mettre à jour les points de l'utilisateur
      return await tx.profile.update({
        where: { id: userId },
        data: {
          points: {
            increment: amount
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error adding points:', error);
    return NextResponse.json(
      { error: 'Failed to add points' },
      { status: 500 }
    );
  }
}

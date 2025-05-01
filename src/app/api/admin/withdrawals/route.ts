import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Récupérer toutes les demandes de retrait en attente
export async function GET() {
  try {
    const withdrawals = await prisma.transaction.findMany({
      where: {
        type: 'WITHDRAWAL',
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les données pour l'affichage
    const formattedWithdrawals = withdrawals.map(withdrawal => ({
      id: withdrawal.id,
      userId: withdrawal.userId,
      pointsAmount: withdrawal.pointsAmount,
      createdAt: withdrawal.createdAt,
      status: withdrawal.status,
      description: withdrawal.description,
      email: withdrawal.user?.email || 'N/A',
      username: withdrawal.user?.username || 'N/A',
      playerName: `${withdrawal.user?.firstName || ''} ${withdrawal.user?.lastName || ''}`.trim() || 'N/A'
    }));

    return NextResponse.json(formattedWithdrawals);
  } catch (error) {
    console.error('Erreur lors de la récupération des retraits:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération des retraits' },
      { status: 500 }
    );
  }
}

// Mettre à jour le statut d'un retrait
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, status, description } = body;

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: 'ID de transaction et statut requis' },
        { status: 400 }
      );
    }

    // Vérifier que le statut est valide
    if (!['COMPLETED', 'FAILED'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide. Utilisez COMPLETED ou FAILED' },
        { status: 400 }
      );
    }

    // Récupérer la transaction pour vérifier qu'elle existe et qu'elle est bien un retrait en attente
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction non trouvée' },
        { status: 404 }
      );
    }

    if (transaction.type !== 'WITHDRAWAL') {
      return NextResponse.json(
        { error: 'Cette transaction n\'est pas un retrait' },
        { status: 400 }
      );
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Ce retrait a déjà été traité' },
        { status: 400 }
      );
    }

    // Si le statut est FAILED, rembourser les points à l'utilisateur
    let updatedUser = null;
    if (status === 'FAILED') {
      updatedUser = await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          points: { increment: transaction.pointsAmount }
        }
      });
    }

    // Mettre à jour la transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
        description: description || `Retrait ${status === 'COMPLETED' ? 'validé' : 'refusé'} par l'administrateur`
      }
    });

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du retrait:', error);
    return NextResponse.json(
      { error: 'Échec de la mise à jour du retrait' },
      { status: 500 }
    );
  }
}

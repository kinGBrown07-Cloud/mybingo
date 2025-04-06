import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Récupérer les statistiques des utilisateurs
    const [totalUsers, activeUsers] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({
        where: { isActive: true }
      })
    ]);

    // Récupérer les statistiques des transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED'
      },
      select: {
        amount: true
      }
    });

    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Récupérer les statistiques des jeux
    const games = await prisma.gameSession.findMany({
      select: {
        hasWon: true,
        points: true
      }
    });

    const totalGamesPlayed = games.length;
    const totalWinnings = games.reduce((sum, game) => sum + (game.hasWon ? game.points : 0), 0);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalTransactions,
      totalRevenue,
      totalGamesPlayed,
      totalWinnings
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Récupérer les gains (parties gagnées) avec les informations utilisateur
    const winnings = await prisma.gameSession.findMany({
      where: {
        hasWon: true
      },
      select: {
        id: true,
        type: true,
        profileId: true,
        points: true,
        hasWon: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les données pour l'affichage
    const formattedWinnings = winnings.map(win => ({
      id: win.id,
      userId: win.profileId,
      gameType: win.type,
      bet: win.points, // Utiliser points comme mise
      winAmount: win.points,
      createdAt: win.createdAt,
      email: win.profile?.user?.email || 'N/A',
      username: win.profile?.user?.username || 'N/A',
      playerName: `${win.profile?.firstName || ''} ${win.profile?.lastName || ''}`.trim() || 'N/A'
    }));

    return NextResponse.json(formattedWinnings);
  } catch (error) {
    console.error('Error fetching winnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winnings' },
      { status: 500 }
    );
  }
}

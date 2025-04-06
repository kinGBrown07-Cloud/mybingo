import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const games = await prisma.gameSession.findMany({
      select: {
        id: true,
        type: true,
        profileId: true,
        points: true,
        hasWon: true,
        matchedPairs: true,
        createdAt: true,
        profile: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

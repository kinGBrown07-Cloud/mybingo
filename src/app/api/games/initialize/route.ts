import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GameType, Prisma, User, TransactionType, TransactionStatus } from '@prisma/client';

type UserWithGameStats = User & {
  balance: number;
  totalGamesPlayed: number;
};

// Fonction pour convertir les types de jeu frontend vers les types de la base de données
function getGameType(frontendType: string): GameType {
  switch (frontendType) {
    case 'FOODS':
      return 'CLASSIC';
    case 'MODE':
      return 'MAGIC';
    case 'JACKPOT':
      return 'GOLD';
    default:
      throw new Error('Type de jeu invalide');
  }
}

function validateMinBet(gameType: 'FOODS' | 'MODE' | 'JACKPOT', betAmount: number): void {
  const minBets = {
    'FOODS': 1,
    'MODE': 10,
    'JACKPOT': 20
  } as const;

  const minBet = minBets[gameType];
  if (betAmount < minBet) {
    throw new Error(`Mise minimum de ${minBet} points pour ${gameType}`);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { gameType, betAmount } = await request.json();
    
    try {
      validateMinBet(gameType, betAmount);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
    
    const dbGameType = getGameType(gameType);

    // Trouver le profil et l'utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    }) as { id: string; userId: string; user: UserWithGameStats } | null;

    if (!profile || !profile.user) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    if (profile.user.balance < betAmount) {
      return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 });
    }

    // Trouver un jeu actif du bon type
    const game = await prisma.$queryRaw`
      SELECT id, type, "isActive"
      FROM games
      WHERE type = ${dbGameType}
      AND "isActive" = true
      LIMIT 1
    `;

    if (!game || !Array.isArray(game) || game.length === 0) {
      return NextResponse.json({ error: 'Jeu non disponible' }, { status: 404 });
    }

    const activeGame = game[0];

    // Créer une nouvelle session de jeu
    const sessionId = await prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO game_sessions (id, profile_id, game_id, type, points, has_won, matched_pairs, result)
      VALUES (gen_random_uuid(), ${profile.id}, ${activeGame.id}, ${dbGameType}, ${betAmount}, false, 0, null)
      RETURNING id
    `;

    const gameSession = sessionId[0];

    // Mettre à jour le solde de l'utilisateur
    await prisma.$executeRaw`
      UPDATE users
      SET balance = balance - ${betAmount},
          total_games_played = total_games_played + 1
      WHERE id = ${profile.userId}
    `;

    // Créer une transaction pour le pari
    await prisma.$executeRaw`
      INSERT INTO transactions (id, user_id, game_session_id, type, status, points_amount, description)
      VALUES (gen_random_uuid(), ${profile.userId}, ${gameSession.id}, ${TransactionType.BET}, ${TransactionStatus.COMPLETED}, ${betAmount}, ${`Mise pour ${gameType}`})
    `;

    const newGameSession = await prisma.$queryRaw<Array<{
      id: string;
      type: GameType;
      points: number;
      has_won: boolean;
      matched_pairs: number;
      result: Record<string, unknown> | null;
      profile_id: string;
      game_id: string;
    }>>`
      SELECT id, type, points, has_won, matched_pairs, result, profile_id, game_id
      FROM game_sessions
      WHERE id = ${gameSession.id}
    `;

    return NextResponse.json({ 
      gameSession: newGameSession[0],
      remainingPoints: profile.user.balance - betAmount
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du jeu:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

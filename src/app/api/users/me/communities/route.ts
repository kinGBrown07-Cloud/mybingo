import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserCommunities } from '@/lib/services/communityService';

/**
 * GET /api/users/me/communities
 * Récupère toutes les communautés dont l'utilisateur actuel est membre
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const communities = await getUserCommunities(session.user.id);

    return NextResponse.json({ communities });
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de la récupération des communautés:', error);
    return NextResponse.json(
      { error: errorMessage || 'Impossible de récupérer les communautés' },
      { status: 500 }
    );
  }
}

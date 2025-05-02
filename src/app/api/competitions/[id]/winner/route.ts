import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { declareCauseWinner } from '@/lib/services/causesService';

/**
 * POST /api/competitions/[id]/winner
 * Déclare une communauté gagnante d'une cause (admin uniquement)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Vérifier si l'utilisateur est un admin
    const { role } = session.user;
    if (role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can declare winners.' },
        { status: 403 }
      );
    }
    
    // Déclarer la communauté gagnante
    const competition = await declareCauseWinner(params.id, session.user.id);
    
    return NextResponse.json({ 
      competition,
      message: 'Communauté déclarée gagnante avec succès'
    });
  } catch (error: Error | unknown) {
    console.error('Error declaring winner:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: errorMessage || 'Failed to declare winner' },
      { status: 500 }
    );
  }
}

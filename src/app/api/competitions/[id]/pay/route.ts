import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { payForCause } from '@/lib/services/causesService';

/**
 * POST /api/competitions/[id]/pay
 * Permet à une communauté de payer pour participer à une cause
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
    
    // Effectuer le paiement
    const competition = await payForCause(params.id, session.user.id);
    
    return NextResponse.json({ 
      competition,
      message: 'Paiement effectué avec succès'
    });
  } catch (error: Error | unknown) {
    console.error('Error paying for cause:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: errorMessage || 'Failed to process payment' },
      { status: 500 }
    );
  }
}

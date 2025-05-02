import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { registerCommunityForCause } from '@/lib/services/causesService';
import { z } from 'zod';

// Schéma de validation pour rejoindre une cause
const joinCauseSchema = z.object({
  communityId: z.string().uuid("L'ID de la communauté doit être un UUID valide"),
});

/**
 * POST /api/causes/[id]/join
 * Permet à une communauté de rejoindre une cause
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
    
    const body = await req.json();
    
    // Valider les données
    const validatedData = joinCauseSchema.parse(body);
    
    // Inscrire la communauté à la cause
    const competition = await registerCommunityForCause(
      params.id,
      validatedData.communityId,
      session.user.id
    );
    
    return NextResponse.json({ competition }, { status: 201 });
  } catch (error: z.ZodError | Error | unknown) {
    console.error('Error joining cause:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: errorMessage || 'Failed to join cause' },
      { status: 500 }
    );
  }
}

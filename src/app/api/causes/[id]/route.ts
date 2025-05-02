import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCauseById, updateCause, activateCause } from '@/lib/services/causesService';
import { z } from 'zod';

// Schéma de validation pour la mise à jour d'une cause
const updateCauseSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères").optional(),
  description: z.string().optional(),
  targetAmount: z.number().positive("Le montant cible doit être positif").optional(),
  imageUrl: z.string().url().optional(),
  startDate: z.string().transform(val => new Date(val)).optional(),
  endDate: z.string().transform(val => new Date(val)).optional(),
  maxCommunities: z.number().int().positive("Le nombre maximum de communautés doit être positif").optional(),
  packPrice: z.number().positive("Le prix du pack doit être positif").optional(),
  winningAmount: z.number().positive("Le montant à gagner doit être positif").optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/causes/[id]
 * Récupère une cause spécifique
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cause = await getCauseById(params.id);
    
    if (!cause) {
      return NextResponse.json(
        { error: 'Cause not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ cause });
  } catch (error: Error | unknown) {
    console.error('Error fetching cause:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: errorMessage || 'Failed to fetch cause' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/causes/[id]
 * Met à jour une cause spécifique
 */
export async function PATCH(
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
    const validatedData = updateCauseSchema.parse(body);
    
    // Mettre à jour la cause
    const cause = await updateCause(params.id, validatedData, session.user.id);
    
    if (!cause) {
      return NextResponse.json(
        { error: 'Cause not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ cause });
  } catch (error: z.ZodError | Error | unknown) {
    console.error('Error updating cause:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: errorMessage || 'Failed to update cause' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/causes/[id]/activate
 * Active une cause (la rend disponible pour les compétitions)
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
        { error: 'Unauthorized. Only admins can activate causes.' },
        { status: 403 }
      );
    }
    
    // Activer la cause
    const cause = await activateCause(params.id, session.user.id);
    
    if (!cause) {
      return NextResponse.json(
        { error: 'Cause not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ cause });
  } catch (error: Error | unknown) {
    console.error('Error activating cause:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: errorMessage || 'Failed to activate cause' },
      { status: 500 }
    );
  }
}

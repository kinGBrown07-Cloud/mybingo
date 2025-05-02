import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createCause, getAllCauses } from '@/lib/services/causesService';
import { z } from 'zod';

// Schéma de validation pour la création d'une cause
const createCauseSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  targetAmount: z.number().positive("Le montant cible doit être positif"),
  imageUrl: z.string().url().optional(),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)).optional(),
  maxCommunities: z.number().int().positive("Le nombre maximum de communautés doit être positif"),
  packPrice: z.number().positive("Le prix du pack doit être positif"),
  winningAmount: z.number().positive("Le montant à gagner doit être positif"),
});

/**
 * GET /api/causes
 * Récupère toutes les causes communautaires
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    const causes = await getAllCauses(limit, offset, includeInactive);

    return NextResponse.json({ causes });
  } catch (error: Error | unknown) {
    console.error('Error fetching causes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: errorMessage || 'Failed to fetch causes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/causes
 * Crée une nouvelle cause communautaire
 */
export async function POST(req: NextRequest) {
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
        { error: 'Unauthorized. Only admins can create causes.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    // Valider les données
    const validatedData = createCauseSchema.parse(body);
    
    // Créer la cause
    const cause = await createCause(validatedData, session.user.id);

    return NextResponse.json({ cause }, { status: 201 });
  } catch (error: z.ZodError | Error | unknown) {
    console.error('Error creating cause:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: errorMessage || 'Failed to create cause' },
      { status: 500 }
    );
  }
}

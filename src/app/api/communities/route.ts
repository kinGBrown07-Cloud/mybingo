import { getSession } from '@/lib/session';
import { createCommunity, getAllCommunities } from '@/lib/services/communityService';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/types/api-error';

// Schema for community creation
const createCommunitySchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  cause: z.string().min(3).max(100),
  targetAmount: z.number().int().min(1000),
  imageUrl: z.string().url().optional(),
});

/**
 * GET /api/communities
 * Get all communities with pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const communities = await getAllCommunities(limit, offset, includeInactive);

    return NextResponse.json({ communities });
  } catch (error: Error | ApiError | unknown) {
    console.error('Error fetching communities:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch communities';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communities
 * Create a new community
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

    const body = await req.json();
    
    // Validate request body
    const validationResult = createCommunitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const community = await createCommunity(validationResult.data, session.user.id);

    return NextResponse.json({ community }, { status: 201 });
  } catch (error: Error | ApiError | unknown) {
    console.error('Error creating community:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create community';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

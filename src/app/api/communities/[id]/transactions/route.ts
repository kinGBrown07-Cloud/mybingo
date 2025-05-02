import { getSession } from '@/lib/session';
import { getCommunityById, recordCommunityTransaction, getCommunityTransactions } from '@/lib/services/communityService';
import { CommunityTransactionType } from '@prisma/client';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/types/api-error';

// Schema for community transaction
const createTransactionSchema = z.object({
  amount: z.number().int().positive(),
  type: z.enum([
    CommunityTransactionType.CONTRIBUTION,
    CommunityTransactionType.WITHDRAWAL,
    CommunityTransactionType.GAME_WIN,
    CommunityTransactionType.BONUS
  ]),
  gameSessionId: z.string().uuid().optional(),
  description: z.string().max(200).optional(),
});

/**
 * GET /api/communities/[id]/transactions
 * Get all transactions for a community
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const communityId = params.id;
    
    // Check if community exists
    const community = await getCommunityById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    const transactions = await getCommunityTransactions(communityId, limit, offset);

    return NextResponse.json({ transactions });
  } catch (error: Error | ApiError | unknown) {
    console.error(`Error fetching community transactions for ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch community transactions';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communities/[id]/transactions
 * Create a new transaction for a community
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

    const communityId = params.id;
    const body = await req.json();
    
    // Validate request body
    const validationResult = createTransactionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Check if community exists
    const community = await getCommunityById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Create transaction
    const transaction = await recordCommunityTransaction({
      communityId,
      userId: session.user.id,
      gameSessionId: validationResult.data.gameSessionId,
      amount: validationResult.data.amount,
      type: validationResult.data.type,
      description: validationResult.data.description,
    });

    return NextResponse.json(
      { transaction },
      { status: 201 }
    );
  } catch (error: Error | ApiError | unknown) {
    console.error(`Error creating community transaction for ${params.id}:`, error);
    
    // Handle specific errors
    if (error instanceof Error && error.message.includes('not a member')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create community transaction';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

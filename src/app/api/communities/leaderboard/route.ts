import { getCommunityLeaderboard } from '@/lib/services/communityService';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/types/api-error';

/**
 * GET /api/communities/leaderboard
 * Get the top communities by earnings
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const communities = await getCommunityLeaderboard(limit);

    return NextResponse.json({ communities });
  } catch (error: Error | ApiError | unknown) {
    console.error('Error fetching community leaderboard:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch community leaderboard';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

import { getSession } from '@/lib/session';
import { getCommunityById, joinCommunity, leaveCommunity, changeMemberRole } from '@/lib/services/communityService';
import { CommunityRole } from '@prisma/client';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Define a custom error type
interface ApiError extends Error {
  message: string;
  status?: number;
}

// Schema for changing member role
const changeMemberRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum([CommunityRole.ADMIN, CommunityRole.MODERATOR, CommunityRole.MEMBER]),
});

/**
 * GET /api/communities/[id]/members
 * Get all members of a community
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communityId = params.id;
    const community = await getCommunityById(communityId);

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ members: community.members });
  } catch (error: Error | ApiError | unknown) {
    console.error(`Error fetching community members for ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch community members';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communities/[id]/members
 * Join a community
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
    
    // Check if community exists
    const community = await getCommunityById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Join community
    const membership = await joinCommunity(communityId, session.user.id);

    return NextResponse.json(
      { membership },
      { status: 201 }
    );
  } catch (error: Error | ApiError | unknown) {
    console.error(`Error joining community ${params.id}:`, error);
    
    // Handle specific error for already a member
    if (error instanceof Error && error.message.includes('already a member')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to join community';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/communities/[id]/members
 * Leave a community
 */
export async function DELETE(
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
    
    // Check if community exists
    const community = await getCommunityById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Leave community
    await leaveCommunity(communityId, session.user.id);

    return NextResponse.json(
      { message: 'Successfully left the community' },
      { status: 200 }
    );
  } catch (error: Error | ApiError | unknown) {
    console.error(`Error leaving community ${params.id}:`, error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('not a member')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      if (error.message.includes('only admin')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to leave community';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/communities/[id]/members
 * Change a member's role
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

    const communityId = params.id;
    const body = await req.json();
    
    // Validate request body
    const validationResult = changeMemberRoleSchema.safeParse(body);
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

    // Change member role
    const updatedMembership = await changeMemberRole(
      communityId,
      validationResult.data.userId,
      validationResult.data.role,
      session.user.id
    );

    return NextResponse.json({ membership: updatedMembership });
  } catch (error: Error | ApiError | unknown) {
    console.error(`Error changing member role in community ${params.id}:`, error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      if (error.message.includes('not a member')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to change member role';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

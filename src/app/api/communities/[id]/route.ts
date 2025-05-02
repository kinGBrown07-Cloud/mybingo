import { getSession } from '@/lib/session';
import { getCommunityById, updateCommunity } from '@/lib/services/communityService';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Define a custom error type
interface ApiError extends Error {
  message: string;
  status?: number;
}

// Schema for community update
const updateCommunitySchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(500).optional(),
  cause: z.string().min(3).max(100).optional(),
  targetAmount: z.number().int().min(1000).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/communities/[id]
 * Get a specific community by ID
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

    return NextResponse.json({ community });
  } catch (error: Error | ApiError | unknown) {
    console.error(`Error fetching community ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch community';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/communities/[id]
 * Update a community
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
    const validationResult = updateCommunitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Check if community exists
    const existingCommunity = await getCommunityById(communityId);
    if (!existingCommunity) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Update community
    const updatedCommunity = await updateCommunity(
      communityId,
      validationResult.data,
      session.user.id
    );

    return NextResponse.json({ community: updatedCommunity });
  } catch (error: Error | ApiError | unknown) {
    console.error(`Error updating community ${params.id}:`, error);
    
    // Handle specific error for unauthorized update
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to update community';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/communities/[id]
 * Delete a community (soft delete by setting isActive to false)
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
    const existingCommunity = await getCommunityById(communityId);
    if (!existingCommunity) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    const updatedCommunity = await updateCommunity(
      communityId,
      { isActive: false },
      session.user.id
    );

    return NextResponse.json(
      { message: 'Community successfully deactivated' },
      { status: 200 }
    );
  } catch (error: Error | ApiError | unknown) {
    console.error(`Error deleting community ${params.id}:`, error);
    
    // Handle specific error for unauthorized delete
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete community';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

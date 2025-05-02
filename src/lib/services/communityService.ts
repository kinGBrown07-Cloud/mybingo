import { prisma } from '@/lib/prisma';
import { Community, CommunityMember, CommunityRole, CommunityTransaction, CommunityTransactionType, User } from '@prisma/client';
import { getSession } from '@/lib/session';
import { getUserById } from '@/lib/services/userService';

export type CommunityWithMembers = Community & {
  members: CommunityMember[];
  _count?: {
    members: number;
  };
};

export type CommunityWithStats = CommunityWithMembers & {
  totalEarnings: number;
};

/**
 * Create a new community
 */
export async function createCommunity(
  data: {
    name: string;
    description?: string;
    cause: string;
    targetAmount: number;
    imageUrl?: string;
  },
  userId: string
): Promise<Community> {
  const community = await prisma.community.create({
    data: {
      name: data.name,
      description: data.description,
      cause: data.cause,
      targetAmount: data.targetAmount,
      imageUrl: data.imageUrl,
      createdBy: userId,
    },
  });

  // Add creator as admin member
  await prisma.communityMember.create({
    data: {
      communityId: community.id,
      userId: userId,
      role: CommunityRole.ADMIN,
    },
  });

  return community;
}

/**
 * Get all communities
 */
export async function getAllCommunities(
  limit: number = 10,
  offset: number = 0,
  includeInactive: boolean = false
): Promise<CommunityWithStats[]> {
  const where = includeInactive ? {} : { isActive: true };

  const communities = await prisma.community.findMany({
    where,
    include: {
      members: {
        include: {
          user: {
            select: {
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      currentAmount: 'desc',
    },
    take: limit,
    skip: offset,
  });

  // Calculate total earnings for each community
  const communitiesWithStats = await Promise.all(
    communities.map(async (community) => {
      const totalEarnings = await prisma.communityTransaction.aggregate({
        where: {
          communityId: community.id,
          type: CommunityTransactionType.GAME_WIN,
        },
        _sum: {
          amount: true,
        },
      });

      return {
        ...community,
        totalEarnings: totalEarnings._sum.amount || 0,
      } as CommunityWithStats;
    })
  );

  return communitiesWithStats;
}

/**
 * Get a community by ID
 */
export async function getCommunityById(id: string): Promise<CommunityWithStats | null> {
  const community = await prisma.community.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!community) {
    return null;
  }

  // Calculate total earnings
  const totalEarnings = await prisma.communityTransaction.aggregate({
    where: {
      communityId: community.id,
      type: CommunityTransactionType.GAME_WIN,
    },
    _sum: {
      amount: true,
    },
  });

  return {
    ...community,
    totalEarnings: totalEarnings._sum.amount || 0,
  } as CommunityWithStats;
}

/**
 * Update a community
 */
export async function updateCommunity(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    cause: string;
    targetAmount: number;
    imageUrl: string;
    isActive: boolean;
  }>,
  userId: string
): Promise<Community | null> {
  // Check if user is admin of the community
  const membership = await prisma.communityMember.findFirst({
    where: {
      communityId: id,
      userId: userId,
      role: CommunityRole.ADMIN,
    },
  });

  if (!membership) {
    throw new Error('Unauthorized: Only community admins can update community details');
  }

  return prisma.community.update({
    where: { id },
    data,
  });
}

/**
 * Join a community
 */
export async function joinCommunity(communityId: string, userId: string): Promise<CommunityMember> {
  // Check if user is already a member
  const existingMembership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId,
        userId,
      },
    },
  });

  if (existingMembership) {
    throw new Error('User is already a member of this community');
  }

  return prisma.communityMember.create({
    data: {
      communityId,
      userId,
      role: CommunityRole.MEMBER,
    },
  });
}

/**
 * Leave a community
 */
export async function leaveCommunity(communityId: string, userId: string): Promise<boolean> {
  // Check if user is a member
  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new Error('User is not a member of this community');
  }

  // Check if user is the only admin
  if (membership.role === CommunityRole.ADMIN) {
    const adminCount = await prisma.communityMember.count({
      where: {
        communityId,
        role: CommunityRole.ADMIN,
      },
    });

    if (adminCount <= 1) {
      throw new Error('Cannot leave community: You are the only admin. Please promote another member to admin first.');
    }
  }

  await prisma.communityMember.delete({
    where: {
      id: membership.id,
    },
  });

  return true;
}

/**
 * Change member role
 */
export async function changeMemberRole(
  communityId: string,
  targetUserId: string,
  newRole: CommunityRole,
  adminUserId: string
): Promise<CommunityMember> {
  // Check if admin user is an admin of the community
  const adminMembership = await prisma.communityMember.findFirst({
    where: {
      communityId,
      userId: adminUserId,
      role: CommunityRole.ADMIN,
    },
  });

  if (!adminMembership) {
    throw new Error('Unauthorized: Only community admins can change member roles');
  }

  // Check if target user is a member
  const targetMembership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId,
        userId: targetUserId,
      },
    },
  });

  if (!targetMembership) {
    throw new Error('Target user is not a member of this community');
  }

  return prisma.communityMember.update({
    where: {
      id: targetMembership.id,
    },
    data: {
      role: newRole,
    },
  });
}

/**
 * Get communities for a user
 */
export async function getUserCommunities(userId: string): Promise<CommunityWithStats[]> {
  const memberships = await prisma.communityMember.findMany({
    where: {
      userId,
    },
    include: {
      community: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  username: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      },
    },
  });

  // Extract communities from memberships and ensure proper typing
  const communities = memberships.map((m) => {
    // TypeScript doesn't recognize the community property directly
    // so we need to use type assertion or a different approach
    const membership = m as unknown as { community: Community & { members: CommunityMember[]; _count?: { members: number } } };
    return membership.community;
  });

  // Calculate total earnings for each community
  const communitiesWithStats = await Promise.all(
    communities.map(async (community) => {
      const totalEarnings = await prisma.communityTransaction.aggregate({
        where: {
          communityId: community.id,
          type: CommunityTransactionType.GAME_WIN,
        },
        _sum: {
          amount: true,
        },
      });

      return {
        ...community,
        totalEarnings: totalEarnings._sum.amount || 0,
      } as CommunityWithStats;
    })
  );

  return communitiesWithStats;
}

/**
 * Record a community transaction
 */
export async function recordCommunityTransaction(
  data: {
    communityId: string;
    userId: string;
    gameSessionId?: string;
    amount: number;
    type: CommunityTransactionType;
    description?: string;
  }
): Promise<CommunityTransaction> {
  // Check if user is a member of the community
  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId: data.communityId,
        userId: data.userId,
      },
    },
  });

  if (!membership) {
    throw new Error('User is not a member of this community');
  }

  // Create transaction
  const transaction = await prisma.communityTransaction.create({
    data,
  });

  // Update community current amount
  if (data.type === CommunityTransactionType.GAME_WIN || data.type === CommunityTransactionType.CONTRIBUTION) {
    await prisma.community.update({
      where: {
        id: data.communityId,
      },
      data: {
        currentAmount: {
          increment: data.amount,
        },
      },
    });
  } else if (data.type === CommunityTransactionType.WITHDRAWAL) {
    await prisma.community.update({
      where: {
        id: data.communityId,
      },
      data: {
        currentAmount: {
          decrement: data.amount,
        },
      },
    });
  }

  return transaction;
}

/**
 * Get community transactions
 */
export async function getCommunityTransactions(
  communityId: string,
  limit: number = 10,
  offset: number = 0
): Promise<CommunityTransaction[]> {
  return prisma.communityTransaction.findMany({
    where: {
      communityId,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });
}

/**
 * Get community leaderboard
 */
export async function getCommunityLeaderboard(limit: number = 10): Promise<CommunityWithStats[]> {
  const communities = await prisma.community.findMany({
    where: {
      isActive: true,
    },
    include: {
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      currentAmount: 'desc',
    },
    take: limit,
  });

  // Calculate total earnings for each community
  const communitiesWithStats = await Promise.all(
    communities.map(async (community) => {
      const totalEarnings = await prisma.communityTransaction.aggregate({
        where: {
          communityId: community.id,
          type: CommunityTransactionType.GAME_WIN,
        },
        _sum: {
          amount: true,
        },
      });

      return {
        ...community,
        members: [],
        totalEarnings: totalEarnings._sum.amount || 0,
      } as CommunityWithStats;
    })
  );

  return communitiesWithStats;
}

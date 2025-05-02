import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Get user with profile by ID
 */
export async function getUserWithProfileById(id: string): Promise<User & { profile: { 
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  country: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
} | null } | null> {
  return prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
    },
  });
}

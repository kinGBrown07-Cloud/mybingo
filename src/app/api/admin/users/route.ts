import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true
      }
    });

    // Transformer les données pour correspondre à l'interface User
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.profile?.username || '',
      points: user.profile?.points || 0,
      role: user.role,
      isActive: user.profile?.termsAccepted || false,
      createdAt: user.createdAt.toISOString()
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

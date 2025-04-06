import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Vérifier la session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Mettre à jour le rôle de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'ADMIN' }
    });

    // Rafraîchir la session pour mettre à jour le rôle
    await fetch('/api/auth/session');

    return NextResponse.json({
      message: 'Successfully promoted to admin',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error promoting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

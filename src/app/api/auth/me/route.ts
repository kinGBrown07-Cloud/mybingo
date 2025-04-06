import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Retourner directement les informations de la session
    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      profile: session.user.profile
    });
  } catch (error) {
    console.error('[/api/auth/me] Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

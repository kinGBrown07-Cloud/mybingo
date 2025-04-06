import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      // Supprimer la session de la base de données
      await prisma.$executeRaw`
        DELETE FROM "sessions"
        WHERE token = ${sessionToken}
      `;
    }

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });

    // Supprimer le cookie de session
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immédiatement
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la déconnexion' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérifier le token
    const resetData = await prisma.$queryRaw<Array<{
      id: string;
      user_id: string;
      expires: Date;
    }>>`
      SELECT id, user_id, expires
      FROM "reset_tokens"
      WHERE token = ${token}
    `;

    if (resetData.length === 0) {
      return NextResponse.json(
        { error: 'Token de réinitialisation invalide' },
        { status: 400 }
      );
    }

    const reset = resetData[0];

    // Vérifier si le token n'a pas expiré
    if (reset.expires < new Date()) {
      return NextResponse.json(
        { error: 'Token de réinitialisation expiré' },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hash(newPassword, 10);

    // Mettre à jour le mot de passe et supprimer le token dans une transaction
    await prisma.$transaction([
      // Mettre à jour le mot de passe
      prisma.$executeRaw`
        UPDATE "users"
        SET 
          hashed_password = ${hashedPassword},
          updated_at = ${new Date()}
        WHERE id = ${reset.user_id}
      `,
      // Supprimer le token de réinitialisation
      prisma.$executeRaw`
        DELETE FROM "reset_tokens"
        WHERE id = ${reset.id}
      `,
      // Supprimer toutes les sessions existantes
      prisma.$executeRaw`
        DELETE FROM "sessions"
        WHERE user_id = ${reset.user_id}
      `
    ]);

    // Créer une nouvelle session
    const sessionToken = uuidv4();
    await prisma.$executeRaw`
      INSERT INTO "sessions" (
        id, user_id, token, expires, created_at, last_activity
      ) VALUES (
        ${uuidv4()},
        ${reset.user_id},
        ${sessionToken},
        ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)},
        ${new Date()},
        ${new Date()}
      )
    `;

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

    // Ajouter le cookie de session
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 jours
    });

    return response;
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
}

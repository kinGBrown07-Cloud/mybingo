import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token de vérification requis' },
        { status: 400 }
      );
    }

    // Vérifier le token
    const verificationData = await prisma.$queryRaw<Array<{
      id: string;
      user_id: string;
      expires: Date;
    }>>`
      SELECT id, user_id, expires
      FROM "verification_tokens"
      WHERE token = ${token}
    `;

    if (verificationData.length === 0) {
      return NextResponse.json(
        { error: 'Token de vérification invalide' },
        { status: 400 }
      );
    }

    const verification = verificationData[0];

    // Vérifier si le token n'a pas expiré
    if (verification.expires < new Date()) {
      return NextResponse.json(
        { error: 'Token de vérification expiré' },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur et supprimer le token dans une transaction
    await prisma.$transaction([
      // Marquer l'email comme vérifié
      prisma.$executeRaw`
        UPDATE "users"
        SET email_verified = ${new Date()}
        WHERE id = ${verification.user_id}
      `,
      // Supprimer le token de vérification
      prisma.$executeRaw`
        DELETE FROM "verification_tokens"
        WHERE id = ${verification.id}
      `
    ]);

    // Créer une nouvelle session
    const sessionToken = uuidv4();
    await prisma.$executeRaw`
      INSERT INTO "sessions" (
        id, user_id, token, expires, created_at, last_activity
      ) VALUES (
        ${uuidv4()},
        ${verification.user_id},
        ${sessionToken},
        ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)},
        ${new Date()},
        ${new Date()}
      )
    `;

    // Créer la réponse avec le cookie de session
    const response = NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès'
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
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification de l\'email' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token et email requis' },
        { status: 400 }
      );
    }

    // Utilisation de Prisma.sql pour une requête SQL brute
    const user = await prisma.$queryRaw`
      SELECT * FROM users 
      WHERE email = ${email} 
      AND verification_token = ${token}
      AND verification_expires > NOW()
      LIMIT 1
    `;

    if (!user || !Array.isArray(user) || user.length === 0) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    try {
      // Utilisation de Prisma.sql pour la mise à jour
      await prisma.$executeRaw`
        UPDATE users 
        SET is_verified = true,
            verification_token = NULL,
            verification_expires = NULL
        WHERE id = ${user[0].id}
      `;

      return NextResponse.json({
        success: true,
        message: 'Email vérifié avec succès'
      });
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError);
      return NextResponse.json(
        { error: 'Une erreur est survenue lors de la vérification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification' },
      { status: 500 }
    );
  }
}

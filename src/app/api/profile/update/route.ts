import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthdate?: string;
  country?: string;
  region?: string;
  currency?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur à partir de la session
    const sessionData = await prisma.$queryRaw<Array<{
      user_id: string;
      expires: Date;
    }>>`
      SELECT user_id, expires
      FROM "sessions"
      WHERE token = ${sessionToken}
    `;

    if (sessionData.length === 0 || sessionData[0].expires < new Date()) {
      return NextResponse.json(
        { error: 'Session expirée' },
        { status: 401 }
      );
    }

    const userId = sessionData[0].user_id;
    const data = await request.json() as UpdateProfileData;

    // Si changement de mot de passe, vérifier l'ancien
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json(
          { error: 'Mot de passe actuel requis' },
          { status: 400 }
        );
      }

      const userData = await prisma.$queryRaw<Array<{
        hashed_password: string;
      }>>`
        SELECT hashed_password
        FROM "users"
        WHERE id = ${userId}
      `;

      const isValidPassword = await hash(data.currentPassword, userData[0].hashed_password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 400 }
        );
      }
    }

    // Préparer les mises à jour
    const updates = [];

    // Mise à jour du profil
    if (data.firstName || data.lastName || data.phoneNumber || 
        data.birthdate || data.country || data.region || data.currency) {
      const profileUpdate = prisma.$executeRaw`
        UPDATE "profiles"
        SET
          ${data.firstName ? `first_name = ${data.firstName},` : ''}
          ${data.lastName ? `last_name = ${data.lastName},` : ''}
          ${data.phoneNumber ? `phone_number = ${data.phoneNumber},` : ''}
          ${data.birthdate ? `birth_date = ${new Date(data.birthdate)},` : ''}
          ${data.country ? `country = ${data.country},` : ''}
          ${data.region ? `region = ${data.region},` : ''}
          ${data.currency ? `currency = ${data.currency},` : ''}
          updated_at = ${new Date()}
        WHERE user_id = ${userId}
      `;
      updates.push(profileUpdate);
    }

    // Mise à jour du mot de passe
    if (data.newPassword) {
      const hashedPassword = await hash(data.newPassword, 10);
      const passwordUpdate = prisma.$executeRaw`
        UPDATE "users"
        SET
          hashed_password = ${hashedPassword},
          updated_at = ${new Date()}
        WHERE id = ${userId}
      `;
      updates.push(passwordUpdate);
    }

    // Exécuter les mises à jour dans une transaction
    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    // Récupérer le profil mis à jour
    const updatedProfile = await prisma.$queryRaw`
      SELECT 
        u.email, u.role, u.is_active,
        p.username, p.first_name, p.last_name, p.phone_number,
        p.birth_date, p.country, p.region, p.currency,
        p.coins, p.points, p.points_rate
      FROM "users" u
      JOIN "profiles" p ON u.id = p.user_id
      WHERE u.id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      profile: updatedProfile[0]
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

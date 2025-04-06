import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "users"
      WHERE email = ${email}
      AND is_active = true
    `;

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Aucun compte actif trouvé avec cet email' },
        { status: 404 }
      );
    }

    // Générer un token de réinitialisation
    const resetToken = uuidv4();
    const userId = user[0].id;

    // Supprimer les anciens tokens de réinitialisation
    await prisma.$executeRaw`
      DELETE FROM "reset_tokens"
      WHERE user_id = ${userId}
    `;

    // Créer un nouveau token
    await prisma.$executeRaw`
      INSERT INTO "reset_tokens" (
        id, user_id, token, expires, created_at
      ) VALUES (
        ${uuidv4()},
        ${userId},
        ${resetToken},
        ${new Date(Date.now() + 1 * 60 * 60 * 1000)}, -- 1 heure
        ${new Date()}
      )
    `;

    // TODO: Envoyer l'email avec le lien de réinitialisation
    // Le lien devrait être de la forme : /reset-password?token=${resetToken}

    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
}

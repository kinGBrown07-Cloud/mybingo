import { NextResponse } from 'next/server';
import { AuthProvider, UserRole } from '@/types/auth';
import { Region, Currency } from '@/types/prisma';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { boolean } from 'zod';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  birthdate?: string;
  country: string;
  region: Region;
  currency: Currency;
  acceptTerms: boolean;
  referralCode?: string;
}

export async function POST(req: Request) {
  try {
    const data = await req.json() as RegisterData;

    // Validation des données
    if (!data.email || !data.password || !data.firstName || !data.lastName || 
        !data.country || !data.region || !data.currency || !data.acceptTerms) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(data.password, 10);

    // Générer le nom d'utilisateur
    const username = `${data.firstName.toLowerCase()}_${Math.random().toString(36).substring(2, 7)}`;

    // Générer le token de vérification
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    try {
      // Créer l'utilisateur et son profil en utilisant une transaction SQL brute
      const result = await prisma.$transaction(async (tx) => {
        const users = await tx.$queryRaw<Array<{ id: string; email: string; }>>` 
          INSERT INTO users (
            email, 
            password_hash, 
            username,
            role,
            region,
            first_name,
            last_name,
            phone_number,
            verification_token,
            verification_expires,
            is_active,
            is_verified,
            country,
            currency,
            points_rate
          ) VALUES (
            ${data.email},
            ${hashedPassword},
            ${username},
            'USER',
            ${data.region},
            ${data.firstName},
            ${data.lastName},
            ${data.phoneNumber},
            ${verificationToken},
            ${verificationExpires},
            true,
            false,
            ${data.country},
            ${data.currency},
            1.0
          )
          RETURNING *
        `;

        const user = users[0];
        if (!user) throw new Error("Échec de la création de l'utilisateur");

        const profiles = await tx.$queryRaw<Array<{ id: string; user_id: string; }>>` 
          INSERT INTO profiles (
            user_id,
            first_name,
            last_name,
            phone_number,
            country
          ) VALUES (
            ${user.id},
            ${data.firstName},
            ${data.lastName},
            ${data.phoneNumber},
            ${data.country}
          )
          RETURNING *
        `;

        const profile = profiles[0];
        if (!profile) throw new Error("Échec de la création du profil");

        return { ...user, profile };
      });

      // Envoyer l'email de vérification
      const emailSent = await sendVerificationEmail(data.email, verificationToken);

      if (!emailSent) {
        // Si l'envoi de l'email échoue, on supprime l'utilisateur
        await prisma.$executeRaw`
          DELETE FROM users WHERE id = ${result.id}
        `;

        return NextResponse.json(
          { error: "Une erreur est survenue lors de l'envoi de l'email de vérification" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Un email de vérification a été envoyé à votre adresse email'
      });

    } catch (error) {
      console.error('Registration error:', error);
      return NextResponse.json(
        { error: 'Une erreur est survenue lors de l\'inscription' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}

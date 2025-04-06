import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthProvider } from '@/types/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password, provider = AuthProvider.EMAIL, providerToken } = await request.json();
    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');

    // Validation des données
    if (provider === AuthProvider.EMAIL && (!email || !password)) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur avec son profil
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    console.log('User found:', user);

    // Vérifier le compte est actif
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Ce compte a été désactivé' },
        { status: 403 }
      );
    }

    // Vérifier l'authentification selon le provider
    if (provider === AuthProvider.EMAIL) {
      if (!user.password_hash) {
        return NextResponse.json(
          { error: 'Ce compte utilise une autre méthode de connexion' },
          { status: 400 }
        );
      }

      const passwordValid = await compare(password, user.password_hash);
      if (!passwordValid) {
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        );
      }
    } else {
      // Vérifier le token du provider social (à implémenter)
      if (!providerToken) {
        return NextResponse.json(
          { error: 'Token d\'authentification invalide' },
          { status: 401 }
        );
      }
    }

    // Créer une nouvelle session et mettre à jour la dernière connexion
    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const ip = ipAddress || null;
    const [session] = await Promise.all([
      prisma.session.create({
        data: {
          token: sessionToken,
          expires_at: expiresAt,
          userId: user.id,
          ipAddress: ip,
          userAgent: userAgent
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })
    ]);

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      user: {
        ...user,
        password_hash: undefined,
      },
      profile: user.profile,
      token: sessionToken
    });

    // Définir le cookie de session
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}

import { PrismaClient, Profile, Region, Currency, UserRole } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface SignUpData {
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

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  token?: string;
  profile?: Omit<Profile, 'hashedPassword'>;
}

export class ServerAuth {
  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await prisma.profile.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        return {
          success: false,
          error: 'Cette adresse email est déjà utilisée'
        };
      }

      // Hasher le mot de passe
      const hashedPassword = await hash(data.password, 10);

      // Créer le profil utilisateur
      const profile = await prisma.profile.create({
        data: {
          email: data.email,
          username: data.email.split('@')[0],
          hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          birthdate: data.birthdate ? new Date(data.birthdate) : null,
          country: data.country,
          region: data.region,
          currency: data.currency,
          role: UserRole.USER,
          isActive: true,
          coins: 0,
          points: 0,
          pointsRate: 1,
          termsAccepted: data.acceptTerms,
          termsAcceptedAt: new Date(),
          referralCode: data.referralCode
        }
      });

      // Générer le token JWT
      const token = jwt.sign(
        { userId: profile.id, email: profile.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Ne pas inclure le mot de passe hashé dans la réponse
      const { hashedPassword: _, ...profileWithoutPassword } = profile;

      return {
        success: true,
        token,
        profile: profileWithoutPassword
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de l\'inscription'
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Récupérer l'utilisateur
      const profile = await prisma.profile.findUnique({
        where: { email }
      });

      if (!profile) {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect'
        };
      }

      // Vérifier le mot de passe
      const passwordValid = await compare(password, profile.hashedPassword);

      if (!passwordValid) {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect'
        };
      }

      // Générer le token JWT
      const token = jwt.sign(
        { userId: profile.id, email: profile.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Ne pas inclure le mot de passe hashé dans la réponse
      const { hashedPassword: _, ...profileWithoutPassword } = profile;

      return {
        success: true,
        token,
        profile: profileWithoutPassword
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de la connexion'
      };
    }
  }

  async getCurrentUser(token: string): Promise<Profile | null> {
    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      // Récupérer le profil
      const profile = await prisma.profile.findUnique({
        where: { id: decoded.userId }
      });

      return profile;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}

export const serverAuth = new ServerAuth();

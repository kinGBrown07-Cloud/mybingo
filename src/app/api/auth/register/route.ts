import { NextResponse } from 'next/server';
import { AuthProvider, UserRole } from '@/types/auth';
import { Region, Currency } from '@/types/prisma';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

// Initialisation de Supabase côté serveur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Vérifier si les variables d'environnement sont définies
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_KEY ne sont pas définies');
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

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
    console.log("Données reçues:", data);

    // Validation des données
    if (!data.email || !data.password || !data.firstName || !data.lastName || 
        !data.country || !data.region || !data.currency || !data.acceptTerms) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Test de connexion à Supabase
    console.log('Test de connexion à Supabase...');
    console.log('URL de l\'API Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Clé d\'API disponible:', process.env.SUPABASE_SERVICE_KEY ? 'Oui' : 'Non');
    
    try {
      // Test simple pour vérifier si Supabase est accessible
      const { data: authSettings, error: settingsError } = await supabase.auth.getSession();
      
      if (settingsError) {
        console.error('Erreur lors du test de connexion à Supabase:', settingsError);
        return NextResponse.json(
          { error: 'Impossible de se connecter à Supabase: ' + settingsError.message },
          { status: 500 }
        );
      }
      
      console.log('Connexion à Supabase réussie');
      
      // Tentative d'inscription très simplifiée
      // Récupérer l'URL du site depuis les variables d'environnement
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mybingo.reussirafrique.com';
      console.log('URL du site pour la redirection:', siteUrl);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          // Ajouter les métadonnées utilisateur
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            country: data.country,
            region: data.region,
            currency: data.currency,
            phoneNumber: data.phoneNumber || '',
            birthdate: data.birthdate || '',
            role: 'USER'
          },
          // URL de redirection après vérification d'email
          emailRedirectTo: `${siteUrl}/auth/callback`
        }
      });
      
      console.log('Réponse de Supabase signUp:', JSON.stringify(authData, null, 2));
      
      if (authError) {
        console.error('Erreur lors de l\'inscription Supabase:', authError);
        return NextResponse.json(
          { error: 'Erreur d\'inscription: ' + authError.message },
          { status: 400 }
        );
      }
      
      // Créer l'utilisateur dans la base de données Prisma
      if (authData.user) {
        try {
          // Vérifier si l'utilisateur existe déjà dans Prisma
          const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
          });
          
          if (!existingUser) {
            // Créer l'utilisateur dans Prisma
            const newUser = await prisma.user.create({
              data: {
                id: authData.user.id,
                email: data.email,
                passwordHash: await hash(data.password, 10),
                username: data.email.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
                role: UserRole.USER,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                country: data.country,
                postalCode: '',
                address: '',
                city: '',
                points: 0,
                totalGamesPlayed: 0,
                isVerified: false,
                isActive: true,
                currency: data.currency,
                pointsRate: data.region === Region.BLACK_AFRICA ? 150 : data.region === Region.NORTH_AFRICA ? 250 : 1,
                region: data.region,
                profile: {
                  create: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                    country: data.country
                  }
                }
              }
            });
            
            console.log('Utilisateur créé dans Prisma:', newUser.id);
          } else {
            console.log('Utilisateur déjà existant dans Prisma:', existingUser.id);
          }
        } catch (prismaError) {
          console.error('Erreur lors de la création de l\'utilisateur dans Prisma:', prismaError);
          // Ne pas bloquer l'inscription si la création dans Prisma échoue
          // Une tâche de synchronisation pourrait être mise en place ultérieurement
        }
      }
      
      // Si nous arrivons ici, l'inscription a réussi
      return NextResponse.json({
        success: true,
        message: 'Compte créé avec succès. Veuillez vérifier votre email pour confirmer votre inscription.',
        redirectUrl: `/auth/email-sent?email=${encodeURIComponent(data.email)}`
      });
      
    } catch (error) {
      console.error('Exception lors de l\'opération Supabase:', error);
      return NextResponse.json(
        { error: 'Une erreur est survenue: ' + (error instanceof Error ? error.message : String(error)) },
        { status: 500 }
      );
    }

    // Note: Nous avons simplifié le code pour ne pas créer d'utilisateur dans Prisma
    // Cela nous permet d'isoler le problème avec Supabase
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

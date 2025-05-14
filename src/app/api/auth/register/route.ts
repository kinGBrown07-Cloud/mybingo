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
      // Utiliser NEXT_PUBLIC_APP_URL comme fallback car il est défini deux fois dans le fichier .env
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.mybingoo.com';
      console.log('URL du site pour la redirection:', siteUrl);
      console.log('Variables d\'environnement disponibles pour les URLs:');
      console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
      console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
      
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
        console.error('Détails de l\'erreur Supabase:', JSON.stringify(authError, null, 2));
        console.error('Code d\'erreur:', authError.status);
        console.error('Message d\'erreur:', authError.message);
        
        // Vérifier si l'erreur est liée à un email déjà utilisé
        if (authError.message?.includes('email') && authError.message?.includes('already')) {
          return NextResponse.json(
            { error: 'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse email.' },
            { status: 400 }
          );
        }
        
        // Vérifier si l'erreur est liée à une URL de redirection non autorisée
        if (authError.message?.includes('redirect') || authError.message?.includes('URL')) {
          console.error('Erreur possible de redirection. Vérifiez les URL autorisées dans le dashboard Supabase.');
        }
        
        return NextResponse.json(
          { error: 'Erreur d\'inscription: ' + authError.message },
          { status: 400 }
        );
      }
      
      // Créer l'utilisateur dans la base de données Prisma
      if (authData.user) {
        try {
          console.log('Tentative de création de l\'utilisateur dans Prisma avec ID:', authData.user.id);
          console.log('Vérification si l\'utilisateur existe déjà dans Prisma...');
          // Vérifier si l'utilisateur existe déjà dans Prisma
          const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
          });
          
          console.log('Résultat de la recherche dans Prisma:', existingUser ? 'Utilisateur trouvé' : 'Utilisateur non trouvé');
          
          if (!existingUser) {
            console.log('Création d\'un nouvel utilisateur dans Prisma...');
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
          console.error('Détails de l\'erreur Prisma:', JSON.stringify(prismaError, null, 2));
          
          // Vérifier si c'est une erreur de connexion à la base de données
          if (prismaError instanceof Error && prismaError.message.includes('connect')) {
            console.error('Problème de connexion à la base de données détecté');
            
            // Essayer de supprimer l'utilisateur dans Supabase Auth pour éviter un état incohérent
            try {
              console.log('Tentative de suppression de l\'utilisateur dans Supabase Auth pour éviter un état incohérent...');
              await supabase.auth.admin.deleteUser(authData.user.id);
              console.log('Utilisateur supprimé dans Supabase Auth');
              
              return NextResponse.json(
                { error: 'Erreur lors de la création de l\'utilisateur dans la base de données. Veuillez réessayer.' },
                { status: 500 }
              );
            } catch (deleteError) {
              console.error('Erreur lors de la suppression de l\'utilisateur dans Supabase Auth:', deleteError);
            }
          }
          
          // Vérifier si c'est une erreur de contrainte unique
          if (prismaError instanceof Error && prismaError.message.includes('Unique constraint')) {
            console.error('Violation de contrainte unique détectée');
            // Dans ce cas, l'utilisateur existe déjà dans Prisma mais pas dans Supabase Auth
            // C'est un état incohérent qui devrait être géré par un processus de synchronisation
          }
          
          // Nous continuons le processus d'inscription même si la création dans Prisma échoue
          // Mais nous enregistrons l'erreur pour une investigation ultérieure
        }
      }
      
      // Vérifier si l'email a bien été envoyé par Supabase
      console.log('Vérification du statut d\'envoi d\'email:', authData.user?.identities?.[0]?.identity_data);
      console.log('Email confirmé:', authData.user?.email_confirmed_at ? 'Oui' : 'Non');
      console.log('Redirection vers:', `/auth/email-sent?email=${encodeURIComponent(data.email)}`);
      
      // Vérifier explicitement si l'email a été envoyé
      if (!authData.user) {
        console.error('Erreur: Aucun utilisateur n\'a été créé dans Supabase Auth');
        return NextResponse.json(
          { error: 'Erreur lors de la création de l\'utilisateur. Veuillez réessayer.' },
          { status: 500 }
        );
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

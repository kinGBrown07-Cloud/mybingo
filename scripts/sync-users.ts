/**
 * Script de synchronisation des utilisateurs Supabase vers Prisma
 * 
 * Ce script récupère tous les utilisateurs de Supabase Auth et crée
 * les entrées correspondantes dans les tables users et profiles de Prisma
 * s'ils n'existent pas déjà.
 * 
 * Exécution: npx ts-node scripts/sync-users.ts
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';

// Définir les énumérations localement au lieu de les importer
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

enum Region {
  EUROPE = 'EUROPE',
  NORTH_AMERICA = 'NORTH_AMERICA',
  SOUTH_AMERICA = 'SOUTH_AMERICA',
  ASIA = 'ASIA',
  AFRICA = 'AFRICA',
  OCEANIA = 'OCEANIA',
  BLACK_AFRICA = 'BLACK_AFRICA',
  NORTH_AFRICA = 'NORTH_AFRICA'
}

enum Currency {
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
  XOF = 'XOF',
  MAD = 'MAD'
}

// Initialisation de Prisma
const prisma = new PrismaClient();

// Initialisation de Supabase avec la clé de service
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_KEY ne sont pas définies');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncUsers() {
  console.log('Démarrage de la synchronisation des utilisateurs...');
  
  try {
    // Récupérer tous les utilisateurs de Supabase
    const { data: supabaseUsers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs Supabase: ${error.message}`);
    }
    
    console.log(`${supabaseUsers.users.length} utilisateurs trouvés dans Supabase Auth`);
    
    // Compteurs pour le suivi
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    // Traiter chaque utilisateur
    for (const supabaseUser of supabaseUsers.users) {
      try {
        // Vérifier si l'utilisateur existe déjà dans Prisma
        const existingUser = await prisma.user.findUnique({
          where: { id: supabaseUser.id }
        });
        
        if (existingUser) {
          console.log(`Utilisateur ${supabaseUser.id} (${supabaseUser.email}) déjà présent dans Prisma, ignoré.`);
          skipped++;
          continue;
        }
        
        // Extraire les métadonnées de l'utilisateur
        const metadata = supabaseUser.user_metadata || {};
        const firstName = metadata.firstName || metadata.first_name || '';
        const lastName = metadata.lastName || metadata.last_name || '';
        const phoneNumber = metadata.phoneNumber || metadata.phone_number || '';
        const country = metadata.country || 'FR';
        const region = metadata.region || Region.EUROPE;
        const currency = metadata.currency || Currency.EUR;
        
        // Générer un nom d'utilisateur si nécessaire
        const username = metadata.username || 
                         `${supabaseUser.email?.split('@')[0]}_${Math.floor(Math.random() * 1000)}`;
        
        // Créer l'utilisateur dans Prisma
        await prisma.user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            passwordHash: await hash('TemporaryPassword123', 10), // Mot de passe temporaire
            username: username,
            role: (metadata.role as UserRole) || UserRole.USER,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            country: country,
            postalCode: '',
            address: '',
            city: '',
            points: 0,
            totalGamesPlayed: 0,
            isVerified: supabaseUser.email_confirmed_at ? true : false,
            isActive: true, // Tous les utilisateurs sont actifs par défaut
            currency: currency,
            pointsRate: region === Region.BLACK_AFRICA ? 150 : region === Region.NORTH_AFRICA ? 250 : 1,
            region: region,
            profile: {
              create: {
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                country: country,
                image_url: metadata.avatar_url || null
              }
            }
          }
        });
        
        console.log(`✅ Utilisateur ${supabaseUser.id} (${supabaseUser.email}) créé avec succès dans Prisma.`);
        created++;
        
      } catch (userError) {
        console.error(`❌ Erreur lors de la création de l'utilisateur ${supabaseUser.id} (${supabaseUser.email}):`, userError);
        errors++;
      }
    }
    
    // Afficher le résumé
    console.log('\n--- Résumé de la synchronisation ---');
    console.log(`Total des utilisateurs traités: ${supabaseUsers.users.length}`);
    console.log(`Utilisateurs créés: ${created}`);
    console.log(`Utilisateurs ignorés (déjà existants): ${skipped}`);
    console.log(`Erreurs: ${errors}`);
    
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la synchronisation
syncUsers()
  .then(() => console.log('Synchronisation terminée.'))
  .catch(console.error);

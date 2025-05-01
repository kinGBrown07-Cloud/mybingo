import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_KEY sont requises');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  try {
    // Paramètres de l'administrateur
    const adminEmail = 'admin@bingoo.com';
    
    // Récupérer l'utilisateur admin depuis Supabase
    const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();
    
    if (searchError) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', searchError);
      return;
    }
    
    const adminUser = users.find(user => user.email === adminEmail);
    
    if (!adminUser) {
      console.error(`Aucun utilisateur avec l'email ${adminEmail} trouvé dans Supabase.`);
      return;
    }
    
    console.log(`Utilisateur admin trouvé dans Supabase: ${adminUser.id}`);
    
    // Vérifier si l'utilisateur existe dans Prisma
    const prismaUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { profile: true }
    });
    
    if (!prismaUser) {
      console.log('L\'utilisateur n\'existe pas dans Prisma, création...');
      
      // Créer l'utilisateur dans Prisma
      const newUser = await prisma.user.create({
        data: {
          id: adminUser.id,
          email: adminEmail,
          username: 'admin',
          passwordHash: 'supabase_auth', // Mot de passe géré par Supabase
          role: 'ADMIN',
          isActive: true,
          isVerified: true,
          // Retirer authProvider qui n'existe pas dans le modèle
          firstName: 'Super',
          lastName: 'Admin',
          country: 'FR',
          points: 1000000,
          currency: 'XOF',
          pointsRate: 1.0,
          region: 'EUROPE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`Utilisateur créé dans Prisma avec l'ID: ${newUser.id}`);
      
      // Créer le profil pour cet utilisateur
      await prisma.profile.create({
        data: {
          userId: newUser.id,
          firstName: 'Super',
          lastName: 'Admin',
          phoneNumber: null,
          country: 'FR',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`Profil créé avec succès pour l'utilisateur admin.`);
    } else {
      console.log('L\'utilisateur existe déjà dans Prisma.');
      
      // Mettre à jour l'ID de l'utilisateur si nécessaire
      if (prismaUser.id !== adminUser.id) {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { id: adminUser.id }
        });
        console.log(`ID de l'utilisateur mis à jour dans Prisma: ${adminUser.id}`);
      }
      
      // Vérifier si le profil existe
      if (!prismaUser.profile) {
        console.log('Le profil n\'existe pas, création...');
        
        // Créer le profil pour cet utilisateur
        await prisma.profile.create({
          data: {
            userId: prismaUser.id,
            firstName: 'Super',
            lastName: 'Admin',
            phoneNumber: null,
            country: 'FR',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log(`Profil créé avec succès pour l'utilisateur admin.`);
      } else {
        console.log('Le profil existe déjà, mise à jour des points...');
        
        // Mettre à jour le profil
        await prisma.profile.update({
          where: { userId: prismaUser.id },
          data: { 
            firstName: 'Super',
            lastName: 'Admin',
            updatedAt: new Date()
          }
        });
        
        console.log('Profil mis à jour avec succès.');
      }
    }
    
    console.log('\nOpération terminée avec succès!');
    
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du profil admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

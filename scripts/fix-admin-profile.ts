import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Paramètres de l'administrateur
    const adminEmail = 'admin@bingoo.com';
    
    // Vérifier si l'utilisateur existe dans Prisma
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { profile: true }
    });
    
    if (!user) {
      console.error(`Aucun utilisateur avec l'email ${adminEmail} trouvé dans la base de données.`);
      return;
    }
    
    console.log(`Utilisateur admin trouvé: ${user.id}`);
    console.log(`Rôle: ${user.role}`);
    console.log(`Points: ${user.points}`);
    
    // Vérifier si le profil existe
    if (user.profile) {
      console.log('Le profil existe déjà:');
      console.log(`ID du profil: ${user.profile.id}`);
      console.log(`Prénom: ${user.profile.firstName}`);
      console.log(`Nom: ${user.profile.lastName}`);
      console.log(`Pays: ${user.profile.country}`);
    } else {
      console.log('Le profil n\'existe pas, création...');
      
      // Créer le profil pour cet utilisateur
      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          firstName: user.firstName || 'Super',
          lastName: user.lastName || 'Admin',
          phoneNumber: user.phoneNumber,
          country: user.country
        }
      });
      
      console.log(`Profil créé avec succès pour l'utilisateur admin.`);
      console.log(`ID du profil: ${profile.id}`);
      console.log(`Prénom: ${profile.firstName}`);
      console.log(`Nom: ${profile.lastName}`);
      console.log(`Pays: ${profile.country}`);
    }
    
    console.log('\nOpération terminée avec succès!');
    
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du profil admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

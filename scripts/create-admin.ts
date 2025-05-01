import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Paramètres de l'administrateur
    const adminEmail = 'admin@bingoo.com';
    const adminPassword = 'Admin@123'; // À changer en production
    const adminUsername = 'admin';
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          { username: adminUsername }
        ],
        role: 'ADMIN'
      }
    });
    
    if (existingAdmin) {
      console.log('Un administrateur existe déjà avec cet email ou ce nom d\'utilisateur.');
      return;
    }
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        id: undefined, // UUID généré automatiquement
        email: adminEmail,
        username: adminUsername,
        passwordHash: hashedPassword,
        role: 'ADMIN',
        firstName: 'Super',
        lastName: 'Admin',
        points: 1000000, // 1 million de points pour commencer
        isVerified: true,
        isActive: true,
        currency: 'EUR',
        pointsRate: 1.0,
        region: 'EUROPE',
        country: 'FR'
      }
    });
    
    console.log('Administrateur créé avec succès:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Nom d'utilisateur: ${adminUsername}`);
    console.log(`Mot de passe: ${adminPassword}`);
    console.log(`Points initiaux: ${admin.points} points`);
    console.log('\nNe partagez pas ces informations et changez le mot de passe en production!');
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

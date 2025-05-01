import { PrismaClient, UserRole, Region } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Paramètres de l'administrateur
    const adminEmail = 'admin@bingoo.com';
    const adminPassword = 'Admin123!';
    const adminId = randomUUID();

    // Vérifier si l'administrateur existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log(`L'administrateur avec l'email ${adminEmail} existe déjà.`);
      return;
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Créer l'utilisateur administrateur
    const admin = await prisma.user.create({
      data: {
        id: adminId,
        email: adminEmail,
        passwordHash: hashedPassword,
        username: 'admin',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+1234567890',
        country: 'TG',
        currency: 'XOF',
        pointsRate: 1.0,
        region: Region.BLACK_AFRICA,
        isVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Admin',
            lastName: 'User',
            phoneNumber: '+1234567890',
            country: 'TG'
          }
        }
      }
    });

    console.log(`Administrateur créé avec succès: ${admin.id}`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Mot de passe: ${adminPassword}`);
    console.log('Utilisez ces informations pour vous connecter.');

  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // ID de l'administrateur dans Supabase
    const supabaseAdminId = '4796478f-cf86-4a6a-b34e-ec8515cde408';
    const adminEmail = 'admin@bingoo.com';

    // Trouver l'administrateur dans Prisma
    const prismaAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!prismaAdmin) {
      console.error(`Aucun utilisateur trouvé avec l'email ${adminEmail} dans Prisma.`);
      return;
    }

    console.log(`Ancien ID Prisma: ${prismaAdmin.id}`);
    console.log(`Nouvel ID Supabase: ${supabaseAdminId}`);

    // Mettre à jour l'ID de l'utilisateur dans Prisma pour correspondre à celui de Supabase
    // Note: Cela peut nécessiter de supprimer et recréer l'utilisateur car l'ID est généralement une clé primaire
    
    // 1. Supprimer le profil associé s'il existe
    if (prismaAdmin.id) {
      await prisma.profile.deleteMany({
        where: { userId: prismaAdmin.id }
      });
      console.log('Profil associé supprimé.');
    }
    
    // 2. Supprimer l'utilisateur existant
    await prisma.user.delete({
      where: { id: prismaAdmin.id }
    });
    console.log('Ancien utilisateur supprimé.');
    
    // 3. Recréer l'utilisateur avec l'ID de Supabase
    const newAdmin = await prisma.user.create({
      data: {
        id: supabaseAdminId,
        email: adminEmail,
        passwordHash: prismaAdmin.passwordHash,
        username: prismaAdmin.username,
        role: prismaAdmin.role,
        firstName: prismaAdmin.firstName,
        lastName: prismaAdmin.lastName,
        phoneNumber: prismaAdmin.phoneNumber,
        country: prismaAdmin.country,
        currency: prismaAdmin.currency,
        pointsRate: prismaAdmin.pointsRate,
        region: prismaAdmin.region,
        isVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: prismaAdmin.firstName || 'Admin',
            lastName: prismaAdmin.lastName || 'User',
            phoneNumber: prismaAdmin.phoneNumber || '+1234567890',
            country: prismaAdmin.country
          }
        }
      }
    });

    console.log(`Utilisateur recréé avec succès avec l'ID Supabase: ${newAdmin.id}`);
    console.log('La synchronisation est terminée.');

  } catch (error) {
    console.error('Erreur lors de la synchronisation des IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

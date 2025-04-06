import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verifyDatabaseSync() {
  try {
    // Vérifier la structure de la table users
    const user = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'`;
    
    console.log('Structure de la table users:', user);

    // Vérifier la structure de la table profiles
    const profile = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'profiles'`;
    
    console.log('Structure de la table profiles:', profile);

    // Vérifier les contraintes
    const constraints = await prisma.$queryRaw`
      SELECT conname, contype, pg_get_constraintdef(oid)
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass OR conrelid = 'profiles'::regclass`;
    
    console.log('Contraintes:', constraints);

  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseSync();

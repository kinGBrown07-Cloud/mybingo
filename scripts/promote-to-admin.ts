import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Récupérer les variables d'environnement pour Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Vérifier si les variables d'environnement sont définies
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_KEY sont requises');
  process.exit(1);
}

// Créer un client Supabase avec la clé de service
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  // Récupérer l'email de l'utilisateur à promouvoir depuis les arguments
  const userEmail = process.argv[2];
  
  if (!userEmail) {
    console.error('Veuillez fournir l\'email de l\'utilisateur à promouvoir.');
    console.log('Usage: npx ts-node scripts/promote-to-admin.ts user@example.com');
    process.exit(1);
  }
  
  try {
    // 1. Mettre à jour le rôle dans la base de données Prisma
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { role: 'ADMIN' },
      include: { profile: true }
    });
    
    if (!updatedUser) {
      console.error(`Aucun utilisateur trouvé avec l'email ${userEmail} dans la base de données.`);
      return;
    }
    
    console.log(`Utilisateur mis à jour dans Prisma:`);
    console.log(`- ID: ${updatedUser.id}`);
    console.log(`- Email: ${updatedUser.email}`);
    console.log(`- Rôle: ${updatedUser.role}`);
    
    // 2. Mettre à jour les métadonnées dans Supabase
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Erreur lors de la récupération des utilisateurs Supabase:', userError);
      return;
    }
    
    const supabaseUser = userData.users.find(user => user.email === userEmail);
    
    if (!supabaseUser) {
      console.error(`Aucun utilisateur trouvé avec l'email ${userEmail} dans Supabase.`);
      return;
    }
    
    // Mettre à jour les métadonnées utilisateur dans Supabase
    const { data, error } = await supabase.auth.admin.updateUserById(
      supabaseUser.id,
      { user_metadata: { role: 'ADMIN', ...supabaseUser.user_metadata } }
    );
    
    if (error) {
      console.error('Erreur lors de la mise à jour des métadonnées Supabase:', error);
      return;
    }
    
    console.log(`\nMétadonnées utilisateur mises à jour dans Supabase:`);
    console.log(`- ID: ${data.user.id}`);
    console.log(`- Email: ${data.user.email}`);
    console.log(`- Rôle: ${data.user.user_metadata?.role}`);
    
    console.log('\nL\'utilisateur a été promu administrateur avec succès!');
    console.log('Il peut maintenant accéder au tableau de bord d\'administration et gérer les bannières publicitaires.');
    
  } catch (error) {
    console.error('Erreur lors de la promotion de l\'utilisateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

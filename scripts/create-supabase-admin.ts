import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_KEY sont requises');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  try {
    // Paramètres de l'administrateur (doivent correspondre à ceux utilisés dans create-prisma-admin.ts)
    const adminEmail = 'admin@bingoo.com';
    const adminPassword = 'Admin123!';
    
    // Vérifier si l'utilisateur existe déjà dans Supabase
    const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();
    
    if (searchError) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', searchError);
      return;
    }
    
    const existingUser = users.find(user => user.email === adminEmail);
    
    if (existingUser) {
      console.log(`L'utilisateur avec l'email ${adminEmail} existe déjà dans Supabase.`);
      return;
    }
    
    // Créer l'utilisateur dans Supabase avec le même ID que dans Prisma
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User',
        role: 'ADMIN'
      },
      app_metadata: {
        role: 'ADMIN'
      }
    });
    
    if (createError) {
      console.error('Erreur lors de la création de l\'utilisateur dans Supabase:', createError);
      return;
    }
    
    if (!userData.user) {
      console.error('Aucun utilisateur retourné par Supabase');
      return;
    }
    
    console.log(`Utilisateur créé avec succès dans Supabase: ${userData.user.id}`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Mot de passe: ${adminPassword}`);
    console.log('Utilisez ces informations pour vous connecter.');
    
    // Mettre à jour le rôle de l'utilisateur
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userData.user.id,
      { user_metadata: { role: 'ADMIN' } }
    );
    
    if (updateError) {
      console.error('Erreur lors de la mise à jour du rôle:', updateError);
      return;
    }
    
    console.log('Rôle ADMIN attribué avec succès.');
    
  } catch (error) {
    console.error('Erreur inattendue:', error);
  }
}

main();
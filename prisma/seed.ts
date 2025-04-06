import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcrypt';
import type { Database } from './types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vugymqwgcltrzelksmhp.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1Z3ltcXdnY2x0cnplbGtzbWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MTM2ODUsImV4cCI6MjA1ODA4OTY4NX0.lbQL0LyjEMqKguMgg2LhDoJW-ibw4SlNE5Ti5eYUxi4';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function main() {
  try {
    // Création des jeux
    const gameData = [
      {
        name: 'Classic Cards',
        type: 'CLASSIC' as const,
        description: 'Trouvez 2 images identiques et gagnez des kits alimentaires',
        image_url: '/images/games/cards/classic-cards.jpg',
        min_points: 1,
        max_points: 5,
        is_active: true,
      },
      {
        name: 'Magic Fortune',
        type: 'MAGIC' as const,
        description: 'Trouvez 2 images identiques et gagnez des vêtements de marque',
        image_url: '/images/games/cards/magic-fortune.jpg',
        min_points: 2,
        max_points: 8,
        is_active: true,
      },
      {
        name: 'Gold Digger',
        type: 'GOLD' as const,
        description: 'Trouvez 2 images identiques et gagnez des lots exceptionnels',
        image_url: '/images/games/cards/gold-digger.jpg',
        min_points: 5,
        max_points: 10,
        is_active: true,
      }
    ];

    // Supprimer les données existantes
    const { error: deleteGamesError } = await supabase
      .from('games')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteGamesError) throw deleteGamesError;

    // Insérer les nouveaux jeux
    const { error: insertGamesError } = await supabase
      .from('games')
      .insert(gameData);

    if (insertGamesError) throw insertGamesError;

    // Création du compte administrateur
    const hashedPassword = await hash('admin123', 10);

    // Supprimer l'admin existant
    const { error: deleteAdminError } = await supabase.auth.admin.deleteUser('admin@bingoo.com');
    
    if (deleteAdminError && deleteAdminError.message !== 'User not found') {
      throw deleteAdminError;
    }

    // Créer le nouvel admin
    const { data: authData, error: createAdminError } = await supabase.auth.admin.createUser({
      email: 'admin@bingoo.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'ADMIN'
      }
    });

    if (createAdminError) throw createAdminError;

    if (authData.user) {
      const { error: updateAdminError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: 'admin@bingoo.com',
          hashed_password: hashedPassword,
          name: 'Admin',
          first_name: 'Admin',
          last_name: 'User',
          role: 'ADMIN',
          region: 'BLACK_AFRICA',
          currency: 'XOF',
          points_rate: 300,
        });

      if (updateAdminError) throw updateAdminError;
    }

    // Initialisation de la caisse administrative
    const { error: treasuryError } = await supabase
      .from('admin_treasury')
      .insert({
        amount: 1000000,
        currency: 'XOF'
      });

    if (treasuryError) throw treasuryError;

    console.log('Base de données initialisée avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation :', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await supabase.auth.signOut();
  });

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = 'https://vugymqwgcltrzelksmhp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1Z3ltcXdnY2x0cnplbGtzbWhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUxMzY4NSwiZXhwIjoyMDU4MDg5Njg1fQ.4BczG-5IgVX8Fgj2n8XByNeh0DcgfGFhgSl6mmuWHP4';

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function testSignup() {
  try {
    const email = 'test.user4@example.com';
    const password = 'Test123!';
    
    console.log('Test de création d\'utilisateur...');
    
    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User4'
      }
    });

    if (authError) {
      console.error('Erreur lors de la création de l\'utilisateur:', authError);
      return;
    }

    if (!authData.user) {
      console.error('Pas de données utilisateur retournées');
      return;
    }

    console.log('Utilisateur créé:', authData.user.id);

    // Générer un code d'affiliation
    const affiliateCode = 'TEST124';

    // Créer le profil utilisateur
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: email.split('@')[0],
        first_name: 'Test',
        last_name: 'User4',
        phone: '+33612345678',
        country: 'FR',
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        points: 0,
        coins: 0,
        affiliate_code: affiliateCode,
        affiliate_earnings: 0
      });

    if (profileError) {
      console.error('Erreur lors de la création du profil:', profileError);
      // En cas d'erreur, supprimer l'utilisateur créé
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
      if (deleteError) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', deleteError);
      }
      return;
    }

    console.log('Profil créé avec succès');
    console.log('Test terminé avec succès');

  } catch (error) {
    console.error('Erreur inattendue:', error);
  }
}

testSignup();

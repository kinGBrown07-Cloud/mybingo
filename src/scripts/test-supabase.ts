import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vugymqwgcltrzelksmhp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1Z3ltcXdnY2x0cnplbGtzbWhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUxMzY4NSwiZXhwIjoyMDU4MDg5Njg1fQ.4BczG-5IgVX8Fgj2n8XByNeh0DcgfGFhgSl6mmuWHP4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabase() {
  console.log('Test de connexion à Supabase...');

  try {
    // Test de la connexion
    const { data: version, error: versionError } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact' });

    if (versionError) {
      console.error('Erreur lors du test de connexion:', versionError);
      return;
    }

    console.log('Connexion réussie! Nombre de profils:', version);

    // Test de création d'un utilisateur
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true
    };

    console.log('Test de création d\'un utilisateur...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser(testUser);

    if (authError) {
      console.error('Erreur lors de la création de l\'utilisateur:', authError);
      return;
    }

    console.log('Utilisateur créé avec succès:', authData);

    // Si l'utilisateur est créé, on le supprime
    if (authData.user) {
      console.log('Suppression de l\'utilisateur test...');
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
      
      if (deleteError) {
        console.error('Erreur lors de la suppression:', deleteError);
      } else {
        console.log('Utilisateur supprimé avec succès');
      }
    }

  } catch (error) {
    console.error('Erreur inattendue:', error);
  }
}

testSupabase();

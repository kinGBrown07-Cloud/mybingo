import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = 'https://vugymqwgcltrzelksmhp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1Z3ltcXdnY2x0cnplbGtzbWhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUxMzY4NSwiZXhwIjoyMDU4MDg5Njg1fQ.4BczG-5IgVX8Fgj2n8XByNeh0DcgfGFhgSl6mmuWHP4';

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function checkAuth() {
  try {
    // Vérifier la connexion
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Erreur d\'authentification:', authError);
      return;
    }

    console.log('Connexion réussie avec le rôle service_role');

    // Vérifier les utilisateurs existants
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('*');

    if (usersError) {
      console.error('Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    console.log('Utilisateurs existants:', users);

  } catch (error) {
    console.error('Erreur inattendue:', error);
  }
}

checkAuth();

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

// Créer une seule instance du client Supabase pour le côté client
// Cette fonction utilise un singleton pour s'assurer qu'une seule instance est créée
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>();
  }
  return supabaseClient;
};

// Exporter une instance par défaut pour la rétrocompatibilité
export const supabase = getSupabaseClient();

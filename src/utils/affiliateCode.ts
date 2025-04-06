import { SupabaseClient } from '@supabase/supabase-js';
import { customAlphabet } from 'nanoid';
import { Database } from '@/types/supabase';

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

/**
 * Génère un code d'affiliation unique qui n'existe pas déjà dans la base de données
 * @param supabase Client Supabase
 * @returns Code d'affiliation unique
 */
export async function generateUniqueAffiliateCode(
  supabase: SupabaseClient<Database>
): Promise<string> {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = nanoid();
    
    // Vérifier si le code existe déjà
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('affiliate_code', code)
      .single();

    if (error && error.code === 'PGRST116') {
      // Code PGRST116 signifie qu'aucun résultat n'a été trouvé
      isUnique = true;
    }
  }

  return code;
}

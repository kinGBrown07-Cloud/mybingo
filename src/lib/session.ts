import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { User } from '@prisma/client';

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  role: string;
};

export type Session = {
  user: SessionUser | null;
};

/**
 * Récupère la session utilisateur actuelle
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }
    
    // Récupérer les données utilisateur depuis Supabase
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return null;
    }
    
    // Transformer en SessionUser
    const user: SessionUser = {
      id: userData.user.id,
      email: userData.user.email || '',
      username: userData.user.user_metadata?.username || '',
      role: userData.user.user_metadata?.role || 'USER',
    };
    
    return { user };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

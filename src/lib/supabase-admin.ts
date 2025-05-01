import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Create a Supabase client with the service role key for admin operations
// This client should ONLY be used on the server side
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

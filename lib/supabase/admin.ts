import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// WARNING: NEVER import this in client components
// This client uses the service role key which bypasses Row Level Security
// Only use in server-side code (API routes, server actions) for admin operations

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

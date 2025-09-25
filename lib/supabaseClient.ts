import { createClient } from '@supabase/supabase-js';

// It is important to use environment variables for security and deployment flexibility.
// These variables should be set in your deployment environment (e.g., Vercel).
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required environment variables.");
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

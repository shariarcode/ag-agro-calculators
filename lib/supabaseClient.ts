
import { createClient } from '@supabase/supabase-js';

// The process.env variables are NOT available in a static client-side application.
// We must use the actual values here. The Supabase anon key is public and safe to expose.
const supabaseUrl = 'https://awaasiljhzsrqkldbfiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3YWFzaWxqaHpzcnFrbGRiZml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NzIyODYsImV4cCI6MjA3NDM0ODI4Nn0.UBVnxBQmmsLyaarmN4qmn66jdPUqHSYdOrJO3AzgQFY';


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required. Please update them in `lib/supabaseClient.ts`.");
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
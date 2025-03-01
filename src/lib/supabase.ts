import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Authentication features will not work properly.' +
    '\nMake sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY defined in your .env file.' +
    '\nYou may need to restart your development server after adding these variables.'
  );
}

// Create the Supabase client - in development we'll use a fallback for demo purposes if env vars are missing
const url = supabaseUrl || 'https://bzryrvfjfzchzbmxzdyi.supabase.co';
const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnlydmZqZnpjaHpibXh6ZHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTA2NDEsImV4cCI6MjA1NjI4NjY0MX0.Kqph8KJDbvwQdTHlpu0uhbaTYleopuftGgDI5lZfoI8';

export const supabase = createClient(url, key);

export default supabase;

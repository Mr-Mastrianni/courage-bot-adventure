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

// Configure client with proper storage options for session persistence
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    storageKey: 'courage-bot-adventure.auth.token',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
});

// Add a listener for auth errors
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('Auth token refreshed successfully');
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    // Clear any cached data
    localStorage.removeItem('courage-bot-adventure.user.profile');
  }
});

export default supabase;

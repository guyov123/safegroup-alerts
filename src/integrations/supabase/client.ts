
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fbhqrdkczdxvqgcyahbq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaHFyZGtjemR4dnFnY3lhaGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMDQ0MDQsImV4cCI6MjA1ODU4MDQwNH0.l5flils-RExteANHP8FVvDAORfFxP8_GJIhBgumRoYU";

// Get the current host URL for redirects
const getRedirectTo = () => {
  // For development or when using preview URLs
  return window.location.origin;
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: localStorage,
      flowType: 'pkce',
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Set the redirect URL for authentication operations
export const redirectUrl = getRedirectTo();

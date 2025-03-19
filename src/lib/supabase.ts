'use client';

import { createClient } from '@supabase/supabase-js';

let supabase: any;

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  console.log('Initializing Supabase client with URL:', supabaseUrl);
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  throw error;
}

export { supabase }; 
import { createClient } from '@supabase/supabase-js';

// Add logging to see what credentials are being used
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Initializing Supabase client with URL:', supabaseUrl);
// Don't log the full key for security reasons
console.log('Supabase key available:', supabaseKey ? 'Yes' : 'No');

export const supabase = createClient(supabaseUrl, supabaseKey); 
// This script fixes the lib/supabase.ts file
// Run with: node scripts/fix-supabase-lib.js
const fs = require('fs');
const path = require('path');

console.log('=== FIXING SUPABASE LIB FILE ===');

const supabaseLibPath = path.join(process.cwd(), 'src', 'lib', 'supabase.ts');
const supabaseLibDir = path.dirname(supabaseLibPath);

// Create the directory if it doesn't exist
if (!fs.existsSync(supabaseLibDir)) {
  console.log(`Creating directory: ${supabaseLibDir}`);
  fs.mkdirSync(supabaseLibDir, { recursive: true });
}

// Create a backup if the file exists
if (fs.existsSync(supabaseLibPath)) {
  const backupPath = `${supabaseLibPath}.backup`;
  fs.copyFileSync(supabaseLibPath, backupPath);
  console.log(`Created backup at: ${backupPath}`);
}

// Create the new content
const newContent = `
import { createClient } from '@supabase/supabase-js';

// This file has been automatically fixed to use hardcoded credentials
// to ensure it works regardless of environment variables

// Hardcoded credentials for testing
const supabaseUrl = 'https://lvqhxqkvorqfungphdzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cWh4cWt2b3JxZnVuZ3BoZHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTQxMzUsImV4cCI6MjA1NzMzMDEzNX0.uU3gItOnBIKXW0mP5tNGXIfb_W1-p8qAZJ-Nzy-1jVM';

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Export a function to create a fresh client
export function createFreshClient() {
  console.log('Creating fresh Supabase client with hardcoded credentials');
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
}
`;

// Write the new content
fs.writeFileSync(supabaseLibPath, newContent);
console.log(`Successfully updated ${supabaseLibPath} with hardcoded credentials`);
console.log('=== FIX COMPLETE ==='); 
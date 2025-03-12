// This script checks environment variables
// Run with: node scripts/check-env-vars.js
const fs = require('fs');
const path = require('path');

console.log('=== ENVIRONMENT VARIABLES CHECK ===');

// Check process environment variables
console.log('\nProcess environment variables:');
const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'DATABASE_URL',
  'DIRECT_URL'
];

for (const varName of envVars) {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? 'Set' : 'Not set'}`);
}

// Check .env files
console.log('\nChecking .env files:');
const envFiles = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
  '.env.production',
  '.env.production.local'
];

for (const file of envFiles) {
  const filePath = path.join(process.cwd(), file);
  
  if (fs.existsSync(filePath)) {
    console.log(`${file}: EXISTS`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      console.log(`  Contains ${lines.length} non-comment lines`);
      
      // Check for Supabase variables
      const hasSupabaseUrl = lines.some(line => line.startsWith('NEXT_PUBLIC_SUPABASE_URL='));
      const hasSupabaseKey = lines.some(line => line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY='));
      
      console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? 'Found' : 'Not found'}`);
      console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasSupabaseKey ? 'Found' : 'Not found'}`);
      
      // Print first few characters of values (for security)
      if (hasSupabaseUrl) {
        const urlLine = lines.find(line => line.startsWith('NEXT_PUBLIC_SUPABASE_URL='));
        const url = urlLine.split('=')[1];
        console.log(`  URL preview: ${url.substring(0, 20)}...`);
      }
      
      if (hasSupabaseKey) {
        const keyLine = lines.find(line => line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY='));
        const key = keyLine.split('=')[1];
        console.log(`  Key preview: ${key.substring(0, 10)}...`);
      }
    } catch (error) {
      console.error(`  Error reading ${file}:`, error.message);
    }
  } else {
    console.log(`${file}: DOES NOT EXIST`);
  }
}

// Load dotenv manually to check if it works
try {
  console.log('\nTrying to load .env.local with dotenv:');
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log(`NEXT_PUBLIC_SUPABASE_URL after dotenv: ${supabaseUrl ? 'Set' : 'Not set'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY after dotenv: ${supabaseKey ? 'Set' : 'Not set'}`);
} catch (error) {
  console.error('Error loading dotenv:', error.message);
}

console.log('\n=== CHECK COMPLETE ==='); 
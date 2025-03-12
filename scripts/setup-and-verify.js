// This script installs required dependencies and verifies Supabase connection
// Run with: node scripts/setup-and-verify.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== SETUP AND VERIFICATION ===');

// 1. Install required dependencies
console.log('\n📦 Installing required dependencies...');
try {
  execSync('npm install dotenv @supabase/supabase-js --save', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// 2. Check for .env.local file
console.log('\n📄 Checking for .env.local file...');
const envLocalPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envLocalPath)) {
  console.log('❌ .env.local file not found. Creating one...');
  
  // Create a template .env.local file
  const envTemplate = `# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://lvqhxqkvorqfungphdzb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cWh4cWt2b3JxZnVuZ3BoZHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTQxMzUsImV4cCI6MjA1NzMzMDEzNX0.uU3gItOnBIKXW0mP5tNGXIfb_W1-p8qAZJ-Nzy-1jVM
`;
  
  fs.writeFileSync(envLocalPath, envTemplate);
  console.log('✅ Created .env.local file with template values');
} else {
  console.log('✅ .env.local file exists');
  
  // Check if it contains Supabase credentials
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
  
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.log('⚠️ .env.local file is missing Supabase credentials. Adding them...');
    
    const updatedContent = envContent + `
# Supabase credentials (added automatically)
${!hasSupabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL=https://lvqhxqkvorqfungphdzb.supabase.co' : ''}
${!hasSupabaseKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cWh4cWt2b3JxZnVuZ3BoZHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTQxMzUsImV4cCI6MjA1NzMzMDEzNX0.uU3gItOnBIKXW0mP5tNGXIfb_W1-p8qAZJ-Nzy-1jVM' : ''}
`;
    
    fs.writeFileSync(envLocalPath, updatedContent);
    console.log('✅ Added missing Supabase credentials to .env.local file');
  } else {
    console.log('✅ .env.local contains Supabase credentials');
  }
}

// 3. Create a simple direct test file
console.log('\n📝 Creating a simple direct test file...');
const directTestPath = path.join(process.cwd(), 'scripts', 'direct-supabase-test.js');

const directTestContent = `
// This is a simple direct test for Supabase
// It doesn't use dotenv to avoid any issues
const { createClient } = require('@supabase/supabase-js');

async function main() {
  console.log('=== DIRECT SUPABASE TEST ===');
  
  // Hardcoded credentials for testing
  const supabaseUrl = 'https://lvqhxqkvorqfungphdzb.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cWh4cWt2b3JxZnVuZ3BoZHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTQxMzUsImV4cCI6MjA1NzMzMDEzNX0.uU3gItOnBIKXW0mP5tNGXIfb_W1-p8qAZJ-Nzy-1jVM';
  
  console.log(\`Connecting to Supabase at: \${supabaseUrl}\`);
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection
    console.log('Testing connection...');
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      console.error('CONNECTION ERROR:', error);
      return;
    }
    
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log('Version info:', data);
    
    // Get companies
    console.log('\\nFetching companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error('ERROR fetching companies:', companiesError);
    } else {
      console.log(\`Found \${companies.length} companies:\`);
      companies.forEach(company => {
        console.log(\`- ID: \${company.id}, Name: \${company.name}\`);
      });
    }
  } catch (error) {
    console.error('UNEXPECTED ERROR:', error);
  }
}

main().catch(console.error);
`;

fs.writeFileSync(directTestPath, directTestContent);
console.log('✅ Created direct test file at scripts/direct-supabase-test.js');

// 4. Run the direct test
console.log('\n🧪 Running direct Supabase test...');
try {
  execSync('node scripts/direct-supabase-test.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Direct test failed:', error.message);
}

// 5. Fix the database.ts file
console.log('\n🔧 Fixing database.ts file...');
try {
  execSync('node scripts/fix-database-file.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to fix database.ts file:', error.message);
}

console.log('\n=== SETUP AND VERIFICATION COMPLETE ===');
console.log('\nNext steps:');
console.log('1. Run "npm run dev" to start your Next.js app');
console.log('2. Visit http://localhost:3000/page-direct to see the direct Supabase data');
console.log('3. Visit http://localhost:3000/api/purge-all-data to reset your database'); 
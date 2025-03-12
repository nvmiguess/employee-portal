const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 CHECKING ENVIRONMENT VARIABLES');
console.log('================================');

// Check process environment variables
console.log('\n📊 PROCESS ENVIRONMENT VARIABLES:');
console.log('-------------------------------');

const envVars = {
  NODE_ENV: process.env.NODE_ENV || 'not set',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
    `set (length: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length})` : 'not set',
  SUPABASE_URL: process.env.SUPABASE_URL || 'not set',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 
    `set (length: ${process.env.SUPABASE_ANON_KEY.length})` : 'not set',
};

for (const [key, value] of Object.entries(envVars)) {
  console.log(`${key}: ${value}`);
}

// Check .env files
console.log('\n📁 ENV FILES:');
console.log('-----------');

const rootDir = process.cwd();
const envFiles = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
  '.env.production',
  '.env.production.local',
];

for (const file of envFiles) {
  const filePath = path.join(rootDir, file);
  
  try {
    if (fs.existsSync(filePath)) {
      console.log(`${file}: EXISTS`);
      
      // Read file content
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract variable names (not values for security)
      const variables = content
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
          const parts = line.split('=');
          return parts[0].trim();
        });
      
      console.log(`  Variables: ${variables.join(', ')}`);
    } else {
      console.log(`${file}: DOES NOT EXIST`);
    }
  } catch (error) {
    console.log(`${file}: ERROR - ${error.message}`);
  }
}

// Test Supabase connection
console.log('\n🔌 TESTING SUPABASE CONNECTION:');
console.log('-----------------------------');

async function testSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials are missing');
    return;
  }
  
  try {
    console.log(`Connecting to Supabase at: ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      console.log(`❌ Connection failed: ${versionError.message}`);
      return;
    }
    
    console.log(`✅ Connection successful. Version: ${JSON.stringify(versionData)}`);
    
    // Get company count
    const { count: companyCount, error: companyError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    if (companyError) {
      console.log(`❌ Failed to get company count: ${companyError.message}`);
    } else {
      console.log(`✅ Company count: ${companyCount}`);
    }
    
    // Get employee count
    const { count: employeeCount, error: employeeError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (employeeError) {
      console.log(`❌ Failed to get employee count: ${employeeError.message}`);
    } else {
      console.log(`✅ Employee count: ${employeeCount}`);
    }
  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
  }
}

testSupabaseConnection().catch(console.error); 
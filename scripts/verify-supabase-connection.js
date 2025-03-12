// This is a standalone script to verify Supabase connection
// Run with: node scripts/verify-supabase-connection.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  console.log('=== SUPABASE CONNECTION VERIFICATION ===');
  console.log('This script will connect directly to Supabase and verify the connection');
  console.log('----------------------------------------');
  
  // Get credentials from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Environment variables:');
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'NOT SET'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? 'Set' : 'NOT SET'}`);
  console.log('----------------------------------------');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: Supabase credentials are missing from environment variables');
    console.log('Please check your .env.local file and make sure these variables are set correctly');
    process.exit(1);
  }
  
  try {
    console.log(`Connecting to Supabase at: ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection
    console.log('Testing connection...');
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      console.error('CONNECTION ERROR:', versionError);
      process.exit(1);
    }
    
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log('Version info:', versionData);
    console.log('----------------------------------------');
    
    // Get companies
    console.log('Fetching companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error('ERROR fetching companies:', companiesError);
    } else {
      console.log(`Found ${companies.length} companies:`);
      companies.forEach(company => {
        console.log(`- ID: ${company.id}, Name: ${company.name}, Description: ${company.description}`);
      });
    }
    console.log('----------------------------------------');
    
    // Get employees
    console.log('Fetching employees...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*, company:companies(id, name)');
    
    if (employeesError) {
      console.error('ERROR fetching employees:', employeesError);
    } else {
      console.log(`Found ${employees.length} employees:`);
      employees.forEach(employee => {
        const companyName = employee.company ? employee.company.name : 'No company';
        console.log(`- ID: ${employee.id}, Name: ${employee.name}, Email: ${employee.email}, Company: ${companyName}`);
      });
    }
    
    console.log('----------------------------------------');
    console.log('VERIFICATION COMPLETE');
    
  } catch (error) {
    console.error('UNEXPECTED ERROR:', error);
    process.exit(1);
  }
}

main().catch(console.error); 
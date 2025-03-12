
// This is a simple direct test for Supabase
// It doesn't use dotenv to avoid any issues
const { createClient } = require('@supabase/supabase-js');

async function main() {
  console.log('=== DIRECT SUPABASE TEST ===');
  
  // Hardcoded credentials for testing
  const supabaseUrl = 'https://lvqhxqkvorqfungphdzb.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cWh4cWt2b3JxZnVuZ3BoZHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTQxMzUsImV4cCI6MjA1NzMzMDEzNX0.uU3gItOnBIKXW0mP5tNGXIfb_W1-p8qAZJ-Nzy-1jVM';
  
  console.log(`Connecting to Supabase at: ${supabaseUrl}`);
  
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
    console.log('\nFetching companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error('ERROR fetching companies:', companiesError);
    } else {
      console.log(`Found ${companies.length} companies:`);
      companies.forEach(company => {
        console.log(`- ID: ${company.id}, Name: ${company.name}`);
      });
    }
  } catch (error) {
    console.error('UNEXPECTED ERROR:', error);
  }
}

main().catch(console.error);

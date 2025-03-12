// This script tests Supabase connection directly
const { createClient } = require('@supabase/supabase-js');

// Use environment variables or hardcode for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lvqhxqkvorqfungphdzb.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cWh4cWt2b3JxZnVuZ3BoZHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTQxMzUsImV4cCI6MjA1NzMzMDEzNX0.uU3gItOnBIKXW0mP5tNGXIfb_W1-p8qAZJ-Nzy-1jVM';

async function main() {
  try {
    console.log('Creating Supabase client with URL:', supabaseUrl);
    console.log('Supabase key available:', supabaseKey ? 'Yes' : 'No');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection
    console.log('Testing connection...');
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      console.error('Connection error:', versionError);
      return;
    }
    
    console.log('Connection successful. Version:', versionData);
    
    // Get companies
    console.log('\nFetching companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
    } else {
      console.log(`Found ${companies.length} companies:`);
      companies.forEach(company => {
        console.log(`- ${company.id}: ${company.name}`);
      });
    }
    
    // Get employees
    console.log('\nFetching employees...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*, company:companies(id, name)')
      .order('name');
    
    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
    } else {
      console.log(`Found ${employees.length} employees:`);
      employees.forEach(employee => {
        const companyName = employee.company ? employee.company.name : 'No company';
        console.log(`- ${employee.id}: ${employee.name} (${companyName})`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 
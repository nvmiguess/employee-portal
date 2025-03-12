const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    // Test connection
    console.log('Testing database connection...');
    
    // Try to count companies
    const { count: companyCount, error: companyError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    if (companyError) throw companyError;
    console.log(`Company count: ${companyCount}`);
    
    // Try to count employees
    const { count: employeeCount, error: employeeError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (employeeError) throw employeeError;
    console.log(`Employee count: ${employeeCount}`);
    
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

main(); 
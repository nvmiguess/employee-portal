const { createClient } = require('@supabase/supabase-js');

// Use your actual credentials
const supabaseUrl = 'https://lvqhxqkvorqfungphdzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cWh4cWt2b3JxZnVuZ3BoZHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTQxMzUsImV4cCI6MjA1NzMzMDEzNX0.uU3gItOnBIKXW0mP5tNGXIfb_W1-p8qAZJ-Nzy-1jVM';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try a simple query
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }
    
    console.log('Connection successful!');
    console.log('Tables found:', data);
    
    // Try to insert a test record
    console.log('Trying to insert a test record...');
    const { data: insertData, error: insertError } = await supabase
      .from('companies')
      .insert([
        { name: 'Test Company', description: 'A test company from script' }
      ])
      .select();
    
    if (insertError) {
      console.error('Error inserting test record:', insertError);
      return;
    }
    
    console.log('Insert successful!', insertData);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 
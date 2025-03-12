import { createClient } from '@supabase/supabase-js';

// This file provides direct access to Supabase with no caching or middleware
// It will be used to override the existing database.ts file

// Create a fresh Supabase client for each request
const createDirectSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('DIRECT DATABASE: Missing Supabase credentials');
    throw new Error('Supabase credentials are missing');
  }
  
  console.log('DIRECT DATABASE: Creating fresh Supabase client');
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
};

// Companies
export async function getCompanies() {
  try {
    console.log('DIRECT DATABASE: Fetching companies directly from Supabase');
    const supabase = createDirectSupabaseClient();
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('DIRECT DATABASE: Error fetching companies:', error);
      throw error;
    }
    
    console.log(`DIRECT DATABASE: Retrieved ${data?.length || 0} companies`);
    return data || [];
  } catch (error) {
    console.error('DIRECT DATABASE: Failed to get companies:', error);
    return [];
  }
}

// Employees
export async function getEmployees() {
  try {
    console.log('DIRECT DATABASE: Fetching employees directly from Supabase');
    const supabase = createDirectSupabaseClient();
    
    const { data, error } = await supabase
      .from('employees')
      .select('*, company:companies(id, name)')
      .order('name');
    
    if (error) {
      console.error('DIRECT DATABASE: Error fetching employees:', error);
      throw error;
    }
    
    console.log(`DIRECT DATABASE: Retrieved ${data?.length || 0} employees`);
    return data || [];
  } catch (error) {
    console.error('DIRECT DATABASE: Failed to get employees:', error);
    return [];
  }
}

// Get a single company by ID
export async function getCompanyById(id: number) {
  try {
    console.log(`DIRECT DATABASE: Fetching company ${id} directly from Supabase`);
    const supabase = createDirectSupabaseClient();
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`DIRECT DATABASE: Error fetching company ${id}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`DIRECT DATABASE: Failed to get company ${id}:`, error);
    return null;
  }
}

// Get employees for a company
export async function getEmployeesByCompanyId(companyId: number) {
  try {
    console.log(`DIRECT DATABASE: Fetching employees for company ${companyId} directly from Supabase`);
    const supabase = createDirectSupabaseClient();
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    
    if (error) {
      console.error(`DIRECT DATABASE: Error fetching employees for company ${companyId}:`, error);
      throw error;
    }
    
    console.log(`DIRECT DATABASE: Retrieved ${data?.length || 0} employees for company ${companyId}`);
    return data || [];
  } catch (error) {
    console.error(`DIRECT DATABASE: Failed to get employees for company ${companyId}:`, error);
    return [];
  }
}

// Check database connection
export async function checkDatabaseConnection() {
  try {
    console.log('DIRECT DATABASE: Checking connection directly with Supabase');
    const supabase = createDirectSupabaseClient();
    
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      console.error('DIRECT DATABASE: Connection error:', error);
      throw error;
    }
    
    console.log('DIRECT DATABASE: Connection successful');
    return {
      connected: true,
      version: data,
      error: null
    };
  } catch (error) {
    console.error('DIRECT DATABASE: Connection failed:', error);
    return {
      connected: false,
      version: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 
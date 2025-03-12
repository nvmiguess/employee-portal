import { createClient } from '@supabase/supabase-js';

// IMPORTANT: This file has been automatically modified to use Supabase directly
// Original file is backed up at src/lib/database.ts.backup

// Create a fresh Supabase client for each request
const createFreshSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL ERROR: Supabase credentials are missing');
    throw new Error('Supabase credentials are missing');
  }
  
  console.log('Creating fresh Supabase client with URL:', supabaseUrl);
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
};

// Companies
export async function getCompanies() {
  try {
    console.log('Fetching companies directly from Supabase...');
    const supabase = createFreshSupabaseClient();
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} companies from Supabase`);
    return data || [];
  } catch (error) {
    console.error('Failed to get companies:', error);
    return [];
  }
}

// Employees
export async function getEmployees() {
  try {
    console.log('Fetching employees directly from Supabase...');
    const supabase = createFreshSupabaseClient();
    
    const { data, error } = await supabase
      .from('employees')
      .select('*, company:companies(id, name)')
      .order('name');
    
    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} employees from Supabase`);
    return data || [];
  } catch (error) {
    console.error('Failed to get employees:', error);
    return [];
  }
}

// Get a single company by ID
export async function getCompanyById(id: number) {
  try {
    console.log(`Fetching company ${id} directly from Supabase`);
    const supabase = createFreshSupabaseClient();
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to get company ${id}:`, error);
    return null;
  }
}

// Get employees for a company
export async function getEmployeesByCompanyId(companyId: number) {
  try {
    console.log(`Fetching employees for company ${companyId} directly from Supabase`);
    const supabase = createFreshSupabaseClient();
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    
    if (error) {
      console.error(`Error fetching employees for company ${companyId}:`, error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Failed to get employees for company ${companyId}:`, error);
    return [];
  }
}

// Create a new company
export async function createCompany(companyData: any) {
  try {
    console.log('Creating new company directly in Supabase');
    const supabase = createFreshSupabaseClient();
    
    const { data, error } = await supabase
      .from('companies')
      .insert(companyData)
      .select();
    
    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Failed to create company:', error);
    throw error;
  }
}

// Update a company
export async function updateCompany(id: number, companyData: any) {
  try {
    console.log(`Updating company ${id} directly in Supabase`);
    const supabase = createFreshSupabaseClient();
    
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error(`Failed to update company ${id}:`, error);
    throw error;
  }
}

// Delete a company
export async function deleteCompany(id: number) {
  try {
    console.log(`Deleting company ${id} directly from Supabase`);
    const supabase = createFreshSupabaseClient();
    
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Failed to delete company ${id}:`, error);
    throw error;
  }
}

// Create a new employee
export async function createEmployee(employeeData: any) {
  try {
    console.log('Creating new employee directly in Supabase');
    const supabase = createFreshSupabaseClient();
    
    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select();
    
    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Failed to create employee:', error);
    throw error;
  }
}

// Update an employee
export async function updateEmployee(id: number, employeeData: any) {
  try {
    console.log(`Updating employee ${id} directly in Supabase`);
    const supabase = createFreshSupabaseClient();
    
    const { data, error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error(`Failed to update employee ${id}:`, error);
    throw error;
  }
}

// Delete an employee
export async function deleteEmployee(id: number) {
  try {
    console.log(`Deleting employee ${id} directly from Supabase`);
    const supabase = createFreshSupabaseClient();
    
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Failed to delete employee ${id}:`, error);
    throw error;
  }
}

// Check database connection
export async function checkDatabaseConnection() {
  try {
    console.log('Checking connection directly with Supabase');
    const supabase = createFreshSupabaseClient();
    
    const { data, error } = await supabase.rpc('version');
    
    if (error) throw error;
    
    return {
      connected: true,
      version: data,
      error: null
    };
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      connected: false,
      version: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Ensure this function is defined and exported
export async function getEmployee(id: number) {
  try {
    const supabase = createFreshSupabaseClient();
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Failed to get employee ${id}:`, error);
    return null;
  }
}

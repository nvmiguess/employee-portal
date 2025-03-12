import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create a fresh Supabase client directly in this file
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    console.log('Creating direct Supabase client with URL:', supabaseUrl);
    console.log('Supabase key available:', supabaseKey ? 'Yes' : 'No');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are missing');
    }
    
    const directSupabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection
    const { data: versionData, error: versionError } = await directSupabase.rpc('version');
    
    if (versionError) {
      throw new Error(`Failed to connect to Supabase: ${versionError.message}`);
    }
    
    // Get companies
    const { data: companies, error: companiesError } = await directSupabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (companiesError) {
      throw new Error(`Failed to fetch companies: ${companiesError.message}`);
    }
    
    // Get employees
    const { data: employees, error: employeesError } = await directSupabase
      .from('employees')
      .select('*, company:companies(id, name)')
      .order('name');
    
    if (employeesError) {
      throw new Error(`Failed to fetch employees: ${employeesError.message}`);
    }
    
    return NextResponse.json({
      success: true,
      message: "Direct Supabase test successful",
      data: {
        version: versionData,
        companies,
        employees
      }
    });
  } catch (error) {
    console.error('Direct Supabase test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during direct Supabase test'
    }, { status: 500 });
  }
} 
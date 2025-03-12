import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // Get all employees directly from Supabase
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*, company:companies(id, name)')
      .order('name');
    
    if (employeesError) {
      throw new Error(`Failed to fetch employees: ${employeesError.message}`);
    }
    
    // Get all companies directly from Supabase
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (companiesError) {
      throw new Error(`Failed to fetch companies: ${companiesError.message}`);
    }
    
    // Get database connection info
    const { data: connectionInfo, error: connectionError } = await supabase
      .rpc('version');
    
    return NextResponse.json({
      success: true,
      message: "Retrieved data directly from Supabase",
      data: {
        employees,
        companies,
        connectionInfo: connectionError ? 'Error getting connection info' : connectionInfo
      }
    });
  } catch (error) {
    console.error('Debug data error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error retrieving debug data'
    }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // Get employee count
    const { count: employeeCount, error: employeeError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (employeeError) throw employeeError;
    
    // Get company count
    const { count: companyCount, error: companyError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    if (companyError) throw companyError;
    
    return NextResponse.json({
      success: true,
      database: "Connected successfully",
      counts: {
        employees: employeeCount,
        companies: companyCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }, { status: 500 });
  }
} 
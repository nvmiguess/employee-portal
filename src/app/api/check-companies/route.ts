import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // Get companies with employee counts
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        *,
        employees:employees(count)
      `)
      .order('name');
    
    if (error) throw error;
    
    // Format the response to match the expected structure
    const formattedCompanies = companies.map(company => ({
      ...company,
      _count: {
        employees: company.employees.length
      }
    }));
    
    return NextResponse.json({ success: true, companies: formattedCompanies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 
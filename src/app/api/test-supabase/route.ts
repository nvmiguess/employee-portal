import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // Test connection by querying the version
    const { data, error } = await supabase.from('employees').select('count(*)', { count: 'exact', head: true });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: "Connected to Supabase successfully",
      data
    });
  } catch (error) {
    console.error('Supabase test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Supabase error'
    }, { status: 500 });
  }
} 
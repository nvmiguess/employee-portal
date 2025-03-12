import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // Try to insert a single company
    const { data, error } = await supabase
      .from('companies')
      .insert([
        { name: 'Test Company', description: 'A test company' }
      ])
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: "Test insert successful",
      data
    });
  } catch (error) {
    console.error('Test insert error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during test insert',
      details: error
    }, { status: 500 });
  }
} 
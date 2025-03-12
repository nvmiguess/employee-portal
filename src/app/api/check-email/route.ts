import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    // Check if email exists in the database
    const { data, error } = await supabase
      .from('employees')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (error) throw error;
    
    return NextResponse.json({
      exists: !!data,
      available: !data
    });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    );
  }
} 
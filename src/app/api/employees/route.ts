import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*, company:companies(id, name)')
      .order('name');
    
    if (error) throw error;
    
    return NextResponse.json({ employees: data });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.position || !data.department || !data.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('employees')
      .select('id')
      .eq('email', data.email)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'Email already in use', 
          details: 'An employee with this email address already exists. Please use a different email.'
        },
        { status: 400 }
      );
    }
    
    // Create employee
    const { data: employee, error } = await supabase
      .from('employees')
      .insert([{
        name: data.name,
        email: data.email,
        position: data.position,
        department: data.department,
        status: data.status,
        hire_date: data.hireDate || new Date().toISOString(),
        company_id: data.companyId || null
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create employee', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('RESET EVERYTHING: Starting complete reset process...');
    
    // 1. Clear Next.js cache
    console.log('RESET EVERYTHING: Clearing Next.js cache...');
    const rootDir = process.cwd();
    const nextCacheDir = path.join(rootDir, '.next/cache');
    
    if (fs.existsSync(nextCacheDir)) {
      try {
        fs.rmSync(nextCacheDir, { recursive: true, force: true });
        console.log('RESET EVERYTHING: Next.js cache cleared successfully.');
      } catch (error) {
        console.error('RESET EVERYTHING: Error clearing Next.js cache:', error);
      }
    }
    
    // 2. Create a fresh Supabase client
    console.log('RESET EVERYTHING: Creating fresh Supabase client...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase credentials are missing'
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 3. Delete ALL data from Supabase
    console.log('RESET EVERYTHING: Deleting all data from Supabase...');
    
    // Delete all employees first (due to foreign key constraints)
    const { error: deleteEmployeesError } = await supabase
      .from('employees')
      .delete()
      .neq('id', 0); // This will delete all rows
    
    if (deleteEmployeesError) {
      return NextResponse.json({
        success: false,
        error: `Failed to delete employees: ${deleteEmployeesError.message}`
      }, { status: 500 });
    }
    
    // Then delete all companies
    const { error: deleteCompaniesError } = await supabase
      .from('companies')
      .delete()
      .neq('id', 0); // This will delete all rows
    
    if (deleteCompaniesError) {
      return NextResponse.json({
        success: false,
        error: `Failed to delete companies: ${deleteCompaniesError.message}`
      }, { status: 500 });
    }
    
    // 4. Add fresh test data
    console.log('RESET EVERYTHING: Adding fresh test data...');
    
    // Add two companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .insert([
        { 
          name: 'Fresh Company A', 
          description: 'A fresh test company A', 
          website: 'https://fresh-a.example.com' 
        },
        { 
          name: 'Fresh Company B', 
          description: 'A fresh test company B', 
          website: 'https://fresh-b.example.com' 
        }
      ])
      .select();
    
    if (companiesError) {
      return NextResponse.json({
        success: false,
        error: `Failed to insert companies: ${companiesError.message}`
      }, { status: 500 });
    }
    
    // Add two employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .insert([
        { 
          name: 'Fresh Employee 1', 
          email: 'employee1@fresh.example.com', 
          position: 'Developer', 
          company_id: companies[0].id 
        },
        { 
          name: 'Fresh Employee 2', 
          email: 'employee2@fresh.example.com', 
          position: 'Designer', 
          company_id: companies[1].id 
        }
      ])
      .select();
    
    if (employeesError) {
      return NextResponse.json({
        success: false,
        error: `Failed to insert employees: ${employeesError.message}`
      }, { status: 500 });
    }
    
    // 5. Return success with the new data
    return NextResponse.json({
      success: true,
      message: "Complete reset successful. Added fresh test data.",
      data: {
        companies,
        employees
      }
    });
  } catch (error) {
    console.error('RESET EVERYTHING ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during reset'
    }, { status: 500 });
  }
} 
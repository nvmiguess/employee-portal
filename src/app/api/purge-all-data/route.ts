import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('PURGE ALL DATA: Starting complete purge process...');
    
    // 1. Clear Next.js cache
    console.log('PURGE ALL DATA: Clearing Next.js cache...');
    const rootDir = process.cwd();
    const nextCacheDir = path.join(rootDir, '.next/cache');
    
    if (fs.existsSync(nextCacheDir)) {
      try {
        fs.rmSync(nextCacheDir, { recursive: true, force: true });
        console.log('PURGE ALL DATA: Next.js cache cleared successfully.');
      } catch (error) {
        console.error('PURGE ALL DATA: Error clearing Next.js cache:', error);
      }
    }
    
    // 2. Create a fresh Supabase client
    console.log('PURGE ALL DATA: Creating fresh Supabase client...');
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
    console.log('PURGE ALL DATA: Deleting all data from Supabase...');
    
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
    
    // 4. Add a single test company and employee
    console.log('PURGE ALL DATA: Adding a single test company and employee...');
    
    // Add one company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([
        { 
          name: 'Single Test Company', 
          description: 'This is the only company in the database', 
          website: 'https://single-test.example.com' 
        }
      ])
      .select();
    
    if (companyError) {
      return NextResponse.json({
        success: false,
        error: `Failed to insert company: ${companyError.message}`
      }, { status: 500 });
    }
    
    // Add one employee
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert([
        { 
          name: 'Single Test Employee', 
          email: 'test@single.example.com', 
          position: 'Tester', 
          company_id: company[0].id 
        }
      ])
      .select();
    
    if (employeeError) {
      return NextResponse.json({
        success: false,
        error: `Failed to insert employee: ${employeeError.message}`
      }, { status: 500 });
    }
    
    // 5. Return success with the new data
    return NextResponse.json({
      success: true,
      message: "Complete purge successful. Added a single test company and employee.",
      data: {
        company: company[0],
        employee: employee[0]
      }
    });
  } catch (error) {
    console.error('PURGE ALL DATA ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during purge'
    }, { status: 500 });
  }
} 
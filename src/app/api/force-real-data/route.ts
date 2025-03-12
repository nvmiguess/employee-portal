import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('FORCE REAL DATA: Starting process to ensure only real data is displayed');
    
    // Get the root directory
    const rootDir = process.cwd();
    
    // 1. Clear Next.js cache
    console.log('FORCE REAL DATA: Clearing Next.js cache...');
    const nextCacheDir = path.join(rootDir, '.next/cache');
    
    if (fs.existsSync(nextCacheDir)) {
      try {
        fs.rmSync(nextCacheDir, { recursive: true, force: true });
        console.log('FORCE REAL DATA: Next.js cache cleared successfully.');
      } catch (error) {
        console.error('FORCE REAL DATA: Error clearing Next.js cache:', error);
      }
    } else {
      console.log('FORCE REAL DATA: No Next.js cache directory found.');
    }
    
    // 2. Create a fresh Supabase client with explicit credentials
    console.log('FORCE REAL DATA: Creating fresh Supabase client...');
    
    // Get credentials from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase credentials are missing from environment variables'
      }, { status: 500 });
    }
    
    console.log(`FORCE REAL DATA: Using Supabase URL: ${supabaseUrl}`);
    console.log('FORCE REAL DATA: Supabase key is available');
    
    // Create a fresh client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 3. Test connection
    console.log('FORCE REAL DATA: Testing Supabase connection...');
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      return NextResponse.json({
        success: false,
        error: `Failed to connect to Supabase: ${versionError.message}`
      }, { status: 500 });
    }
    
    console.log(`FORCE REAL DATA: Connected to Supabase successfully. Version: ${JSON.stringify(versionData)}`);
    
    // 4. Get real data from Supabase
    console.log('FORCE REAL DATA: Fetching real data from Supabase...');
    
    // Get companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (companiesError) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch companies: ${companiesError.message}`
      }, { status: 500 });
    }
    
    console.log(`FORCE REAL DATA: Retrieved ${companies.length} companies from Supabase`);
    
    // Get employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*, company:companies(id, name)')
      .order('name');
    
    if (employeesError) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch employees: ${employeesError.message}`
      }, { status: 500 });
    }
    
    console.log(`FORCE REAL DATA: Retrieved ${employees.length} employees from Supabase`);
    
    // 5. Return the real data
    return NextResponse.json({
      success: true,
      message: "Retrieved real data directly from Supabase",
      cacheCleared: true,
      data: {
        companies,
        employees,
        connectionInfo: versionData
      }
    });
  } catch (error) {
    console.error('FORCE REAL DATA ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error retrieving real data'
    }, { status: 500 });
  }
} 
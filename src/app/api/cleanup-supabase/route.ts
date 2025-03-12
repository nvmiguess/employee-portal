import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('CLEANUP: Starting Supabase database cleanup process...');
    
    // Create a fresh Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase credentials are missing'
      }, { status: 500 });
    }
    
    console.log(`CLEANUP: Using Supabase URL: ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Get all companies
    console.log('CLEANUP: Fetching all companies...');
    const { data: allCompanies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (companiesError) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch companies: ${companiesError.message}`
      }, { status: 500 });
    }
    
    console.log(`CLEANUP: Found ${allCompanies.length} companies`);
    
    // 2. Get all employees
    console.log('CLEANUP: Fetching all employees...');
    const { data: allEmployees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (employeesError) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch employees: ${employeesError.message}`
      }, { status: 500 });
    }
    
    console.log(`CLEANUP: Found ${allEmployees.length} employees`);
    
    // 3. Identify unique companies by name (keeping only the most recent)
    const uniqueCompanies = [];
    const seenCompanyNames = new Set();
    
    for (const company of allCompanies) {
      if (!seenCompanyNames.has(company.name)) {
        uniqueCompanies.push(company);
        seenCompanyNames.add(company.name);
      }
    }
    
    console.log(`CLEANUP: Identified ${uniqueCompanies.length} unique companies`);
    
    // 4. Identify companies to delete
    const companiesToKeep = uniqueCompanies.map(company => company.id);
    const companiesToDelete = allCompanies
      .filter(company => !companiesToKeep.includes(company.id))
      .map(company => company.id);
    
    console.log(`CLEANUP: Will delete ${companiesToDelete.length} duplicate companies`);
    
    // 5. Identify unique employees by email (keeping only the most recent)
    const uniqueEmployees = [];
    const seenEmployeeEmails = new Set();
    
    for (const employee of allEmployees) {
      if (!seenEmployeeEmails.has(employee.email)) {
        uniqueEmployees.push(employee);
        seenEmployeeEmails.add(employee.email);
      }
    }
    
    console.log(`CLEANUP: Identified ${uniqueEmployees.length} unique employees`);
    
    // 6. Identify employees to delete
    const employeesToKeep = uniqueEmployees.map(employee => employee.id);
    const employeesToDelete = allEmployees
      .filter(employee => !employeesToKeep.includes(employee.id))
      .map(employee => employee.id);
    
    console.log(`CLEANUP: Will delete ${employeesToDelete.length} duplicate employees`);
    
    // 7. Delete duplicate companies
    let deletedCompanies = 0;
    if (companiesToDelete.length > 0) {
      console.log('CLEANUP: Deleting duplicate companies...');
      
      // Delete in batches of 100 to avoid query size limits
      for (let i = 0; i < companiesToDelete.length; i += 100) {
        const batch = companiesToDelete.slice(i, i + 100);
        const { error: deleteError } = await supabase
          .from('companies')
          .delete()
          .in('id', batch);
        
        if (deleteError) {
          console.error(`CLEANUP: Error deleting companies batch: ${deleteError.message}`);
        } else {
          deletedCompanies += batch.length;
        }
      }
    }
    
    // 8. Delete duplicate employees
    let deletedEmployees = 0;
    if (employeesToDelete.length > 0) {
      console.log('CLEANUP: Deleting duplicate employees...');
      
      // Delete in batches of 100 to avoid query size limits
      for (let i = 0; i < employeesToDelete.length; i += 100) {
        const batch = employeesToDelete.slice(i, i + 100);
        const { error: deleteError } = await supabase
          .from('employees')
          .delete()
          .in('id', batch);
        
        if (deleteError) {
          console.error(`CLEANUP: Error deleting employees batch: ${deleteError.message}`);
        } else {
          deletedEmployees += batch.length;
        }
      }
    }
    
    // 9. Update employee company references if needed
    console.log('CLEANUP: Checking employee company references...');
    
    // Get the current state of employees after cleanup
    const { data: currentEmployees, error: currentEmployeesError } = await supabase
      .from('employees')
      .select('*');
    
    if (currentEmployeesError) {
      console.error(`CLEANUP: Error fetching current employees: ${currentEmployeesError.message}`);
    } else {
      // Check if any employees reference companies that no longer exist
      const validCompanyIds = uniqueCompanies.map(company => company.id);
      const employeesToUpdate = currentEmployees.filter(
        employee => employee.company_id && !validCompanyIds.includes(employee.company_id)
      );
      
      if (employeesToUpdate.length > 0) {
        console.log(`CLEANUP: Found ${employeesToUpdate.length} employees with invalid company references`);
        
        // For each employee with an invalid company reference, try to find a valid company with the same name
        for (const employee of employeesToUpdate) {
          // Find the original company (that was deleted)
          const originalCompany = allCompanies.find(company => company.id === employee.company_id);
          
          if (originalCompany) {
            // Find a valid company with the same name
            const validCompany = uniqueCompanies.find(company => company.name === originalCompany.name);
            
            if (validCompany) {
              // Update the employee's company_id
              const { error: updateError } = await supabase
                .from('employees')
                .update({ company_id: validCompany.id })
                .eq('id', employee.id);
              
              if (updateError) {
                console.error(`CLEANUP: Error updating employee ${employee.id}: ${updateError.message}`);
              } else {
                console.log(`CLEANUP: Updated employee ${employee.id} to reference company ${validCompany.id}`);
              }
            }
          }
        }
      }
    }
    
    // 10. Return success with cleanup details
    return NextResponse.json({
      success: true,
      message: "Supabase database cleanup completed successfully",
      details: {
        initialCompanyCount: allCompanies.length,
        finalCompanyCount: uniqueCompanies.length,
        deletedCompanies,
        initialEmployeeCount: allEmployees.length,
        finalEmployeeCount: uniqueEmployees.length,
        deletedEmployees
      }
    });
  } catch (error) {
    console.error('CLEANUP ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during cleanup'
    }, { status: 500 });
  }
} 
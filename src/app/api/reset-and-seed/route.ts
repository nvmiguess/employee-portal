import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    console.log('Starting database reset and seeding...');
    
    // Delete existing data
    console.log('Deleting existing data...');
    
    // Delete employees first (because of foreign key constraints)
    const { error: deleteEmployeesError } = await supabase
      .from('employees')
      .delete()
      .neq('id', 0); // This will delete all records
    
    if (deleteEmployeesError) {
      console.error('Error deleting employees:', deleteEmployeesError);
      throw new Error(`Failed to delete employees: ${deleteEmployeesError.message}`);
    }
    
    // Then delete companies
    const { error: deleteCompaniesError } = await supabase
      .from('companies')
      .delete()
      .neq('id', 0); // This will delete all records
    
    if (deleteCompaniesError) {
      console.error('Error deleting companies:', deleteCompaniesError);
      throw new Error(`Failed to delete companies: ${deleteCompaniesError.message}`);
    }
    
    console.log('Existing data deleted');
    
    // Add sample companies
    console.log('Adding sample companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .insert([
        { name: 'Acme Inc', description: 'A fictional company', website: 'https://acme.example.com' },
        { name: 'Globex Corporation', description: 'Another fictional company', website: 'https://globex.example.com' },
        { name: 'Stark Industries', description: 'Technology company', website: 'https://stark.example.com' }
      ])
      .select();
    
    if (companiesError) {
      console.error('Error inserting companies:', companiesError);
      throw new Error(`Failed to insert companies: ${companiesError.message}`);
    }
    
    console.log('Companies added:', companies);
    
    // Add sample employees
    console.log('Adding sample employees...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .insert([
        { 
          name: 'John Doe', 
          email: 'john@example.com', 
          position: 'Developer', 
          department: 'Engineering', 
          status: 'Active',
          company_id: companies[0].id
        },
        { 
          name: 'Jane Smith', 
          email: 'jane@example.com', 
          position: 'Designer', 
          department: 'Product', 
          status: 'Active',
          company_id: companies[1].id
        }
      ])
      .select();
    
    if (employeesError) {
      console.error('Error inserting employees:', employeesError);
      throw new Error(`Failed to insert employees: ${employeesError.message}`);
    }
    
    console.log('Employees added:', employees);
    
    return NextResponse.json({
      success: true,
      message: "Database reset and seeded successfully",
      data: { companies, employees }
    });
  } catch (error) {
    console.error('Reset and seed error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during reset and seed'
    }, { status: 500 });
  }
} 
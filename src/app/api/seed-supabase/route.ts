import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    console.log('Starting database seeding...');
    
    // First, check if we need to clean up any existing data
    const { count: companyCount, error: countError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking existing data:', countError);
      throw new Error(`Failed to check existing data: ${countError.message}`);
    }
    
    // If there are more than 3 companies, we likely have duplicates
    if (companyCount > 3) {
      console.log(`Found ${companyCount} companies, cleaning up before seeding...`);
      
      // Delete all existing data
      console.log('Deleting all existing employees...');
      await supabase.from('employees').delete().neq('id', 0);
      
      console.log('Deleting all existing companies...');
      await supabase.from('companies').delete().neq('id', 0);
      
      console.log('Existing data deleted successfully.');
    } else if (companyCount > 0) {
      console.log('Database already has some data. Skipping seed operation.');
      return NextResponse.json({
        success: true,
        message: "Database already has data",
        data: { existing: true, count: companyCount }
      });
    }
    
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
          name: 'Alice Johnson', 
          email: 'alice@example.com', 
          position: 'Software Engineer', 
          company_id: companies[0].id 
        },
        { 
          name: 'Bob Smith', 
          email: 'bob@example.com', 
          position: 'Product Manager', 
          company_id: companies[1].id 
        },
        { 
          name: 'Carol Williams', 
          email: 'carol@example.com', 
          position: 'UX Designer', 
          company_id: companies[2].id 
        },
        { 
          name: 'Dave Brown', 
          email: 'dave@example.com', 
          position: 'DevOps Engineer', 
          company_id: companies[0].id 
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
      message: "Database seeded successfully",
      data: {
        companies,
        employees
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error seeding database'
    }, { status: 500 });
  }
} 
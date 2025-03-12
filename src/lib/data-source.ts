import { supabase } from './supabase';

// Set this to 'supabase' to use Supabase, or 'prisma' to use Prisma
const DATA_SOURCE = 'supabase';

export async function getCompanies() {
  if (DATA_SOURCE === 'supabase') {
    // Use Supabase
    try {
      console.log('Fetching companies from Supabase...');
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching companies from Supabase:', error);
        throw error;
      }
      
      console.log('Companies retrieved from Supabase:', data);
      return data || [];
    } catch (error) {
      console.error('Failed to get companies from Supabase:', error);
      return [];
    }
  } else {
    // Use Prisma
    try {
      console.log('Fetching companies from Prisma...');
      const { prisma } = await import('./prisma');
      const companies = await prisma.company.findMany({
        orderBy: { name: 'asc' }
      });
      
      console.log('Companies retrieved from Prisma:', companies);
      return companies;
    } catch (error) {
      console.error('Failed to get companies from Prisma:', error);
      return [];
    }
  }
}

export async function getEmployees() {
  if (DATA_SOURCE === 'supabase') {
    // Use Supabase
    try {
      console.log('Fetching employees from Supabase...');
      const { data, error } = await supabase
        .from('employees')
        .select('*, company:companies(id, name)')
        .order('name');
      
      if (error) {
        console.error('Error fetching employees from Supabase:', error);
        throw error;
      }
      
      console.log('Employees retrieved from Supabase:', data);
      return data || [];
    } catch (error) {
      console.error('Failed to get employees from Supabase:', error);
      return [];
    }
  } else {
    // Use Prisma
    try {
      console.log('Fetching employees from Prisma...');
      const { prisma } = await import('./prisma');
      const employees = await prisma.employee.findMany({
        include: { company: true },
        orderBy: { name: 'asc' }
      });
      
      console.log('Employees retrieved from Prisma:', employees);
      return employees;
    } catch (error) {
      console.error('Failed to get employees from Prisma:', error);
      return [];
    }
  }
} 
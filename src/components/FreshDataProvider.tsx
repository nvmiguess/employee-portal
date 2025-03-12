'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

type Company = {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  created_at: string;
};

type Employee = {
  id: number;
  name: string;
  email: string;
  position: string;
  company_id: number;
  company?: Company;
  created_at: string;
};

type FreshDataProviderProps = {
  children: (data: {
    companies: Company[];
    employees: Employee[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
  }) => React.ReactNode;
};

export default function FreshDataProvider({ children }: FreshDataProviderProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a fresh Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials are missing');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });
      
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (companiesError) {
        throw new Error(`Failed to fetch companies: ${companiesError.message}`);
      }
      
      // Fetch employees with company information
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*, company:companies(id, name)')
        .order('name');
      
      if (employeesError) {
        throw new Error(`Failed to fetch employees: ${employeesError.message}`);
      }
      
      setCompanies(companiesData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error fetching data');
      console.error('Error fetching fresh data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return <>{children({ companies, employees, loading, error, refresh: fetchData })}</>;
} 
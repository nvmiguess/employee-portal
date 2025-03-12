'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, createContext, useContext } from 'react';

// Hardcoded credentials for testing
const supabaseUrl = 'https://lvqhxqkvorqfungphdzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cWh4cWt2b3JxZnVuZ3BoZHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTQxMzUsImV4cCI6MjA1NzMzMDEzNX0.uU3gItOnBIKXW0mP5tNGXIfb_W1-p8qAZJ-Nzy-1jVM';

// Create a fresh Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Define types for our context
type Company = {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
};

type Employee = {
  id: number;
  name: string;
  email: string;
  position: string;
  company_id: number;
  created_at: string;
  updated_at: string;
  company?: Company;
};

type RealtimeContextType = {
  companies: Company[];
  employees: Employee[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
};

// Create context
const RealtimeContext = createContext<RealtimeContextType>({
  companies: [],
  employees: [],
  loading: true,
  error: null,
  refreshData: async () => {}
});

// Hook to use the context
export const useRealtimeData = () => useContext(RealtimeContext);

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (companiesError) throw new Error(`Companies error: ${companiesError.message}`);
      
      // Fetch employees with company info
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*, company:companies(id, name)')
        .order('name');
      
      if (employeesError) throw new Error(`Employees error: ${employeesError.message}`);
      
      setCompanies(companiesData);
      setEmployees(employeesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    // Initial data fetch
    fetchData();
    
    // Subscribe to companies changes
    const companiesSubscription = supabase
      .channel('companies-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'companies' }, 
        (payload) => {
          console.log('Companies change received:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            setCompanies(prev => [...prev, payload.new as Company]);
          } else if (payload.eventType === 'UPDATE') {
            setCompanies(prev => 
              prev.map(company => 
                company.id === payload.new.id ? payload.new as Company : company
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setCompanies(prev => 
              prev.filter(company => company.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
    
    // Subscribe to employees changes
    const employeesSubscription = supabase
      .channel('employees-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employees' }, 
        async (payload) => {
          console.log('Employees change received:', payload);
          
          // For employee changes, we'll refetch all employees to get the company relation
          // This is simpler than trying to manually update the nested company data
          const { data, error } = await supabase
            .from('employees')
            .select('*, company:companies(id, name)')
            .order('name');
          
          if (!error && data) {
            setEmployees(data);
          }
        }
      )
      .subscribe();
    
    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(companiesSubscription);
      supabase.removeChannel(employeesSubscription);
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ 
      companies, 
      employees, 
      loading, 
      error, 
      refreshData: fetchData 
    }}>
      {children}
    </RealtimeContext.Provider>
  );
} 
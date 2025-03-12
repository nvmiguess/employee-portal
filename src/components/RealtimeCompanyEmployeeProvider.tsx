'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Define the context type
type RealtimeCompanyEmployeeContextType = {
  company: any;
  employee: any;
  employees: any[];
  companyLoading: boolean;
  employeeLoading: boolean;
  employeesLoading: boolean;
  error: any;
};

// Create the context with a default value
const RealtimeCompanyEmployeeContext = createContext<RealtimeCompanyEmployeeContextType>({
  company: null,
  employee: null,
  employees: [],
  companyLoading: true,
  employeeLoading: true,
  employeesLoading: true,
  error: null
});

// Create a Supabase client directly
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Export the hook first, before the provider
export const useRealtimeCompanyEmployee = () => useContext(RealtimeCompanyEmployeeContext);

// Then export the provider
export const RealtimeCompanyEmployeeProvider = ({ 
  children, 
  companyId,
  employeeId = null 
}) => {
  const [company, setCompany] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch company data
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();

        if (error) throw error;
        setCompany(data);
      } catch (error) {
        console.error('Error fetching company:', error);
        setError(error.message);
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompany();

    // Set up real-time subscription for company
    const companyChannel = supabase
      .channel(`company-${companyId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'companies', filter: `id=eq.${companyId}` }, 
        (payload) => {
          console.log('Company update received:', payload);
          setCompany(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(companyChannel);
    };
  }, [companyId]);

  // Fetch employees for this company
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('company_id', companyId)
          .order('name');

        if (error) throw error;
        setEmployees(data || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError(error.message);
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();

    // Set up real-time subscription for employees
    const employeesChannel = supabase
      .channel(`company-employees-${companyId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employees', filter: `company_id=eq.${companyId}` }, 
        (payload) => {
          console.log('Company employees update received:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            setEmployees(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setEmployees(prev => 
              prev.map(emp => emp.id === payload.new.id ? payload.new : emp)
            );
          } else if (payload.eventType === 'DELETE') {
            setEmployees(prev => prev.filter(emp => emp.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(employeesChannel);
    };
  }, [companyId]);

  // Fetch specific employee if employeeId is provided
  useEffect(() => {
    if (!employeeId) {
      setEmployeeLoading(false);
      return;
    }

    const fetchEmployee = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*, company:companies(id, name)')
          .eq('id', employeeId)
          .single();

        if (error) throw error;
        setEmployee(data);
      } catch (error) {
        console.error('Error fetching employee:', error);
        setError(error.message);
      } finally {
        setEmployeeLoading(false);
      }
    };

    fetchEmployee();

    // Set up real-time subscription for specific employee
    const employeeChannel = supabase
      .channel(`employee-${employeeId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'employees', filter: `id=eq.${employeeId}` }, 
        (payload) => {
          console.log('Employee update received:', payload);
          setEmployee(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(employeeChannel);
    };
  }, [employeeId]);

  return (
    <RealtimeCompanyEmployeeContext.Provider 
      value={{ 
        company, 
        employee, 
        employees, 
        companyLoading, 
        employeeLoading, 
        employeesLoading, 
        error 
      }}
    >
      {children}
    </RealtimeCompanyEmployeeContext.Provider>
  );
}; 
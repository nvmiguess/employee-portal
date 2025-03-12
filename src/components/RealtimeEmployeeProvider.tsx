'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Define the context type
type RealtimeEmployeeContextType = {
  employee: any;
  loading: boolean;
  error: any;
};

// Create the context with a default value
const RealtimeEmployeeContext = createContext<RealtimeEmployeeContextType>({
  employee: null,
  loading: true,
  error: null
});

// Create a Supabase client directly
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Export the hook first, before the provider
export const useRealtimeEmployee = () => useContext(RealtimeEmployeeContext);

// Then export the provider
export const RealtimeEmployeeProvider = ({ children, employeeId }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
        setLoading(false);
      }
    };

    fetchEmployee();

    // Set up real-time subscription
    const channel = supabase
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
      supabase.removeChannel(channel);
    };
  }, [employeeId]);

  return (
    <RealtimeEmployeeContext.Provider value={{ employee, loading, error }}>
      {children}
    </RealtimeEmployeeContext.Provider>
  );
}; 
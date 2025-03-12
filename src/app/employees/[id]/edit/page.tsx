'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client directly
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Company {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  status: string;
  company_id: number | null;
  hire_date: string;
}

export default function EditEmployeeRedirectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = parseInt(params.id);

  useEffect(() => {
    const redirectToNewUrl = async () => {
      try {
        // Fetch employee to get company_id
        const { data, error } = await supabase
          .from('employees')
          .select('company_id')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data.company_id) {
          // Redirect to the new URL structure
          router.push(`/companies/${data.company_id}/employees/${id}/edit`);
        } else {
          // If employee has no company, show an error or redirect to a default page
          router.push('/');
        }
      } catch (error) {
        console.error('Error redirecting:', error);
        router.push('/');
      }
    };

    redirectToNewUrl();
  }, [id, router]);

  return <div className="p-8 text-center">Redirecting...</div>;
} 
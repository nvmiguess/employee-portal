'use client';

import Link from 'next/link';
import { getCompanies } from '../lib/database';
import { useEffect, useState } from 'react';

// Simplified debug function that only uses Supabase
async function fetchCompaniesFromSupabase() {
  // Try to get companies from Supabase directly
  let supabaseCompanies = [];
  try {
    const { supabase } = await import('../lib/supabase');
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (!error) {
      supabaseCompanies = data || [];
    }
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
  }
  
  // Get companies from the regular function
  const regularCompanies = await getCompanies();
  
  return {
    supabaseCompanies,
    regularCompanies
  };
}

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    setLoading(true);
    const allCompanies = await getCompanies();
    setCompanies(allCompanies);
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []); // Add dependencies if needed

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Portal</h1>
          <Link 
            href="/employees/new" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Add Employee
          </Link>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Companies</h2>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          companies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No companies found</p>
              <Link 
                href="/api/seed-supabase" 
                className="text-blue-500 hover:underline"
              >
                Seed the database with sample data
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Link 
                  key={company.id} 
                  href={`/companies/${company.id}`}
                  className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <h3 className="text-xl font-semibold mb-2">{company.name}</h3>
                  {company.description && (
                    <p className="text-gray-600 mb-4">{company.description}</p>
                  )}
                  {company.website && (
                    <p className="text-blue-500 text-sm">{company.website}</p>
                  )}
                </Link>
              ))}
            </div>
          )
        )}
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              href="/employees" 
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <h3 className="text-xl font-semibold mb-2">View All Employees</h3>
              <p className="text-gray-600">Manage employee records</p>
            </Link>
            
            <Link 
              href="/debug/db-status" 
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <h3 className="text-xl font-semibold mb-2">Database Status</h3>
              <p className="text-gray-600">Check database connection</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 
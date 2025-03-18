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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Portal</h1>
          <Link 
            href="/employees/add" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Employee
          </Link>
        </div>
        
        {/* Companies section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-10">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Companies</h2>
            <Link 
              href="/companies/new" 
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add
            </Link>
          </div>
          
          <div className="p-6 dark:bg-gray-800">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
              </div>
            ) : (
              companies.length === 0 ? (
                <div className="text-center py-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No companies found</p>
                  <div className="mt-6">
                    <Link 
                      href="/api/seed-supabase" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      Seed the database with sample data
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <Link 
                      key={company.id} 
                      href={`/companies/${company.id}`}
                      className="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all p-6 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{company.name}</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {company.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{company.description}</p>
                      )}
                      {company.website && (
                        <p className="text-blue-500 dark:text-blue-400 text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          {company.website}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
        
        {/* Quick Links section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Links</h2>
          </div>
          
          <div className="p-6 dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link 
                href="/employees" 
                className="group flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">View All Employees</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage employee records</p>
                </div>
              </Link>
              
              <Link 
                href="/debug/db-status" 
                className="group flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">Database Status</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Check database connection</p>
                </div>
              </Link>
              
              <Link 
                href="/invoices/create" 
                className="group flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">Create Invoice</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Upload XML to Xero</p>
                </div>
              </Link>

              <Link 
                href="/csv-convert" 
                className="group flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">Convert CSV</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Convert XLSX to CSV</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
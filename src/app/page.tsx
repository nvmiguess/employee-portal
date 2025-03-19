'use client';

import Link from 'next/link';
import { getCompanies } from '../lib/database';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Simplified debug function that only uses Supabase
async function fetchCompaniesFromSupabase() {
  console.log('Home Page - Debug: Fetching companies from Supabase');
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
      console.log('Home Page - Debug: Supabase companies fetched:', { count: supabaseCompanies.length });
    }
  } catch (error) {
    console.error('Home Page - Debug: Error fetching from Supabase:', error);
  }
  
  // Get companies from the regular function
  const regularCompanies = await getCompanies();
  console.log('Home Page - Debug: Regular companies fetched:', { count: regularCompanies.length });
  
  return {
    supabaseCompanies,
    regularCompanies
  };
}

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('Home Page - Auth State Changed:', {
      authLoading,
      isAuthenticated: !!user,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    });
  }, [user, authLoading]);

  const fetchCompanies = async () => {
    console.log('Home Page - Fetching companies');
    setLoading(true);
    const allCompanies = await getCompanies();
    console.log('Home Page - Companies fetched:', {
      count: allCompanies.length,
      timestamp: new Date().toISOString()
    });
    setCompanies(allCompanies);
    setLoading(false);
  };

  useEffect(() => {
    console.log('Home Page - Component mounted');
    fetchCompanies();
  }, []);

  if (authLoading) {
    console.log('Home Page - Auth loading, showing spinner');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  console.log('Home Page - Rendering with auth state:', {
    isAuthenticated: !!user,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Employee Portal</h1>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
              <button
                onClick={async () => {
                  console.log('Home Page - Sign out button clicked', {
                    timestamp: new Date().toISOString()
                  });
                  const { supabase } = await import('../lib/supabase');
                  await supabase.auth.signOut();
                  console.log('Home Page - Sign out completed', {
                    timestamp: new Date().toISOString()
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={(e) => {
                console.log('Home Page - Sign in link clicked', {
                  timestamp: new Date().toISOString(),
                  event: e
                });
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Tools</h2>
          </div>
          
          <div className="p-6 dark:bg-gray-800">
            {!user && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Sign in required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>
                        Please sign in to access all features. Some tools require authentication to use.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Employee Portal Card */}
              <Link 
                href={user ? "/employee-portal" : "#"}
                onClick={(e) => {
                  console.log('Home Page - Employee Portal card clicked', {
                    timestamp: new Date().toISOString(),
                    event: e,
                    isAuthenticated: !!user
                  });
                  if (!user) {
                    e.preventDefault();
                    alert('Please sign in to access the Employee Portal');
                  }
                }}
                className={`group flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${
                  user 
                    ? 'hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700' 
                    : 'opacity-75 cursor-not-allowed'
                }`}
              >
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">Employee Portal</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage companies and employees</p>
                </div>
              </Link>

              {/* Convert CSV Card */}
              <Link 
                href={user ? "/csv-convert" : "#"}
                onClick={(e) => {
                  console.log('Home Page - Convert CSV card clicked', {
                    timestamp: new Date().toISOString(),
                    event: e,
                    isAuthenticated: !!user
                  });
                  if (!user) {
                    e.preventDefault();
                    alert('Please sign in to access the CSV Converter');
                  }
                }}
                className={`group flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${
                  user 
                    ? 'hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700' 
                    : 'opacity-75 cursor-not-allowed'
                }`}
              >
                <div className="flex-shrink-0 h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">Convert CSV</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Convert XLSX files to CSV format</p>
                </div>
              </Link>

              {/* Upload to Xero Card */}
              <Link 
                href={user ? "/xero-upload" : "#"}
                onClick={(e) => {
                  console.log('Home Page - Upload to Xero card clicked', {
                    timestamp: new Date().toISOString(),
                    event: e,
                    isAuthenticated: !!user
                  });
                  if (!user) {
                    e.preventDefault();
                    alert('Please sign in to access the Xero Upload tool');
                  }
                }}
                className={`group flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${
                  user 
                    ? 'hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700' 
                    : 'opacity-75 cursor-not-allowed'
                }`}
              >
                <div className="flex-shrink-0 h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">Upload to Xero</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Convert and upload invoices to Xero</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCompanies } from '@/lib/database';

export default function EmployeePortal() {
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
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Employee Portal
          </h1>
          {/* Navigation and header */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Back to Home</span>
            </Link>
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
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Companies</h1>
            </div>
            
            <div className="p-6 dark:bg-gray-800">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No companies found</p>
                  <div className="mt-6">
                    <Link 
                      href="/companies/add" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      Add your first company
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <Link 
                      key={company.id} 
                      href={`/companies/${company.id}`}
                      className="block bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition-shadow p-6"
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{company.name}</h3>
                      {company.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{company.description}</p>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
'use client';

import Link from 'next/link';
import { useRealtimeData } from '../components/RealtimeProvider';

export default function RealtimeHomePage() {
  const { companies, employees, loading, error, refreshData } = useRealtimeData();
  
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Employee Portal</h1>
          <div className="flex space-x-4">
            <Link 
              href="/employees/new" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Add Employee
            </Link>
            <Link 
              href="/companies/new" 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
            >
              Add Company
            </Link>
            <Link 
              href="/" 
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Regular Home
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Real-Time Updates</h2>
          <p className="text-gray-600 mb-2">
            This page uses Supabase real-time subscriptions to update automatically when data changes.
          </p>
          <p className="text-gray-600 mb-4">
            Try opening this page in multiple tabs and making changes.
          </p>
          
          {loading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
              Loading data...
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          )}
          
          <button 
            onClick={() => refreshData()}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition-colors"
          >
            Refresh Data
          </button>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Companies ({companies.length})</h2>
        
        {companies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No companies found</p>
            <Link 
              href="/companies/new" 
              className="text-blue-500 hover:underline"
            >
              Add your first company
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
                <p className="text-xs text-gray-400 mt-2">ID: {company.id}</p>
              </Link>
            ))}
          </div>
        )}
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">Employees ({employees.length})</h2>
        
        {employees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No employees found</p>
            <Link 
              href="/employees/new" 
              className="text-blue-500 hover:underline"
            >
              Add your first employee
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{employee.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{employee.company?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/employees/${employee.id}`} className="text-blue-500 hover:underline mr-4">
                        View
                      </Link>
                      <Link href={`/employees/${employee.id}/edit`} className="text-indigo-500 hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
} 
import Link from 'next/link';
import FreshDataProvider from '../../../components/FreshDataProvider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LiveDataPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Live Supabase Data</h1>
      
      <FreshDataProvider>
        {({ companies, employees, loading, error, refresh }) => (
          <>
            {loading && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
                <p className="font-bold">Loading...</p>
                <p>Fetching the latest data from Supabase.</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
              <button
                onClick={refresh}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Companies ({companies.length})</h2>
              
              {companies.length === 0 ? (
                <p className="text-gray-500">No companies found in the database.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {companies.map(company => (
                    <li key={company.id} className="py-3">
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-gray-500">{company.description}</div>
                      {company.website && (
                        <a href={company.website} className="text-sm text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                          {company.website}
                        </a>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        ID: {company.id} | Created: {new Date(company.created_at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Employees ({employees.length})</h2>
              
              {employees.length === 0 ? (
                <p className="text-gray-500">No employees found in the database.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {employees.map(employee => (
                    <li key={employee.id} className="py-3">
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.email}</div>
                      <div className="text-sm text-gray-500">
                        {employee.position} at {employee.company?.name || 'Unknown Company'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ID: {employee.id} | Company ID: {employee.company_id} | Created: {new Date(employee.created_at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="mt-6 flex space-x-4">
              <Link href="/debug/db-status" className="text-blue-500 hover:underline">
                ← Back to Database Status
              </Link>
              <Link href="/api/cleanup-supabase" className="text-red-500 hover:underline">
                Cleanup Database
              </Link>
            </div>
          </>
        )}
      </FreshDataProvider>
    </div>
  );
} 
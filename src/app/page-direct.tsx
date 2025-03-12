import Link from 'next/link';
import { getCompanies } from '../lib/direct-database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DirectHomePage() {
  // Use the direct database connection
  const companies = await getCompanies();
  
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Direct Employee Portal</h1>
          <div className="flex space-x-4">
            <Link 
              href="/employees/new" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Add Employee
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Direct Database Connection</h2>
          <p className="text-gray-600 mb-2">
            This page uses a direct connection to Supabase with no caching or middleware.
          </p>
          <p className="text-gray-600 mb-4">
            Generated at: {new Date().toLocaleString()}
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Companies ({companies.length})</h2>
        
        {companies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No companies found</p>
            <Link 
              href="/api/reset-everything" 
              className="text-blue-500 hover:underline"
            >
              Reset everything and add fresh test data
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
        
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </main>
  );
} 
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RealDataPage() {
  // Create a fresh Supabase client with explicit credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Real Supabase Data</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error: Supabase credentials are missing</p>
          <p>Please check your environment variables.</p>
        </div>
        <Link href="/debug/db-status" className="text-blue-500 hover:underline">
          ← Back to Database Status
        </Link>
      </div>
    );
  }
  
  console.log('REAL DATA PAGE: Creating fresh Supabase client');
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
  
  try {
    // Test connection
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Real Supabase Data</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Connection Error</p>
            <p>{versionError.message}</p>
          </div>
          <Link href="/debug/db-status" className="text-blue-500 hover:underline">
            ← Back to Database Status
          </Link>
        </div>
      );
    }
    
    // Fetch companies directly from Supabase
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (companiesError) {
      throw new Error(`Failed to fetch companies: ${companiesError.message}`);
    }
    
    // Fetch employees directly from Supabase
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*, company:companies(id, name)')
      .order('name');
    
    if (employeesError) {
      throw new Error(`Failed to fetch employees: ${employeesError.message}`);
    }
    
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Real Supabase Data</h1>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Connected to Supabase successfully</p>
          <p>Version: {JSON.stringify(versionData)}</p>
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
                  <div className="text-sm text-gray-500">{company.description || 'No description'}</div>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                      {company.website}
                    </a>
                  )}
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
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="mt-6 flex space-x-4">
          <Link href="/debug/db-status" className="text-blue-500 hover:underline">
            ← Back to Database Status
          </Link>
          <Link href="/api/seed-supabase" className="text-green-500 hover:underline">
            Seed Database
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in real-data page:', error);
    
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Real Supabase Data</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
        <Link href="/debug/db-status" className="text-blue-500 hover:underline">
          ← Back to Database Status
        </Link>
      </div>
    );
  }
} 
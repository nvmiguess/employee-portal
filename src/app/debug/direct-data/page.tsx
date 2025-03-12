import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DirectDataPage() {
  try {
    // Create a completely fresh Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are missing');
    }
    
    console.log('DIRECT DATA PAGE: Creating fresh Supabase client with URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    // Test connection
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      throw new Error(`Failed to connect to Supabase: ${versionError.message}`);
    }
    
    console.log('DIRECT DATA PAGE: Connected to Supabase successfully');
    
    // Get all companies directly
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('id');
    
    if (companiesError) {
      throw new Error(`Failed to fetch companies: ${companiesError.message}`);
    }
    
    console.log(`DIRECT DATA PAGE: Retrieved ${companies.length} companies`);
    
    // Get all employees directly
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*, company:companies(id, name)')
      .order('id');
    
    if (employeesError) {
      throw new Error(`Failed to fetch employees: ${employeesError.message}`);
    }
    
    console.log(`DIRECT DATA PAGE: Retrieved ${employees.length} employees`);
    
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Direct Database Data</h1>
        <p className="text-gray-500 mb-6">
          This page shows data directly from the database with no caching or middleware.
          Generated at: {new Date().toLocaleString()}
        </p>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Info</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(versionData, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Companies ({companies.length})</h2>
          
          {companies.length === 0 ? (
            <p className="text-gray-500">No companies found in the database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.website || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(company.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Employees ({employees.length})</h2>
          
          {employees.length === 0 ? (
            <p className="text-gray-500">No employees found in the database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.company?.name || `Unknown (ID: ${employee.company_id})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(employee.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="flex space-x-4 mt-6">
          <Link href="/debug/db-status" className="text-blue-500 hover:underline">
            ← Back to Database Status
          </Link>
          <Link href="/api/reset-everything" className="text-red-500 hover:underline">
            Reset Everything
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="text-green-500 hover:underline"
          >
            Refresh This Page
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in direct-data page:', error);
    
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Direct Database Data</h1>
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
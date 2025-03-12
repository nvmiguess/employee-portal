import Link from 'next/link';
import { checkDatabaseConnection } from '../../../lib/database';
import RefreshButton from './RefreshButton';

export default async function DbStatusPage() {
  const dbStatus = await checkDatabaseConnection();
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Status</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        
        {dbStatus.connected ? (
          <div className="text-green-600 font-medium mb-4">
            ✅ Connected to Supabase successfully
          </div>
        ) : (
          <div className="text-red-600 font-medium mb-4">
            ❌ Failed to connect to Supabase
          </div>
        )}
        
        {dbStatus.error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Details</h3>
            <pre className="whitespace-pre-wrap text-sm text-red-700">{dbStatus.error}</pre>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Database Actions</h2>
        
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/api/seed-supabase"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Seed Database
          </Link>
          
          <Link 
            href="/api/reset-and-seed"
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            Reset & Seed Database
          </Link>
          
          <Link 
            href="/api/test-insert"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Test Insert
          </Link>
          
          <Link 
            href="/api/debug-data"
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Debug Data
          </Link>
          
          <Link 
            href="/debug/db-status"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Refresh Status
          </Link>
          
          <Link 
            href="/debug/raw-data"
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
          >
            View Raw Data
          </Link>
          
          <Link 
            href="/api/check-prisma"
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Check Prisma
          </Link>
          
          <Link 
            href="/api/check-data-source"
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          >
            Check Data Source
          </Link>
          
          <Link 
            href="/api/direct-supabase-test"
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
          >
            Direct Supabase Test
          </Link>
          
          <Link 
            href="/api/inspect-environment"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Inspect Environment
          </Link>
          
          <Link 
            href="/api/force-rebuild"
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Force Clean Rebuild
          </Link>
          
          <Link 
            href="/api/force-real-data"
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors font-bold"
          >
            FORCE REAL DATA ONLY
          </Link>
          
          <Link 
            href="/debug/real-data"
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors font-bold"
          >
            VIEW REAL DATA PAGE
          </Link>
          
          <Link 
            href="/api/cleanup-supabase"
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors font-bold"
          >
            CLEANUP DATABASE
          </Link>
          
          <Link 
            href="/debug/live-data"
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors font-bold"
          >
            VIEW LIVE DATA
          </Link>
          
          <Link 
            href="/api/reset-everything"
            className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900 transition-colors font-bold"
          >
            RESET EVERYTHING
          </Link>
          
          <Link 
            href="/debug/direct-data"
            className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors font-bold"
          >
            VIEW DIRECT DATA
          </Link>
          
          <Link 
            href="/api/purge-all-data"
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900 transition-colors font-bold"
          >
            PURGE ALL DATA
          </Link>
          
          <Link 
            href="/page-direct"
            className="px-4 py-2 bg-purple-800 text-white rounded hover:bg-purple-900 transition-colors font-bold"
          >
            DIRECT HOME PAGE
          </Link>
          
          <Link 
            href="/page-realtime"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-bold"
          >
            REAL-TIME HOME PAGE
          </Link>
        </div>
      </div>
      
      <div className="mt-6">
        <Link 
          href="/" 
          className="text-blue-500 hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
} 
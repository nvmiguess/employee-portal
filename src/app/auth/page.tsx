'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAuthUrl = async () => {
      try {
        setLoading(true);
        console.log('Fetching Xero authentication URL...');
        
        const response = await fetch('/api/xero/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'getAuthUrl',
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Error fetching auth URL:', data.error);
          setError(data.error || 'Failed to get authentication URL');
          return;
        }
        
        console.log('Authentication URL received');
        setAuthUrl(data.url);
      } catch (error) {
        console.error('Error in auth page:', error);
        setError('An unexpected error occurred while connecting to Xero');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuthUrl();
  }, []);
  
  const handleConnect = () => {
    if (authUrl) {
      console.log('Redirecting to Xero authentication page...');
      window.location.href = authUrl;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Xero Authentication</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Connect to your Xero account</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center py-6">
              {loading ? (
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Preparing Authentication</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we connect to Xero...
                  </p>
                </>
              ) : error ? (
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Authentication Error</h2>
                  <p className="text-red-600 dark:text-red-400 mb-4">
                    {error}
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                    >
                      Try Again
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Connect to Xero</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You need to connect to your Xero account before creating invoices.
                    Click the button below to authenticate with Xero.
                  </p>
                  <div className="flex flex-col space-y-4">
                    <button
                      onClick={handleConnect}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                    >
                      Connect to Xero
                    </button>
                    <Link
                      href="/"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                    >
                      Return to Home
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
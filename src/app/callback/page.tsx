'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from the URL
        const code = searchParams.get('code');
        
        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code found in the callback URL');
          return;
        }
        
        console.log('Authorization code received:', code);
        
        // Exchange the code for tokens
        const response = await fetch('/api/xero/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'exchangeCode',
            code,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Error exchanging code for tokens:', data.error);
          setStatus('error');
          setErrorMessage(data.error || 'Failed to exchange authorization code for tokens');
          return;
        }
        
        console.log('Tokens received successfully');
        
        // Store the tokens in localStorage
        localStorage.setItem('xero_access_token', data.accessToken);
        localStorage.setItem('xero_refresh_token', data.refreshToken);
        localStorage.setItem('xero_expires_at', data.expiresAt.toString());
        
        setStatus('success');
        
        // Redirect to the invoice creation page after a short delay
        setTimeout(() => {
          router.push('/invoices/create');
        }, 2000);
        
      } catch (error) {
        console.error('Error in callback handler:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred during authentication');
      }
    };
    
    handleCallback();
  }, [searchParams, router]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Xero Authentication</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Processing your authentication</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center py-6">
              {status === 'loading' && (
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Processing Authentication</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we complete your authentication with Xero...
                  </p>
                </>
              )}
              
              {status === 'success' && (
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Authentication Successful</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You have successfully connected to your Xero account.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Redirecting you to the invoice creation page...
                  </p>
                </>
              )}
              
              {status === 'error' && (
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Authentication Failed</h2>
                  <p className="text-red-600 dark:text-red-400 mb-4">
                    {errorMessage || 'An error occurred during authentication.'}
                  </p>
                  <div className="mt-4">
                    <Link 
                      href="/auth"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                    >
                      Try Again
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
'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { getAuthUrl, createInvoiceFromXml, refreshAccessToken } from '../../../lib/xero';
import { useRouter } from 'next/navigation';

export default function CreateInvoice() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const accessToken = localStorage.getItem('xero_access_token');
    const expiresAt = localStorage.getItem('xero_expires_at');
    
    if (!accessToken || !expiresAt || Date.now() > parseInt(expiresAt)) {
      console.log('User is not authenticated or token has expired');
      setIsAuthenticated(false);
    } else {
      console.log('User is authenticated');
      setIsAuthenticated(true);
    }
  }, []);

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      console.log('Redirecting to auth page...');
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  // Get auth URL if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      // Get auth URL
      const fetchAuthUrl = async () => {
        try {
          setIsLoading(true);
          const url = await getAuthUrl();
          setAuthUrl(url);
        } catch (error) {
          console.error('Error getting auth URL:', error);
          setError('Failed to get authentication URL');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAuthUrl();
    }
  }, [isAuthenticated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log('File selected via onChange:', file?.name);
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Check if a file is selected
      if (!selectedFile) {
        setError('Please select a file to upload');
        setIsLoading(false);
        return;
      }
      
      // Check if the file is an XML file
      if (!selectedFile.name.toLowerCase().endsWith('.xml')) {
        setError('Please upload an XML file');
        setIsLoading(false);
        return;
      }
      
      console.log('Starting invoice creation process...');
      
      // Read the file content
      const fileContent = await selectedFile.text();
      
      // Get the access token from local storage
      const accessToken = localStorage.getItem('xero_access_token');
      
      if (!accessToken) {
        console.error('No access token found');
        setError('You need to authenticate with Xero first');
        setIsLoading(false);
        
        // Redirect to auth page
        router.push('/auth');
        return;
      }
      
      // Call the API to create the invoice
      const response = await fetch('/api/xero/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createInvoice',
          accessToken,
          xmlContent: fileContent,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error creating invoice:', data.error);
        
        // Check if we need to re-authenticate
        if (response.status === 401 && data.requiresAuth) {
          console.log('Authentication required, redirecting to auth page');
          setError('Your Xero session has expired. Redirecting to authentication page...');
          
          // Clear the tokens
          localStorage.removeItem('xero_access_token');
          localStorage.removeItem('xero_refresh_token');
          localStorage.removeItem('xero_expires_at');
          
          // Redirect to auth page after a short delay
          setTimeout(() => {
            router.push('/auth');
          }, 2000);
          
          return;
        }
        
        // Handle specific network errors
        if (data.error.includes('Network Error') || data.error.includes('Failed to fetch')) {
          setError('Network error connecting to Xero. Please check your internet connection and try again.');
        } else {
          setError(data.error || 'Failed to create invoice');
        }
        
        setIsLoading(false);
        return;
      }
      
      console.log('Invoice created successfully:', data);
      
      // Set upload success and reset file input
      setUploadSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 dark:border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation and header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center text-blue-600 dark:text-purple-400 hover:text-blue-800 dark:hover:text-purple-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
        
        {/* Page header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Upload an XML file to create an invoice in Xero</p>
          </div>
        </div>
        
        {/* Authentication required */}
        {!isAuthenticated && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
                  <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V7m0 2h2m-2 0H9" />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Xero Authentication Required</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You need to connect to your Xero account before you can create invoices.
                </p>
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 dark:border-purple-400"></div>
                  </div>
                ) : authUrl ? (
                  <a 
                    href={authUrl}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900"
                    onClick={() => console.log('Connecting to Xero with URL:', authUrl)}
                  >
                    Connect to Xero
                  </a>
                ) : (
                  <p className="text-red-600 dark:text-red-400">
                    Unable to connect to Xero. Please try refreshing the page.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Upload form */}
        {isAuthenticated && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      XML File
                    </label>
                    <a 
                      href="/invoices/sample-invoice.xml" 
                      download
                      className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
                    >
                      Download Sample XML
                    </a>
                  </div>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg 
                        className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300" 
                        stroke="currentColor" 
                        fill="none" 
                        viewBox="0 0 48 48" 
                        aria-hidden="true"
                      >
                        <path 
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-300">
                        <label 
                          htmlFor="file-upload" 
                          className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-purple-300 hover:text-blue-500 dark:hover:text-purple-200 focus-within:outline-none"
                        >
                          <span>Upload an XML file</span>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            accept=".xml"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={isLoading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        XML files only, up to 10MB
                      </p>
                      
                      {selectedFile && (
                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-300">
                          Selected file: <span className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {uploadSuccess && (
                  <div className="mb-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-600 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700 dark:text-green-300">Invoice created successfully in Xero!</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900 dark:focus:ring-purple-400"
                    onClick={() => {
                      setError(null);
                      setUploadSuccess(false);
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-purple-400 dark:focus:ring-offset-gray-900"
                    disabled={!selectedFile && !fileInputRef.current?.files?.length || isLoading}
                    onClick={() => console.log('Submit button clicked')}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading to Xero...
                      </>
                    ) : 'Create Invoice in Xero'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
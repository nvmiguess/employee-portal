'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { processXlsxFile, generateCsv, CsvRow } from '@/lib/xlsx-converter';
import { useRouter } from 'next/navigation';
import { getAuthUrl } from '@/lib/xero';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function XeroUploadPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processedData, setProcessedData] = useState<CsvRow[] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
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

  // Get auth URL if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      const fetchAuthUrl = async () => {
        try {
          setIsProcessing(true);
          // Call our proxy API instead of the lib function
          const response = await fetch('/api/xero/proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'getAuthUrl',
              redirectUri: 'localhost:3000/xero-upload'  // Send without protocol
            }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to get authentication URL');
          }
          
          console.log('Received auth URL:', data.url);
          setAuthUrl(data.url);
        } catch (error) {
          console.error('Error getting auth URL:', error);
          setError('Failed to get authentication URL');
        } finally {
          setIsProcessing(false);
        }
      };
      
      fetchAuthUrl();
    }
  }, [isAuthenticated]);

  // Handle auth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if we have a code and state in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state) {
        try {
          setIsProcessing(true);
          setError(null);
          
          console.log('Handling auth callback with code and state:', { code, state });
          
          // Exchange code for tokens
          const response = await fetch('/api/xero/proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'exchangeCode',
              code,
              state
            }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error('Token exchange failed:', data);
            throw new Error(data.error || 'Failed to authenticate with Xero');
          }
          
          // Store tokens
          localStorage.setItem('xero_access_token', data.accessToken);
          localStorage.setItem('xero_refresh_token', data.refreshToken);
          localStorage.setItem('xero_expires_at', data.expiresAt.toString());
          
          // Update authentication state
          setIsAuthenticated(true);
          
          // Remove code and state from URL
          window.history.replaceState({}, '', window.location.pathname);
        } catch (error) {
          console.error('Error handling auth callback:', error);
          // Only show error if it's not a state parameter issue
          if (!error.message.includes('state parameter')) {
            setError(error instanceof Error ? error.message : 'Failed to authenticate with Xero');
          }
        } finally {
          setIsProcessing(false);
        }
      }
    };
    
    handleAuthCallback();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setSuccess(null);
    setIsProcessing(true);
    setProcessedData(null);

    try {
      const file = acceptedFiles[0];
      
      // Check file type
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        setError('Please upload an Excel file (.xlsx or .xls)');
        return;
      }

      // Process the file
      const result = await processXlsxFile(file);
      
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to process file');
        return;
      }

      setProcessedData(result.data);
      setSuccess('File processed successfully! Review the data below and click Send to Xero when ready.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!processedData) return;
    
    const csvContent = generateCsv(processedData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'SalesInvoice.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }, [processedData]);

  const handleXeroUpload = useCallback(async () => {
    if (!processedData) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Get the access token from local storage
      const accessToken = localStorage.getItem('xero_access_token');
      
      if (!accessToken) {
        console.error('No access token found');
        setError('You need to authenticate with Xero first');
        setIsUploading(false);
        
        // Redirect to auth page
        router.push('/auth');
        return;
      }

      const csvContent = generateCsv(processedData);
      
      // Call the API to create the invoice
      const response = await fetch('/api/xero/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createInvoice',
          accessToken,
          csvContent,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error creating invoices:', data.error);
        
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
          setError(data.error || 'Failed to create invoices');
        }
        
        return;
      }
      
      console.log('Invoices created successfully:', data);
      
      // Extract invoice numbers and any errors
      const successfulInvoices = data.invoices
        .filter((result: any) => !result.error)
        .map((result: any) => result.Invoices?.[0]?.InvoiceNumber)
        .filter(Boolean);
      
      const failedInvoices = data.invoices
        .filter((result: any) => result.error)
        .map((result: any) => `${result.invoiceNumber} (${result.error})`);
      
      let message = '';
      if (successfulInvoices.length > 0) {
        message += `Successfully created invoices: ${successfulInvoices.join(', ')}`;
      }
      if (failedInvoices.length > 0) {
        if (message) message += '\n';
        message += `Failed to create invoices: ${failedInvoices.join(', ')}`;
      }
      
      setSuccess(message);
      setProcessedData(null);
      
    } catch (err) {
      console.error('Error uploading to Xero:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload to Xero');
    } finally {
      setIsUploading(false);
    }
  }, [processedData, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 dark:border-purple-400"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation and header */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Main content */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h1 className="text-2xl font-bold text-gray-900">Upload to Xero</h1>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Authentication required */}
                {!isAuthenticated && (
                  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="text-center py-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V7m0 2h2m-2 0H9" />
                          </svg>
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Xero Authentication Required</h2>
                        <p className="text-gray-600 mb-4">
                          You need to connect to your Xero account before you can create invoices.
                        </p>
                        {isProcessing ? (
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                          </div>
                        ) : authUrl ? (
                          <a 
                            href={authUrl}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            onClick={() => console.log('Connecting to Xero with URL:', authUrl)}
                          >
                            Connect to Xero
                          </a>
                        ) : (
                          <p className="text-red-600">
                            Unable to connect to Xero. Please try refreshing the page.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status messages */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* File upload section */}
                {isAuthenticated && (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                    } cursor-pointer transition-colors`}
                  >
                    <input {...getInputProps()} />
                    <div className="space-y-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="text-gray-600">
                        {isProcessing ? (
                          <p>Processing file...</p>
                        ) : isDragActive ? (
                          <p>Drop the file here...</p>
                        ) : (
                          <div>
                            <p className="text-blue-600 hover:text-blue-500">Click to upload a file</p>
                            <p className="text-gray-500">or drag and drop</p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">XLSX, XLS up to 10MB</p>
                    </div>
                  </div>
                )}

                {/* Data preview */}
                {processedData && (
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Preview</h2>
                      <div className="flex space-x-4">
                        <button
                          onClick={handleDownload}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Download CSV
                        </button>
                        <button
                          onClick={handleXeroUpload}
                          disabled={isUploading}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading to Xero...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Send to Xero
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Number</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Type</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {processedData.map((row, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.ContactName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.InvoiceNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Reference}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.InvoiceDate}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.DueDate}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Description}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.UnitAmount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.TaxType}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { processXlsxFile, generateCsv, downloadCsv, CsvRow } from '@/lib/xlsx-converter';

export default function CsvConvertPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<CsvRow[] | null>(null);

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
      setSuccess('File processed successfully! Review the data below and click Download when ready.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!processedData) return;
    
    const csvContent = generateCsv(processedData);
    downloadCsv(csvContent);
  }, [processedData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  return (
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
            <h1 className="text-2xl font-bold text-gray-900">CSV Conversion Tool</h1>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
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

              {/* Data preview */}
              {processedData && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Preview</h2>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download CSV
                    </button>
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
  );
} 
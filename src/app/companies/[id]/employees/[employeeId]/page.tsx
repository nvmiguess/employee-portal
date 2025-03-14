'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RealtimeCompanyEmployeeProvider, useRealtimeCompanyEmployee } from '@/components/RealtimeCompanyEmployeeProvider';

export default function CompanyEmployeeDetailPage({ 
  params 
}: { 
  params: { id: string; employeeId: string } 
}) {
  const companyId = parseInt(params.id);
  const employeeId = parseInt(params.employeeId);

  return (
    <RealtimeCompanyEmployeeProvider companyId={companyId} employeeId={employeeId}>
      <EmployeeDetail companyId={companyId} employeeId={employeeId} />
    </RealtimeCompanyEmployeeProvider>
  );
}

const EmployeeDetail = ({ companyId, employeeId }) => {
  const { company, employee, companyLoading, employeeLoading, error } = useRealtimeCompanyEmployee();
  
  const loading = companyLoading || employeeLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !employee || !company) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link 
              href={`/companies/${companyId}`} 
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Back to {company ? company.name : 'Company'}</span>
            </Link>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading employee</h3>
                <p className="text-sm text-red-700 mt-1">{error || 'Employee not found'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format hire date for display
  const hireDate = new Date(employee.hire_date);
  const formattedHireDate = hireDate.toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation and header */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href={`/companies/${companyId}`} 
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to {company.name}</span>
          </Link>
          
          <Link 
            href={`/companies/${companyId}/employees/${employeeId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Employee
          </Link>
        </div>
        
        {/* Employee info card */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-xl font-medium text-blue-600">{employee.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                <p className="text-gray-500">{employee.email}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Employee Information</h2>
                <dl className="grid grid-cols-1 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Position</dt>
                    <dd className="mt-1 text-gray-900">{employee.position}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Department</dt>
                    <dd className="mt-1 text-gray-900">{employee.department}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                        {employee.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Hire Date</dt>
                    <dd className="mt-1 text-gray-900">{formattedHireDate}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Company Information</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-lg font-medium text-blue-600">{company.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link 
                          href={`/companies/${company.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {company.name}
                        </Link>
                      </h3>
                      {company.website && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {company.website}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  {company.description && (
                    <div className="mt-4 text-sm text-gray-600">
                      <p>{company.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
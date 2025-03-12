'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RealtimeEmployeeProvider, useRealtimeEmployee } from '@/components/RealtimeEmployeeProvider';

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  return (
    <RealtimeEmployeeProvider employeeId={id}>
      <EmployeeDetail />
    </RealtimeEmployeeProvider>
  );
}

const EmployeeDetail = () => {
  const { employee, loading, error } = useRealtimeEmployee();

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error || !employee) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/employees" className="text-blue-500 hover:underline">
            ← Back to Employees
          </Link>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-2">Error loading employee</h3>
          <p>{error || 'Employee not found'}</p>
        </div>
      </div>
    );
  }

  // Format hire date for display
  const hireDate = new Date(employee.hire_date);
  const formattedHireDate = hireDate.toLocaleDateString();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/employees" className="text-blue-500 hover:underline">
          ← Back to Employees
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{employee.name}</h1>
            <Link 
              href={`/employees/${employee.id}/edit`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Edit
            </Link>
          </div>
          <p className="text-gray-500 mt-1">{employee.email}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Employee Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-medium">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${
                    employee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                    {employee.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hire Date</p>
                  <p className="font-medium">{formattedHireDate}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Company</h2>
              {employee.company ? (
                <div>
                  <Link 
                    href={`/companies/${employee.company.id}`}
                    className="text-blue-500 hover:underline font-medium"
                  >
                    {employee.company.name}
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500">Not assigned to any company</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
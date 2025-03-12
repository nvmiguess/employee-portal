'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCompanyById, getEmployeesByCompanyId } from '../../../lib/database';

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyData = async () => {
    try {
      const companyData = await getCompanyById(parseInt(params.id));
      if (!companyData) {
        notFound();
      }
      setCompany(companyData);

      const employeesData = await getEmployeesByCompanyId(companyData.id);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching company data:', error);
      setError('Failed to load company data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [params.id]); // Refetch when the company ID changes

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/companies" className="text-blue-500 hover:underline">
          ← Back to Companies
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">{company.name}</h1>
        
        {company.description && (
          <p className="text-gray-600 mb-4">{company.description}</p>
        )}
        
        {company.website && (
          <p className="mb-4">
            <a 
              href={company.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {company.website}
            </a>
          </p>
        )}
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Employees</h2>
      
      {employees.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No employees found for this company.</p>
          <Link 
            href={`/employees/new?company=${company.id}`}
            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Employee
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link href={`/employees/${employee.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      View
                    </Link>
                    <Link href={`/employees/${employee.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <Link href={`/companies/${company.id}/edit`} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors">
          Edit Company
        </Link>
        <Link href={`/employees/new?company=${company.id}`} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Add Employee
        </Link>
      </div>
    </div>
  );
} 
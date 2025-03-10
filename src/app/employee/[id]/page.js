'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import employeesData from '../../data/employees';

export default function EmployeeDetail() {
  const params = useParams();
  const [employee, setEmployee] = useState(null);
  
  useEffect(() => {
    // Find the employee with the matching ID
    const employeeId = parseInt(params.id);
    const foundEmployee = employeesData.find(emp => emp.id === employeeId);
    setEmployee(foundEmployee);
  }, [params.id]);
  
  if (!employee) {
    return <div className="min-h-screen p-8">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen p-8">
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to Employee List
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">{employee.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Position</p>
            <p className="font-medium">{employee.position}</p>
          </div>
          
          <div>
            <p className="text-gray-500">Department</p>
            <p className="font-medium">{employee.department}</p>
          </div>
          
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{employee.email}</p>
          </div>
          
          <div>
            <p className="text-gray-500">Hire Date</p>
            <p className="font-medium">{employee.hireDate}</p>
          </div>
          
          <div>
            <p className="text-gray-500">Salary</p>
            <p className="font-medium">${employee.salary.toLocaleString()}</p>
          </div>
          
          <div>
            <p className="text-gray-500">Status</p>
            <p className={`font-medium ${employee.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
              {employee.status}
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <Link 
            href={`/edit-employee/${employee.id}`} 
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit Employee
          </Link>
        </div>
      </div>
    </div>
  );
} 
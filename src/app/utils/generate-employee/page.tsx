'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GenerateEmployeePage() {
  const [generatedData, setGeneratedData] = useState<any>(null);
  
  const generateRandomEmployee = () => {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    
    const data = {
      name: `Test Employee ${randomId}`,
      email: `employee${timestamp}@example.com`,
      position: ['Developer', 'Manager', 'Designer', 'Analyst'][Math.floor(Math.random() * 4)],
      department: ['Engineering', 'Marketing', 'Design', 'Operations'][Math.floor(Math.random() * 4)],
      status: ['Active', 'On Leave', 'Terminated'][Math.floor(Math.random() * 3)]
    };
    
    setGeneratedData(data);
  };
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Generate Test Employee Data</h1>
      
      <button
        onClick={generateRandomEmployee}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-6"
      >
        Generate Random Employee
      </button>
      
      {generatedData && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Generated Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(generatedData, null, 2)}
          </pre>
          <p className="mt-4 text-sm text-gray-600">
            Copy and paste these values into the employee form.
          </p>
        </div>
      )}
      
      <div className="mt-6">
        <Link 
          href="/employees/add" 
          className="text-blue-500 hover:underline"
        >
          Go to Add Employee Form
        </Link>
      </div>
    </div>
  );
} 
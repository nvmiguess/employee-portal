import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

// GET all employees
export async function GET() {
  try {
    const employees = await prisma.employee.findMany();
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching employees' }, { status: 500 });
  }
}

// POST new employee
export async function POST(request) {
  try {
    const data = await request.json();
    const employee = await prisma.employee.create({
      data: {
        ...data,
        salary: parseInt(data.salary)
      }
    });
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating employee' }, { status: 500 });
  }
} 
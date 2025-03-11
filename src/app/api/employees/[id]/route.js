import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

// GET single employee
export async function GET(request, { params }) {
  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: parseInt(params.id)
      }
    });
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching employee' }, { status: 500 });
  }
}

// PUT update employee
export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const employee = await prisma.employee.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        ...data,
        salary: parseInt(data.salary)
      }
    });
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating employee' }, { status: 500 });
  }
}

// DELETE employee
export async function DELETE(request, { params }) {
  try {
    await prisma.employee.delete({
      where: {
        id: parseInt(params.id)
      }
    });
    return NextResponse.json({ message: 'Employee deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting employee' }, { status: 500 });
  }
} 
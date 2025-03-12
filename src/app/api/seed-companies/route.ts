import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Check if companies already exist
    const existingCompanies = await prisma.company.findMany();
    
    if (existingCompanies.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Companies already exist', 
        companies: existingCompanies 
      });
    }
    
    // Create companies
    const companies = await prisma.company.createMany({
      data: [
        {
          name: "Cstar",
          description: "A leading technology company focused on innovation",
          website: "https://cstar.example.com"
        },
        {
          name: "DTAL",
          description: "Digital Transformation and Analytics Leader",
          website: "https://dtal.example.com"
        }
      ]
    });
    
    // Fetch the created companies
    const createdCompanies = await prisma.company.findMany();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Companies created successfully', 
      count: companies.count,
      companies: createdCompanies
    });
  } catch (error) {
    console.error('Error creating companies:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 
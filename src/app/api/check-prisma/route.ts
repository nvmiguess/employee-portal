import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if prisma module exists
    let prismaExists = false;
    
    try {
      // Try to dynamically import prisma
      await import('../../../lib/prisma');
      prismaExists = true;
    } catch (error) {
      console.error('Error importing prisma:', error);
    }
    
    return NextResponse.json({
      prismaExists,
      message: prismaExists 
        ? "Prisma module exists" 
        : "Prisma module does not exist - this is expected if you're using Supabase"
    });
  } catch (error) {
    console.error('Error checking prisma:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error checking prisma'
    }, { status: 500 });
  }
} 
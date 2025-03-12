import { NextResponse } from 'next/server';
import { supabase } from './supabase';

export async function GET() {
  try {
    // Check for environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set',
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
      DIRECT_URL: process.env.DIRECT_URL ? 'set' : 'not set',
    };
    
    // Check for available modules
    const modules = {
      supabase: typeof supabase !== 'undefined',
      prisma: false
    };
    
    try {
      // Try to import prisma
      const { prisma } = require('./prisma');
      modules.prisma = typeof prisma !== 'undefined';
    } catch (error) {
      console.log('Prisma module not available');
    }
    
    return NextResponse.json({
      environmentVariables: envVars,
      availableModules: modules
    });
  } catch (error) {
    console.error('Error checking data sources:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error checking data sources'
    }, { status: 500 });
  }
} 
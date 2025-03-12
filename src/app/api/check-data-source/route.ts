import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // Check Supabase connection
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    // Check for environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set',
    };
    
    // Try to get a count of companies
    const { count: companyCount, error: countError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    return NextResponse.json({
      supabaseConnected: !versionError,
      supabaseVersion: versionError ? null : versionData,
      environmentVariables: envVars,
      companyCount: countError ? null : companyCount,
      message: "Using Supabase as the data source"
    });
  } catch (error) {
    console.error('Error checking data source:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error checking data source'
    }, { status: 500 });
  }
} 
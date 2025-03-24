import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Check environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'not set',
      SUPABASE_URL: process.env.SUPABASE_URL || 'not set',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'set (length: ' + process.env.SUPABASE_ANON_KEY.length + ')' : 'not set',
    };
    
    // Check for .env files
    const rootDir = process.cwd();
    const envFiles = [
      '.env',
      '.env.local',
      '.env.development',
      '.env.development.local',
      '.env.production',
      '.env.production.local',
    ];
    
    const foundEnvFiles = {};
    
    for (const file of envFiles) {
      const filePath = path.join(rootDir, file);
      try {
        const exists = fs.existsSync(filePath);
        if (exists) {
          const content = fs.readFileSync(filePath, 'utf8');
          // Safely extract just the variable names without values
          const variables = content
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .map(line => {
              const parts = line.split('=');
              return parts[0].trim();
            });
          
          foundEnvFiles[file] = {
            exists,
            variables
          };
        } else {
          foundEnvFiles[file] = { exists };
        }
      } catch (error) {
        foundEnvFiles[file] = { 
          exists: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }
    
    // Check for mock data files
    const mockDataFiles = [
      'src/lib/mockData.ts',
      'src/lib/mockData.js',
      'src/data/mockData.ts',
      'src/data/mockData.js',
      'src/mocks/data.ts',
      'src/mocks/data.js',
    ];
    
    const foundMockFiles = {};
    
    for (const file of mockDataFiles) {
      const filePath = path.join(rootDir, file);
      try {
        const exists = fs.existsSync(filePath);
        foundMockFiles[file] = { exists };
        
        if (exists) {
          // Read the first 500 characters to get a preview
          const content = fs.readFileSync(filePath, 'utf8');
          const preview = content.substring(0, 500) + (content.length > 500 ? '...' : '');
          foundMockFiles[file].preview = preview;
        }
      } catch (error) {
        foundMockFiles[file] = { 
          exists: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }
    
    // Test direct Supabase connection
    let supabaseTest: {
      connectionError?: string;
      connected?: boolean;
      version?: any;
      companyError?: string;
      companyCount?: number;
      employeeError?: string;
      employeeCount?: number;
      error?: string;
    } = {};
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (supabaseUrl && supabaseKey) {
        const directSupabase = createClient(supabaseUrl, supabaseKey);
        
        // Test connection
        const { data: versionData, error: versionError } = await directSupabase.rpc('version');
        
        if (versionError) {
          supabaseTest.connectionError = versionError.message;
        } else {
          supabaseTest.connected = true;
          supabaseTest.version = versionData;
          
          // Get companies count
          const { count: companyCount, error: companyError } = await directSupabase
            .from('companies')
            .select('*', { count: 'exact', head: true });
          
          if (companyError) {
            supabaseTest.companyError = companyError.message;
          } else {
            supabaseTest.companyCount = companyCount;
          }
          
          // Get employees count
          const { count: employeeCount, error: employeeError } = await directSupabase
            .from('employees')
            .select('*', { count: 'exact', head: true });
          
          if (employeeError) {
            supabaseTest.employeeError = employeeError.message;
          } else {
            supabaseTest.employeeCount = employeeCount;
          }
        }
      } else {
        supabaseTest.error = 'Supabase credentials are missing';
      }
    } catch (error) {
      supabaseTest.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Check for Next.js cache
    let cacheInfo: {
      exists?: boolean;
      isDirectory?: boolean;
      size?: number;
      modified?: Date;
      subdirectories?: string[];
      error?: string;
    } = {};
    
    try {
      const cacheDir = path.join(rootDir, '.next/cache');
      const exists = fs.existsSync(cacheDir);
      
      if (exists) {
        const stats = fs.statSync(cacheDir);
        cacheInfo = {
          exists,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime
        };
        
        // List subdirectories
        const subdirs = fs.readdirSync(cacheDir);
        cacheInfo.subdirectories = subdirs;
      } else {
        cacheInfo = { exists };
      }
    } catch (error) {
      cacheInfo = { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
    
    return NextResponse.json({
      environmentVariables: envVars,
      envFiles: foundEnvFiles,
      mockDataFiles: foundMockFiles,
      supabaseTest,
      cacheInfo,
      processInfo: {
        cwd: process.cwd(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    });
  } catch (error) {
    console.error('Environment inspection error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error during environment inspection'
    }, { status: 500 });
  }
} 
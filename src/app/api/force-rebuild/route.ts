import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('Starting force rebuild process...');
    
    // Get the root directory
    const rootDir = process.cwd();
    
    // 1. Clear Next.js cache
    console.log('Clearing Next.js cache...');
    const nextCacheDir = path.join(rootDir, '.next/cache');
    
    if (fs.existsSync(nextCacheDir)) {
      try {
        fs.rmSync(nextCacheDir, { recursive: true, force: true });
        console.log('Next.js cache cleared successfully.');
      } catch (error) {
        console.error('Error clearing Next.js cache:', error);
      }
    } else {
      console.log('No Next.js cache directory found.');
    }
    
    // 2. Check environment variables
    console.log('Checking environment variables...');
    
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set (hidden)' : 'not set',
    };
    
    console.log('Current environment variables:', envVars);
    
    // 3. Load environment variables from .env files
    console.log('Loading environment variables from .env files...');
    
    const envFiles = [
      '.env',
      '.env.local',
    ];
    
    const loadedVars = {};
    
    for (const file of envFiles) {
      const filePath = path.join(rootDir, file);
      
      if (fs.existsSync(filePath)) {
        console.log(`Loading variables from ${file}...`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        for (const line of lines) {
          if (line.trim() && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();
            
            if (key && value) {
              const trimmedKey = key.trim();
              
              // Only log that we're setting it, not the actual value
              console.log(`Setting ${trimmedKey} from ${file}`);
              
              // Set the environment variable
              process.env[trimmedKey] = value;
              loadedVars[trimmedKey] = 'set (hidden)';
            }
          }
        }
      } else {
        console.log(`${file} not found.`);
      }
    }
    
    console.log('Loaded environment variables:', loadedVars);
    
    // 4. Create a direct Supabase client to test connection
    console.log('Testing Supabase connection...');
    
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are still missing after loading .env files');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      throw new Error(`Supabase connection failed: ${versionError.message}`);
    }
    
    console.log('Supabase connection successful:', versionData);
    
    // 5. Check for mock data files
    console.log('Checking for mock data files...');
    
    const mockDataPaths = [
      'src/lib/mockData.ts',
      'src/lib/mockData.js',
      'src/data/mockData.ts',
      'src/data/mockData.js',
      'src/mocks/data.ts',
      'src/mocks/data.js',
      'src/lib/data.ts',
      'src/lib/data.js',
    ];
    
    const foundMockFiles = [];
    
    for (const filePath of mockDataPaths) {
      const fullPath = path.join(rootDir, filePath);
      
      if (fs.existsSync(fullPath)) {
        foundMockFiles.push(filePath);
        
        // Read the file to check for mock employee data
        const content = fs.readFileSync(fullPath, 'utf8');
        
        if (content.includes('John Doe') || content.includes('Jane Smith')) {
          console.log(`Found mock employee data in ${filePath}`);
          
          // Rename the file to disable it
          const backupPath = `${fullPath}.bak`;
          fs.renameSync(fullPath, backupPath);
          console.log(`Renamed ${filePath} to ${filePath}.bak to disable it`);
        }
      }
    }
    
    if (foundMockFiles.length === 0) {
      console.log('No mock data files found.');
    } else {
      console.log('Found mock data files:', foundMockFiles);
    }
    
    // 6. Check for lib/data.ts or lib/data-source.ts
    console.log('Checking for data source files...');
    
    const dataSourcePaths = [
      'src/lib/data.ts',
      'src/lib/data-source.ts',
    ];
    
    for (const filePath of dataSourcePaths) {
      const fullPath = path.join(rootDir, filePath);
      
      if (fs.existsSync(fullPath)) {
        console.log(`Found data source file: ${filePath}`);
        
        // Read the file
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if it contains mock data or references to it
        if (content.includes('John Doe') || content.includes('Jane Smith') || 
            content.includes('mockData') || content.includes('mock data')) {
          console.log(`Found potential mock data references in ${filePath}`);
          
          // Create a backup
          const backupPath = `${fullPath}.bak`;
          fs.copyFileSync(fullPath, backupPath);
          console.log(`Created backup of ${filePath} at ${backupPath}`);
          
          // Update the file to ensure it uses Supabase
          let updatedContent = content;
          
          // Ensure DATA_SOURCE is set to 'supabase'
          updatedContent = updatedContent.replace(
            /const DATA_SOURCE = ['"].*['"]/,
            "const DATA_SOURCE = 'supabase'"
          );
          
          // Write the updated content
          fs.writeFileSync(fullPath, updatedContent);
          console.log(`Updated ${filePath} to ensure it uses Supabase`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Force rebuild completed successfully",
      details: {
        cacheCleared: fs.existsSync(nextCacheDir) ? false : true,
        envVarsLoaded: loadedVars,
        supabaseConnected: true,
        mockFilesFound: foundMockFiles,
      }
    });
  } catch (error) {
    console.error('Force rebuild error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during force rebuild'
    }, { status: 500 });
  }
} 
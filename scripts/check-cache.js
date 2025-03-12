const fs = require('fs');
const path = require('path');

function main() {
  console.log('Checking for cached data...');
  
  const rootDir = process.cwd();
  const nextCacheDir = path.join(rootDir, '.next/cache');
  
  if (!fs.existsSync(nextCacheDir)) {
    console.log('No Next.js cache directory found.');
    return;
  }
  
  console.log('Next.js cache directory found:', nextCacheDir);
  
  // Check for data cache
  const dataCacheDir = path.join(nextCacheDir, 'data');
  if (fs.existsSync(dataCacheDir)) {
    console.log('\nData cache directory found:', dataCacheDir);
    
    try {
      const files = fs.readdirSync(dataCacheDir);
      console.log(`Found ${files.length} files in data cache:`);
      
      for (const file of files) {
        const filePath = path.join(dataCacheDir, file);
        const stats = fs.statSync(filePath);
        
        console.log(`  ${file} (${stats.size} bytes, modified: ${stats.mtime})`);
        
        // Try to read the file content
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Check if it contains employee or company data
          if (content.includes('John Doe') || content.includes('Jane Smith') || 
              content.includes('employee') || content.includes('company')) {
            console.log('    Contains employee or company data!');
            
            // Print a preview
            const preview = content.substring(0, 200) + (content.length > 200 ? '...' : '');
            console.log(`    Preview: ${preview}`);
          }
        } catch (error) {
          console.log(`    Error reading file: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Error reading data cache directory:', error);
    }
  } else {
    console.log('No data cache directory found.');
  }
  
  // Check for fetch cache
  const fetchCacheDir = path.join(nextCacheDir, 'fetch-cache');
  if (fs.existsSync(fetchCacheDir)) {
    console.log('\nFetch cache directory found:', fetchCacheDir);
    
    try {
      const files = fs.readdirSync(fetchCacheDir);
      console.log(`Found ${files.length} files in fetch cache.`);
      
      // Look for files that might contain employee or company data
      for (const file of files) {
        const filePath = path.join(fetchCacheDir, file);
        const stats = fs.statSync(filePath);
        
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Check if it contains employee or company data
          if (content.includes('John Doe') || content.includes('Jane Smith') || 
              content.includes('employee') || content.includes('company')) {
            console.log(`  ${file} (${stats.size} bytes, modified: ${stats.mtime})`);
            console.log('    Contains employee or company data!');
            
            // Print a preview
            const preview = content.substring(0, 200) + (content.length > 200 ? '...' : '');
            console.log(`    Preview: ${preview}`);
          }
        } catch (error) {
          // Ignore binary files
        }
      }
    } catch (error) {
      console.error('Error reading fetch cache directory:', error);
    }
  } else {
    console.log('No fetch cache directory found.');
  }
}

main(); 
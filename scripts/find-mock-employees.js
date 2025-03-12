const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 SEARCHING FOR MOCK EMPLOYEE DATA SOURCES');
console.log('===========================================');

// First, let's try using grep for a faster search
try {
  console.log('\n📊 GREP SEARCH RESULTS:');
  console.log('---------------------');
  
  // Search for files containing both John Doe and Jane Smith
  const grepCommand = 'grep -r --include="*.{js,jsx,ts,tsx,json}" "John Doe" . --include-dir=src --include-dir=pages --include-dir=app --include-dir=components';
  const results = execSync(grepCommand, { encoding: 'utf8' });
  
  console.log(results);
} catch (error) {
  console.log('Grep search failed or found no results. Falling back to manual search.');
}

// Now let's do a more thorough manual search
console.log('\n📁 MANUAL FILE SEARCH:');
console.log('--------------------');

function searchDirectory(dir, depth = 0) {
  if (depth > 10) return []; // Prevent infinite recursion
  if (dir.includes('node_modules') || dir.includes('.git')) return [];
  
  const results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      
      try {
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          results.push(...searchDirectory(itemPath, depth + 1));
        } else if (stats.isFile()) {
          // Check file extension
          const ext = path.extname(itemPath).toLowerCase();
          if (['.js', '.jsx', '.ts', '.tsx', '.json'].includes(ext)) {
            try {
              const content = fs.readFileSync(itemPath, 'utf8');
              
              // Check if file contains both John Doe and Jane Smith
              if (content.includes('John Doe') && content.includes('Jane Smith')) {
                results.push({
                  file: itemPath,
                  size: stats.size,
                  modified: stats.mtime,
                  content: content.length > 500 ? content.substring(0, 500) + '...' : content
                });
              }
            } catch (error) {
              console.error(`Error reading file ${itemPath}:`, error.message);
            }
          }
        }
      } catch (error) {
        console.error(`Error accessing ${itemPath}:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return results;
}

const rootDir = process.cwd();
const results = searchDirectory(rootDir);

console.log(`Found ${results.length} files containing both "John Doe" and "Jane Smith":`);

for (const result of results) {
  console.log(`\n📄 FILE: ${result.file}`);
  console.log(`   Size: ${result.size} bytes`);
  console.log(`   Modified: ${result.modified}`);
  console.log('\n   CONTENT PREVIEW:');
  console.log('   ---------------');
  console.log(`   ${result.content.replace(/\n/g, '\n   ')}`);
  console.log('\n   ' + '='.repeat(50));
}

// Now let's check for Next.js cache files
console.log('\n💾 CHECKING NEXT.JS CACHE:');
console.log('------------------------');

const nextCacheDir = path.join(rootDir, '.next/cache');
if (fs.existsSync(nextCacheDir)) {
  console.log('Next.js cache directory found:', nextCacheDir);
  
  function searchCacheDirectory(dir) {
    const results = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        
        try {
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            results.push(...searchCacheDirectory(itemPath));
          } else if (stats.isFile()) {
            try {
              let content;
              try {
                content = fs.readFileSync(itemPath, 'utf8');
              } catch (error) {
                // Skip binary files
                continue;
              }
              
              // Check if file contains both John Doe and Jane Smith
              if (content.includes('John Doe') && content.includes('Jane Smith')) {
                results.push({
                  file: itemPath,
                  size: stats.size,
                  modified: stats.mtime,
                  content: content.length > 500 ? content.substring(0, 500) + '...' : content
                });
              }
            } catch (error) {
              // Skip files that can't be read
            }
          }
        } catch (error) {
          console.error(`Error accessing ${itemPath}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
    
    return results;
  }
  
  const cacheResults = searchCacheDirectory(nextCacheDir);
  
  console.log(`Found ${cacheResults.length} cache files containing both "John Doe" and "Jane Smith":`);
  
  for (const result of cacheResults) {
    console.log(`\n📄 CACHE FILE: ${result.file}`);
    console.log(`   Size: ${result.size} bytes`);
    console.log(`   Modified: ${result.modified}`);
    console.log('\n   CONTENT PREVIEW:');
    console.log('   ---------------');
    console.log(`   ${result.content.replace(/\n/g, '\n   ')}`);
    console.log('\n   ' + '='.repeat(50));
  }
} else {
  console.log('No Next.js cache directory found.');
}

// Let's also check for any mock data files
console.log('\n🧪 CHECKING FOR MOCK DATA FILES:');
console.log('------------------------------');

function findMockDataFiles(dir, depth = 0) {
  if (depth > 10) return []; // Prevent infinite recursion
  if (dir.includes('node_modules') || dir.includes('.git')) return [];
  
  const results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (item.toLowerCase().includes('mock') || 
          item.toLowerCase().includes('fake') || 
          item.toLowerCase().includes('test') || 
          item.toLowerCase().includes('sample') || 
          item.toLowerCase().includes('seed')) {
        
        const itemPath = path.join(dir, item);
        
        try {
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            results.push({
              type: 'directory',
              path: itemPath
            });
            results.push(...findMockDataFiles(itemPath, depth + 1));
          } else if (stats.isFile()) {
            results.push({
              type: 'file',
              path: itemPath,
              size: stats.size,
              modified: stats.mtime
            });
          }
        } catch (error) {
          console.error(`Error accessing ${itemPath}:`, error.message);
        }
      } else {
        const itemPath = path.join(dir, item);
        
        try {
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            results.push(...findMockDataFiles(itemPath, depth + 1));
          }
        } catch (error) {
          // Skip items that can't be accessed
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return results;
}

const mockDataFiles = findMockDataFiles(rootDir);

console.log(`Found ${mockDataFiles.length} potential mock data files or directories:`);

for (const item of mockDataFiles) {
  console.log(`\n${item.type === 'directory' ? '📁' : '📄'} ${item.path}`);
  
  if (item.type === 'file') {
    console.log(`   Size: ${item.size} bytes`);
    console.log(`   Modified: ${item.modified}`);
    
    // Check if file contains John Doe or Jane Smith
    try {
      const ext = path.extname(item.path).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.json'].includes(ext)) {
        const content = fs.readFileSync(item.path, 'utf8');
        
        if (content.includes('John Doe') || content.includes('Jane Smith')) {
          console.log('   ⚠️ CONTAINS MOCK EMPLOYEE DATA!');
          console.log('\n   CONTENT PREVIEW:');
          console.log('   ---------------');
          console.log(`   ${content.substring(0, 500).replace(/\n/g, '\n   ')}...`);
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
}

console.log('\n✅ SEARCH COMPLETE'); 
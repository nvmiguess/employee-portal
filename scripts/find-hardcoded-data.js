const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 SEARCHING FOR HARDCODED DATA');
console.log('==============================');

// Define the root directory
const rootDir = process.cwd();

// Define patterns to search for
const patterns = [
  'const employees = \\[',
  'const companies = \\[',
  'employees: \\[',
  'companies: \\[',
  'return \\[.*John Doe',
  'return \\[.*Jane Smith',
  'data\\: \\[.*John Doe',
  'data\\: \\[.*Jane Smith',
];

// Try using grep for each pattern
console.log('\n📊 GREP SEARCH RESULTS:');
console.log('---------------------');

for (const pattern of patterns) {
  try {
    console.log(`\nSearching for pattern: ${pattern}`);
    const grepCommand = `grep -r --include="*.{js,jsx,ts,tsx}" "${pattern}" . --include-dir=src --include-dir=pages --include-dir=app --include-dir=components`;
    const results = execSync(grepCommand, { encoding: 'utf8' });
    
    if (results.trim()) {
      console.log(results);
    } else {
      console.log('No results found.');
    }
  } catch (error) {
    // Grep returns non-zero exit code when no matches are found
    console.log('No results found.');
  }
}

// Check for specific files that might contain hardcoded data
console.log('\n📁 CHECKING SPECIFIC FILES:');
console.log('-------------------------');

const filesToCheck = [
  'src/lib/data.ts',
  'src/lib/data.js',
  'src/lib/data-source.ts',
  'src/lib/data-source.js',
  'src/app/api/employees/route.ts',
  'src/app/api/employees/route.js',
  'src/app/api/companies/route.ts',
  'src/app/api/companies/route.js',
  'src/app/page.tsx',
  'src/app/page.js',
  'src/app/employees/page.tsx',
  'src/app/employees/page.js',
  'src/app/companies/page.tsx',
  'src/app/companies/page.js',
];

for (const file of filesToCheck) {
  const filePath = path.join(rootDir, file);
  
  if (fs.existsSync(filePath)) {
    console.log(`\nChecking ${file}:`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for hardcoded data
      if (content.includes('John Doe') || content.includes('Jane Smith')) {
        console.log('⚠️ CONTAINS HARDCODED EMPLOYEE DATA!');
        
        // Find the relevant lines
        const lines = content.split('\n');
        const relevantLines = [];
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('John Doe') || lines[i].includes('Jane Smith')) {
            // Get a few lines before and after for context
            const startLine = Math.max(0, i - 5);
            const endLine = Math.min(lines.length - 1, i + 5);
            
            for (let j = startLine; j <= endLine; j++) {
              relevantLines.push(`${j + 1}: ${lines[j]}`);
            }
            
            relevantLines.push('---');
            i = endLine; // Skip ahead
          }
        }
        
        if (relevantLines.length > 0) {
          console.log('Relevant code sections:');
          console.log(relevantLines.join('\n'));
        }
      } else {
        console.log('No hardcoded employee data found.');
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }
}

console.log('\n✅ SEARCH COMPLETE'); 
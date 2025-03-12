const fs = require('fs');
const path = require('path');

// Define patterns to search for
const patterns = [
  'mockData',
  'mock data',
  'fake data',
  'test data',
  'sample data',
  'John Doe',
  'Jane Smith',
  'insert\\(',
  'seed',
  'createClient'
];

// Define directories to search
const searchDirs = [
  'src',
  'pages',
  'app',
  'lib',
  'utils',
  'components'
];

// Define file extensions to search
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Function to search for patterns in a file
function searchFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        // Get the line number
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        // Get the line content
        const lines = content.split('\n');
        const line = lines[lineNumber - 1].trim();
        
        matches.push({
          pattern,
          lineNumber,
          line
        });
      }
    }
    
    if (matches.length > 0) {
      return {
        file: filePath,
        matches
      };
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
  
  return null;
}

// Function to recursively search directories
function searchDirectory(dir) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Skip node_modules and .next directories
        if (item !== 'node_modules' && item !== '.next') {
          results.push(...searchDirectory(itemPath));
        }
      } else if (stats.isFile() && extensions.includes(path.extname(itemPath))) {
        const result = searchFile(itemPath);
        if (result) {
          results.push(result);
        }
      }
    }
  } catch (error) {
    console.error(`Error searching directory ${dir}:`, error);
  }
  
  return results;
}

// Main function
function main() {
  console.log('Searching for mock data in codebase...');
  
  const rootDir = process.cwd();
  let results = [];
  
  for (const dir of searchDirs) {
    const dirPath = path.join(rootDir, dir);
    
    if (fs.existsSync(dirPath)) {
      results.push(...searchDirectory(dirPath));
    }
  }
  
  console.log(`Found ${results.length} files with potential mock data:`);
  
  for (const result of results) {
    console.log(`\nFile: ${result.file}`);
    console.log('Matches:');
    
    for (const match of result.matches) {
      console.log(`  Line ${match.lineNumber} (${match.pattern}): ${match.line}`);
    }
  }
}

main(); 
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 CLEARING NEXT.JS CACHE');
console.log('========================');

const rootDir = process.cwd();
const nextCacheDir = path.join(rootDir, '.next/cache');

if (fs.existsSync(nextCacheDir)) {
  console.log(`Found Next.js cache directory: ${nextCacheDir}`);
  
  try {
    // List cache contents before deletion
    console.log('\nCache contents before clearing:');
    const lsBeforeCommand = `ls -la ${nextCacheDir}`;
    console.log(execSync(lsBeforeCommand, { encoding: 'utf8' }));
    
    // Remove the cache directory
    console.log('\nRemoving cache directory...');
    const rmCommand = `rm -rf ${nextCacheDir}`;
    execSync(rmCommand);
    
    console.log('Cache directory removed successfully.');
    
    // Check if it's really gone
    if (!fs.existsSync(nextCacheDir)) {
      console.log('Verified: Cache directory no longer exists.');
    } else {
      console.log('Warning: Cache directory still exists after removal attempt.');
    }
  } catch (error) {
    console.error('Error clearing cache:', error.message);
  }
} else {
  console.log('No Next.js cache directory found.');
}

// Also try to clear the build cache
console.log('\n🧹 CLEARING NEXT.JS BUILD');
console.log('=========================');

try {
  console.log('Running next clean...');
  execSync('npx next clean', { stdio: 'inherit' });
  console.log('Next.js build cleaned successfully.');
} catch (error) {
  console.error('Error running next clean:', error.message);
}

console.log('\n✅ CACHE CLEARING COMPLETE'); 
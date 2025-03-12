// This script searches for any mock data in your codebase
// Run with: node scripts/find-all-mock-data.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== SEARCHING FOR MOCK DATA ===');

// Try using grep to find mock data
try {
  console.log('\nSearching for "mock" or "fake" data:');
  const grepCommand = 'grep -r --include="*.{js,jsx,ts,tsx}" -E "mock|fake|dummy|sample|test data" src';
  const results = execSync(grepCommand, { encoding: 'utf8' });
  console.log(results || 'No results found');
} catch (error) {
  console.log('No results found or grep error');
}

// Search for hardcoded employee data
try {
  console.log('\nSearching for hardcoded employee data:');
  const grepCommand = 'grep -r --include="*.{js,jsx,ts,tsx}" -E "John Doe|Jane Smith|Alice|Bob|name: .{1,30}," src';
  const results = execSync(grepCommand, { encoding: 'utf8' });
  console.log(results || 'No results found');
} catch (error) {
  console.log('No results found or grep error');
}

// Search for hardcoded company data
try {
  console.log('\nSearching for hardcoded company data:');
  const grepCommand = 'grep -r --include="*.{js,jsx,ts,tsx}" -E "Acme|Globex|Stark|Company A|Company B" src';
  const results = execSync(grepCommand, { encoding: 'utf8' });
  console.log(results || 'No results found');
} catch (error) {
  console.log('No results found or grep error');
}

// Search for any data arrays
try {
  console.log('\nSearching for data arrays:');
  const grepCommand = 'grep -r --include="*.{js,jsx,ts,tsx}" -E "const .{1,30} = \\[|data: \\[|return \\[" src';
  const results = execSync(grepCommand, { encoding: 'utf8' });
  console.log(results || 'No results found');
} catch (error) {
  console.log('No results found or grep error');
}

console.log('\n=== SEARCH COMPLETE ==='); 
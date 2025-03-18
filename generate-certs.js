const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create certs directory if it doesn't exist
const certsDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

console.log('Installing mkcert...');
try {
  execSync('npm install -g mkcert', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to install mkcert globally. Trying local installation...');
  execSync('npm install mkcert', { stdio: 'inherit' });
}

console.log('Generating certificates...');
try {
  // Change to the certs directory
  process.chdir(certsDir);
  
  // Create CA
  execSync('npx mkcert create-ca', { stdio: 'inherit' });
  
  // Create certificate for localhost
  execSync('npx mkcert create-cert --domains localhost', { stdio: 'inherit' });
  
  console.log('SSL certificates generated successfully in the certs directory.');
  console.log('You can now run "npm run dev" to start the HTTPS server.');
} catch (error) {
  console.error('Error generating certificates:', error);
  process.exit(1);
} 
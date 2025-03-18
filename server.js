const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Enable more detailed logging
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Path to SSL certificates
const certsDir = path.join(__dirname, 'certs');

// Check if certificates exist
try {
  const keyPath = path.join(certsDir, 'cert.key');
  const certPath = path.join(certsDir, 'cert.crt');
  
  if (!fs.existsSync(keyPath)) {
    console.error(`SSL key file not found: ${keyPath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(certPath)) {
    console.error(`SSL certificate file not found: ${certPath}`);
    process.exit(1);
  }
  
  console.log('SSL certificates found:', { keyPath, certPath });
} catch (error) {
  console.error('Error checking SSL certificates:', error);
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(path.join(certsDir, 'cert.key')),
  cert: fs.readFileSync(path.join(certsDir, 'cert.crt')),
};

const PORT = process.env.PORT || 3000;

app.prepare()
  .then(() => {
    console.log('Next.js app prepared, creating HTTPS server...');
    
    const server = createServer(httpsOptions, (req, res) => {
      try {
        // Log incoming requests
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
    
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
    
    server.listen(PORT, (err) => {
      if (err) {
        console.error('Error starting server:', err);
        throw err;
      }
      console.log(`> Ready on https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error preparing Next.js app:', err);
    process.exit(1);
  }); 
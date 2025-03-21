const fs = require('fs');
const https = require('https');
const next = require('next');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

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

const PORT = process.env.PORT || 3000;

// Log environment variables for debugging
console.log('Environment variables:', {
  XERO_CLIENT_ID: process.env.XERO_CLIENT_ID ? 'set' : 'not set',
  XERO_CLIENT_SECRET: process.env.XERO_CLIENT_SECRET ? 'set' : 'not set',
  NEXT_PUBLIC_XERO_REDIRECT_URI: process.env.NEXT_PUBLIC_XERO_REDIRECT_URI
});

// Check for SSL certificates
const sslConfig = {
  keyPath: path.join(process.cwd(), 'certs', 'cert.key'),
  certPath: path.join(process.cwd(), 'certs', 'cert.crt')
};

console.log('SSL certificates found:', sslConfig);

app.prepare()
  .then(() => {
    const httpsOptions = {
      key: fs.readFileSync(sslConfig.keyPath),
      cert: fs.readFileSync(sslConfig.certPath)
    };

    console.log('Next.js app prepared, creating HTTPS server...');

    https.createServer(httpsOptions, (req, res) => {
      try {
        // Log incoming requests
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        
        handle(req, res);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Ready on https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error preparing Next.js app:', err);
    process.exit(1);
  }); 
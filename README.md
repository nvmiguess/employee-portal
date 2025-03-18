# Employee Portal with Xero Integration

This application provides an employee portal with Xero invoice integration capabilities.

## Setup HTTPS for Local Development

To use the Xero OAuth integration, you need to run the application with HTTPS. Follow these steps:

### 1. Generate SSL Certificates

Run the following command to generate SSL certificates for local development:

```bash
npm run generate-certs
```

This will:
- Install mkcert (if not already installed)
- Create a local Certificate Authority (CA)
- Generate SSL certificates for localhost
- Store the certificates in the `certs` directory

### 2. Trust the Local CA (Optional but Recommended)

After generating certificates, you may need to trust the local CA on your system to avoid browser warnings.

For macOS:
```bash
cd certs
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain rootCA.crt
```

For Windows:
```bash
certutil -addstore -f "ROOT" certs\rootCA.crt
```

For Linux:
```bash
sudo cp certs/rootCA.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at https://localhost:3000

## Xero Integration

### Configuration

The Xero integration is configured with the following settings:

- Redirect URI: `https://localhost:3000/callback`
- Required Scopes: `openid profile email accounting.transactions accounting.settings offline_access`

### Important Notes

1. Make sure your Xero Developer application has the exact same redirect URI configured.
2. The application must be accessed via HTTPS for the OAuth flow to work correctly.
3. If you encounter certificate warnings in your browser, you may need to trust the local CA as described above.

## Features

- Employee dashboard with quick links
- Dark mode support
- Invoice creation from XML files
- Xero integration for invoice management

## Development

- `npm run dev` - Start the development server with HTTPS
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run linting checks
- `npm run generate-certs` - Generate SSL certificates for local development 
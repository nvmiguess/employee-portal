import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { parse as parseDate, format } from 'date-fns';
import fetch from 'node-fetch';

// Specify Node.js runtime
export const runtime = 'nodejs';

// Xero API configuration - using existing environment variables
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID;
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET;
const XERO_REDIRECT_URI = process.env.NEXT_PUBLIC_XERO_REDIRECT_URI || 'https://localhost:3000/xero-upload/callback';
const XERO_TENANT_ID = process.env.XERO_TENANT_ID;

// Xero API endpoints
const XERO_AUTH_URL = 'https://login.xero.com/identity/connect/authorize';
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';
const XERO_CONNECTIONS_URL = 'https://api.xero.com/connections';
const XERO_INVOICES_URL = 'https://api.xero.com/api.xro/2.0/Invoices';

// Type definitions for Xero invoice
interface XeroLineItem {
  Description: string;
  Quantity: number;
  UnitAmount: number;
  TaxType: string;
  AccountCode: string;
}

interface XeroInvoice {
  Type: string;
  Contact: {
    Name: string;
  };
  Date: string;
  DueDate: string;
  LineItems: XeroLineItem[];
  Reference: string;
  Status: string;
  LineAmountTypes: string;
  InvoiceNumber?: string;
}

// Helper function to convert date from dd/MM/yyyy to yyyy-MM-dd
function convertDateFormat(dateStr: string): string {
  try {
    // Parse the date assuming it's in dd/MM/yyyy format
    const date = parseDate(dateStr, 'dd/MM/yyyy', new Date());
    // Format the date in yyyy-MM-dd format
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error converting date format:', error);
    throw new Error(`Invalid date format: ${dateStr}. Expected format: dd/MM/yyyy`);
  }
}

// Helper function to map tax types
function mapTaxType(taxType: string): string {
  switch (taxType) {
    case 'GST On Income':
      return 'OUTPUT';
    case 'GST Free Income':
      return 'EXEMPTOUTPUT';
    default:
      return taxType || 'OUTPUT';
  }
}

// Helper function to parse CSV to invoice data
async function parseCsvToInvoiceData(csvContent: string) {
  try {
    console.log('Parsing CSV content...');
    
    // Parse CSV content
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    if (!records || records.length === 0) {
      throw new Error('No valid records found in CSV');
    }
    
    console.log('Parsed CSV records:', records);
    
    // Group line items by invoice
    const invoiceGroups = new Map();
    
    records.forEach((record: any) => {
      // Skip records with empty contact name
      if (!record.ContactName) {
        console.log('Skipping record with empty contact name:', record);
        return;
      }

      const key = `${record.ContactName}-${record.InvoiceNumber}`;
      if (!invoiceGroups.has(key)) {
        // Convert dates to yyyy-MM-dd format
        const invoiceDate = convertDateFormat(record.InvoiceDate);
        const dueDate = convertDateFormat(record.DueDate);
        
        invoiceGroups.set(key, {
          contact: { name: record.ContactName },
          invoiceNumber: record.InvoiceNumber,
          reference: record.Reference,
          date: invoiceDate,
          dueDate: dueDate,
          lineItems: []
        });
      }
      
      invoiceGroups.get(key).lineItems.push({
        Description: record.Description,
        Quantity: parseFloat(record.Quantity) || 1,
        UnitAmount: parseFloat(record.UnitAmount) || 0,
        TaxType: mapTaxType(record.TaxType),
        AccountCode: record.AccountCode
      });
    });
    
    // Convert all invoice groups to Xero format
    const invoices = Array.from(invoiceGroups.values()).map(invoice => ({
      type: 'ACCREC',
      contact: invoice.contact,
      date: invoice.date,
      dueDate: invoice.dueDate,
      lineItems: invoice.lineItems,
      reference: invoice.reference,
      invoiceNumber: invoice.invoiceNumber,
      status: 'DRAFT'
    }));

    return invoices;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to get Xero authorization URL
function getAuthorizationUrl(redirectUri?: string) {
  if (!XERO_CLIENT_ID) {
    throw new Error('XERO_CLIENT_ID environment variable is not set');
  }
  
  // Define scopes explicitly
  const scopes = [
    'openid',
    'profile',
    'email',
    'accounting.transactions',
    'accounting.settings',
    'offline_access'
  ];
  
  const state = Math.random().toString(36).substring(2, 15);
  
  // Use the provided redirect URI or fall back to the default
  const finalRedirectUri = redirectUri || XERO_REDIRECT_URI;
  
  console.log('Generating auth URL with params:', {
    clientId: XERO_CLIENT_ID.substring(0, 5) + '...',
    redirectUri: finalRedirectUri,
    scopes: scopes,
    state: state
  });

  // Build the authorization URL with properly encoded parameters
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: XERO_CLIENT_ID,
    redirect_uri: finalRedirectUri,
    scope: scopes.join(' '),
    state: state
  });
  
  const authUrl = `${XERO_AUTH_URL}?${params.toString()}`;
  console.log('Generated auth URL:', authUrl);
  
  return { url: authUrl, state };
}

// Helper function to test credential encoding
function testCredentialEncoding(clientId: string, clientSecret: string): string {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
  console.log('Credential test:', {
    input: {
      clientId: clientId.substring(0, 5) + '...',
      clientSecret: clientSecret.substring(0, 5) + '...',
      raw: `${clientId.substring(0, 5)}...:${clientSecret.substring(0, 5)}...`
    },
    output: credentials.substring(0, 10) + '...'
  });
  return credentials;
}

// Helper function to exchange authorization code for tokens
async function exchangeCodeForTokens(code: string, state: string, redirectUri: string) {
  console.log('Exchanging authorization code for tokens...', {
    code: code.substring(0, 5) + '...',
    state,
    redirectUri
  });
  
  if (!XERO_CLIENT_ID || !XERO_CLIENT_SECRET) {
    throw new Error('Xero API credentials are not configured');
  }
  
  try {
    console.log('Sending token exchange request to:', XERO_TOKEN_URL);
    
    // Ensure redirect URI uses HTTPS
    const secureRedirectUri = redirectUri.replace('http://', 'https://');
    
    // Create Basic Auth header with proper encoding
    const credentials = Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64');
    
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('redirect_uri', secureRedirectUri);
    
    // Log the exact request being sent (with sensitive data masked)
    console.log('Request details:', {
      url: XERO_TOKEN_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials.substring(0, 10)}...`
      },
      formData: {
        grant_type: 'authorization_code',
        code: code.substring(0, 5) + '...',
        redirect_uri: secureRedirectUri
      },
      clientIdLength: XERO_CLIENT_ID.length,
      clientSecretLength: XERO_CLIENT_SECRET.length,
      credentialsLength: credentials.length
    });
    
    const response = await fetch(XERO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    
    if (!response.ok) {
      const data = await response.json();
      console.error('Token exchange error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        error_description: data.error_description,
        requestParams: {
          redirect_uri: secureRedirectUri,
          grant_type: 'authorization_code'
        },
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseBody: data
      });
      
      let errorMessage = 'Failed to exchange authorization code';
      if (data.error === 'invalid_client') {
        errorMessage = 'Invalid client credentials. Please check your Xero app settings.';
      } else if (data.error === 'invalid_grant') {
        errorMessage = 'Invalid or expired authorization code.';
      } else if (data.error_description) {
        errorMessage = data.error_description;
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Successfully exchanged code for tokens');
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
}

// Helper function to refresh access token
async function refreshAccessToken(refreshToken: string) {
  console.log('Refreshing access token...');
  
  if (!XERO_CLIENT_ID || !XERO_CLIENT_SECRET) {
    throw new Error('Xero API credentials are not configured');
  }
  
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);
  
  const response = await fetch(XERO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64')}`
    },
    body: params.toString()
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('Error refreshing token:', data);
    throw new Error(data.error_description || 'Failed to refresh token');
  }
  
  console.log('Successfully refreshed access token');
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000
  };
}

// Helper function to create invoices in Xero
async function createInvoices(accessToken: string, invoicesData: any[]) {
  console.log('Creating invoices in Xero with data:', JSON.stringify(invoicesData, null, 2));
  
  // Get the tenant ID from the connections API
  console.log('Fetching Xero tenants...');
  let tenantId;
  
  try {
    const connectionsResponse = await fetch(XERO_CONNECTIONS_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!connectionsResponse.ok) {
      // Check if the error is due to an expired token
      if (connectionsResponse.status === 401) {
        throw new Error('TokenExpired: Your Xero session has expired. Please re-authenticate.');
      }
      throw new Error(`Failed to fetch Xero tenants: ${connectionsResponse.status} ${connectionsResponse.statusText}`);
    }
    
    const connections = await connectionsResponse.json();
    
    if (!connections || connections.length === 0) {
      throw new Error('No connected Xero organizations found. Please reconnect to Xero.');
    }
    
    // Use the first tenant
    tenantId = connections[0].tenantId;
    console.log(`Using Xero tenant: ${connections[0].tenantName} (${tenantId})`);
  } catch (error) {
    console.error('Error fetching Xero tenants:', error);
    throw error;
  }
  
  // Process each invoice
  const results = [];
  for (const invoiceData of invoicesData) {
    try {
      // Prepare the Xero invoice object
      const xeroInvoice: XeroInvoice = {
        Type: invoiceData.type.toUpperCase(),
        Contact: {
          Name: invoiceData.contact.name
        },
        Date: invoiceData.date,
        DueDate: invoiceData.dueDate,
        LineItems: invoiceData.lineItems,
        Reference: invoiceData.reference,
        Status: invoiceData.status,
        LineAmountTypes: "Exclusive"
      };
      
      // Add invoice number if provided
      if (invoiceData.invoiceNumber) {
        xeroInvoice.InvoiceNumber = invoiceData.invoiceNumber;
      }
      
      // Create the request body
      const requestBody = {
        Invoices: [xeroInvoice]
      };
      
      console.log('Sending request to Xero API with body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(XERO_INVOICES_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Xero-Tenant-Id': tenantId,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `Error from Xero API: ${response.status} ${response.statusText}`;
        
        try {
          // Try to get more detailed error information
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('Xero API error response:', errorData);
            
            if (errorData.Elements && errorData.Elements[0] && errorData.Elements[0].ValidationErrors) {
              const validationErrors = errorData.Elements[0].ValidationErrors;
              errorMessage = validationErrors.map((err: any) => err.Message).join(', ');
            } else if (errorData.Detail) {
              errorMessage = errorData.Detail;
            } else if (errorData.Message) {
              errorMessage = errorData.Message;
            }
          } else {
            // If not JSON, get the text response
            const textResponse = await response.text();
            console.error('Non-JSON error response:', textResponse);
            errorMessage += ` - ${textResponse.substring(0, 200)}...`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      // Now we know the response is OK and should be JSON
      const data = await response.json();
      console.log('Invoice created successfully:', data);
      results.push(data);
    } catch (error) {
      console.error(`Error creating invoice ${invoiceData.invoiceNumber}:`, error);
      results.push({ error: error instanceof Error ? error.message : 'Unknown error', invoiceNumber: invoiceData.invoiceNumber });
    }
  }
  
  return results;
}

// Helper function to get connected tenants
async function getConnectedTenants(accessToken: string) {
  console.log('Fetching connected tenants...');
  
  const response = await fetch(XERO_CONNECTIONS_URL, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error fetching tenants:', error);
    throw new Error(`Failed to fetch tenants: ${error}`);
  }

  const tenants = await response.json();
  console.log('Found tenants:', tenants);

  return tenants.map((tenant: any) => ({
    tenantId: tenant.tenantId,
    tenantName: tenant.tenantName
  }));
}

// Main API route handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    console.log(`Processing ${action} request`);
    
    // Handle different actions
    switch (action) {
      case 'getAuthUrl':
        try {
          const { redirectUri } = body;
          const { url, state } = await getAuthorizationUrl(redirectUri);
          return NextResponse.json({ url, state });
        } catch (error) {
          console.error('Error getting auth URL:', error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get auth URL' },
            { status: 500 }
          );
        }
        
      case 'exchangeCode':
        // Exchange authorization code for tokens
        try {
          const { code, state, redirectUri } = body;
          if (!code || !state || !redirectUri) {
            return NextResponse.json({ error: 'Authorization code, state, and redirect URI are required' }, { status: 400 });
          }
          
          const tokens = await exchangeCodeForTokens(code, state, redirectUri);
          return NextResponse.json(tokens);
        } catch (error) {
          console.error('Error exchanging code:', error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to exchange authorization code' },
            { status: 500 }
          );
        }
        
      case 'refreshToken':
        // Refresh access token
        try {
          const { refreshToken } = body;
          if (!refreshToken) {
            return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
          }
          
          const tokens = await refreshAccessToken(refreshToken);
          return NextResponse.json(tokens);
        } catch (error) {
          console.error('Error refreshing token:', error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to refresh token' },
            { status: 500 }
          );
        }
        
      case 'createInvoice':
        // Create invoice in Xero
        try {
          const { accessToken, csvContent } = body;
          
          if (!accessToken) {
            return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
          }
          
          if (!csvContent) {
            return NextResponse.json({ error: 'CSV content is required' }, { status: 400 });
          }
          
          // Parse CSV to invoice data
          const invoicesData = await parseCsvToInvoiceData(csvContent);
          
          // Create invoices in Xero
          const results = await createInvoices(accessToken, invoicesData);
          
          return NextResponse.json({ success: true, invoices: results });
        } catch (error) {
          console.error('Error creating invoices:', error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create invoices in Xero' },
            { status: 500 }
          );
        }
        
      case 'getTenants':
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
        }
        const accessToken = authHeader.replace('Bearer ', '');
        const tenants = await getConnectedTenants(accessToken);
        return NextResponse.json({ tenants });
        
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 
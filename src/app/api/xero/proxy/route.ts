import { NextRequest, NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

// Xero API configuration - using existing environment variables
const XERO_CLIENT_ID = process.env.NEXT_PUBLIC_XERO_CLIENT_ID;
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET;
const XERO_REDIRECT_URI = process.env.NEXT_PUBLIC_XERO_REDIRECT_URI || 'https://localhost:3000/callback';
const XERO_TENANT_ID = process.env.XERO_TENANT_ID;

// Xero API endpoints
const XERO_AUTH_URL = 'https://login.xero.com/identity/connect/authorize';
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';
const XERO_CONNECTIONS_URL = 'https://api.xero.com/connections';
const XERO_INVOICES_URL = 'https://api.xero.com/api.xro/2.0/Invoices';

// Helper function to parse XML to invoice data
async function parseXmlToInvoiceData(xmlContent: string) {
  try {
    console.log('Parsing XML content...');
    const result = await parseStringPromise(xmlContent, { explicitArray: false });
    console.log('Raw XML parsing result:', JSON.stringify(result, null, 2));
    
    // Extract invoice data from the parsed XML
    const invoice = result.Invoice;
    if (!invoice) {
      throw new Error('Invalid XML format: No Invoice element found');
    }
    
    // Extract contact information
    const contactName = invoice.Contact?.Name || invoice.Contact?.n || '';
    if (!contactName) {
      console.warn('Warning: No contact name found in XML');
    }
    
    console.log('Extracted contact name:', contactName);
    
    // Extract line items
    const lineItems = Array.isArray(invoice.LineItems?.LineItem) 
      ? invoice.LineItems.LineItem 
      : (invoice.LineItems?.LineItem ? [invoice.LineItems.LineItem] : []);
    
    console.log(`Found ${lineItems.length} line items in XML`);
    
    // Map line items to Xero format
    const mappedLineItems = lineItems.map((item: any, index: number) => {
      console.log(`Processing line item ${index + 1}:`, JSON.stringify(item, null, 2));
      
      return {
        Description: item.Description || `Item ${index + 1}`,
        Quantity: parseFloat(item.Quantity) || 1,
        UnitAmount: parseFloat(item.UnitAmount) || 0,
        AccountCode: item.AccountCode || "200",
        TaxType: item.TaxType || "NONE"
      };
    });
    
    return {
      type: invoice.Type || 'ACCREC',
      contact: {
        name: contactName
      },
      date: invoice.Date || new Date().toISOString().split('T')[0],
      dueDate: invoice.DueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: mappedLineItems,
      reference: invoice.Reference || `INV-${Date.now()}`,
      status: invoice.Status || 'DRAFT'
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    throw new Error(`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to get Xero authorization URL
function getAuthorizationUrl() {
  if (!XERO_CLIENT_ID) {
    throw new Error('NEXT_PUBLIC_XERO_CLIENT_ID environment variable is not set');
  }
  
  const scopes = encodeURIComponent('openid profile email accounting.transactions accounting.contacts offline_access');
  const state = encodeURIComponent(Math.random().toString(36).substring(2, 15));
  
  return `${XERO_AUTH_URL}?response_type=code&client_id=${XERO_CLIENT_ID}&redirect_uri=${encodeURIComponent(XERO_REDIRECT_URI)}&scope=${scopes}&state=${state}`;
}

// Helper function to exchange authorization code for tokens
async function exchangeCodeForTokens(code: string) {
  console.log('Exchanging authorization code for tokens...');
  
  if (!XERO_CLIENT_ID || !XERO_CLIENT_SECRET) {
    throw new Error('Xero API credentials are not configured');
  }
  
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', XERO_REDIRECT_URI);
  
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
    console.error('Error exchanging code for tokens:', data);
    throw new Error(data.error_description || 'Failed to exchange authorization code');
  }
  
  console.log('Successfully exchanged code for tokens');
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000
  };
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

// Helper function to create an invoice in Xero
async function createInvoice(accessToken: string, invoiceData: any) {
  console.log('Creating invoice in Xero with data:', JSON.stringify(invoiceData, null, 2));
  
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
  
  // Prepare the Xero invoice object
  const xeroInvoice = {
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
  
  // Create the request body
  const requestBody = {
    Invoices: [xeroInvoice]
  };
  
  console.log('Sending request to Xero API with body:', JSON.stringify(requestBody, null, 2));
  
  try {
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
    return data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
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
        // Get Xero authorization URL
        try {
          const authUrl = getAuthorizationUrl();
          console.log('Generated auth URL:', authUrl);
          return NextResponse.json({ url: authUrl });
        } catch (error) {
          console.error('Error generating auth URL:', error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate authorization URL' },
            { status: 500 }
          );
        }
        
      case 'exchangeCode':
        // Exchange authorization code for tokens
        try {
          const { code } = body;
          if (!code) {
            return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
          }
          
          const tokens = await exchangeCodeForTokens(code);
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
          const { accessToken, xmlContent } = body;
          
          if (!accessToken) {
            return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
          }
          
          if (!xmlContent) {
            return NextResponse.json({ error: 'XML content is required' }, { status: 400 });
          }
          
          // Parse XML to invoice data
          const invoiceData = await parseXmlToInvoiceData(xmlContent);
          
          // Create invoice in Xero
          const result = await createInvoice(accessToken, invoiceData);
          
          return NextResponse.json({ success: true, invoice: result });
        } catch (error) {
          console.error('Error creating invoice:', error);
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create invoice in Xero' },
            { status: 500 }
          );
        }
        
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
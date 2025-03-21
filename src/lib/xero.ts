import { XeroClient } from 'xero-node';
import * as xml2js from 'xml2js';

// Initialize Xero client with proper types
function createXeroClient(redirectUri?: string) {
  return new XeroClient({
    clientId: process.env.NEXT_PUBLIC_XERO_CLIENT_ID || '',
    clientSecret: process.env.XERO_CLIENT_SECRET || '',
    redirectUris: [redirectUri || process.env.NEXT_PUBLIC_XERO_REDIRECT_URI || 'http://localhost:3000/xero-upload/callback'],
    scopes: (process.env.NEXT_PUBLIC_XERO_SCOPES?.split(' ') || [
      'openid', 
      'profile', 
      'email', 
      'accounting.transactions', 
      'accounting.settings', 
      'offline_access'
    ]),
  });
}

/**
 * Get the authorization URL for Xero OAuth
 */
export async function getAuthUrl(redirectUri?: string): Promise<string> {
  try {
    console.log('Generating Xero auth URL...');
    // Generate a random state value for security
    const state = Math.random().toString(36).substring(7);
    // Create a new client with the custom redirect URI
    const xero = createXeroClient(redirectUri);
    // Build consent URL
    const url = await xero.buildConsentUrl();
    console.log('Auth URL generated successfully');
    return url;
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw new Error('Failed to generate authentication URL');
  }
}

// Create default client for other operations
const xero = createXeroClient();

/**
 * Parse XML invoice data to Xero invoice format
 */
export function parseXmlToInvoiceData(xmlData: string): any {
  console.log('Parsing XML data...');
  
  // Simple XML parsing (in a real app, use a proper XML parser)
  const getTagContent = (xml: string, tag: string): string => {
    const regex = new RegExp(`<${tag}>[\\s\\S]*?<\/${tag}>`);
    const match = xml.match(regex);
    if (!match) return '';
    
    const content = match[0].replace(`<${tag}>`, '').replace(`</${tag}>`, '');
    return content.trim();
  };
  
  // Extract invoice data from XML
  const type = getTagContent(xmlData, 'Type') || 'ACCREC';
  const invoiceNumber = getTagContent(xmlData, 'InvoiceNumber');
  const reference = getTagContent(xmlData, 'Reference');
  const date = getTagContent(xmlData, 'Date');
  const dueDate = getTagContent(xmlData, 'DueDate');
  
  // Try both 'Name' and 'n' tags for contact name (for compatibility)
  let contactName = getTagContent(xmlData, 'Name');
  if (!contactName) {
    contactName = getTagContent(xmlData, 'n');
  }
  
  // Extract line items - use a different approach without 's' flag
  const lineItemRegex = /<LineItem>[\s\S]*?<\/LineItem>/g;
  const lineItemsText = xmlData.match(lineItemRegex) || [];
  const lineItems = lineItemsText.map(item => {
    const description = getTagContent(item, 'Description');
    const quantity = getTagContent(item, 'Quantity');
    const unitAmount = getTagContent(item, 'UnitAmount');
    const accountCode = getTagContent(item, 'AccountCode');
    
    return {
      Description: description,
      Quantity: parseFloat(quantity) || 1,
      UnitAmount: parseFloat(unitAmount) || 0,
      AccountCode: accountCode || '200',
      TaxType: 'NONE'
    };
  });
  
  console.log('Parsed contact name:', contactName);
  console.log('Parsed line items:', lineItems);
  
  // Construct invoice object
  return {
    Type: type,
    Contact: {
      Name: contactName
    },
    Date: date || new Date().toISOString().split('T')[0],
    DueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    LineItems: lineItems,
    Reference: reference || 'Invoice created via API',
    InvoiceNumber: invoiceNumber || undefined,
    Status: 'DRAFT'
  };
}

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (code: string) => {
  console.log('Exchanging code for tokens...');
  
  try {
    const tokenUrl = 'https://identity.xero.com/connect/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', process.env.NEXT_PUBLIC_XERO_REDIRECT_URI || 'https://localhost:3000/callback');
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${process.env.NEXT_PUBLIC_XERO_CLIENT_ID || ''}:${process.env.XERO_CLIENT_SECRET || ''}`).toString('base64')
      },
      body: params
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', response.status, errorText);
      return { success: false, error: `Token exchange failed: ${response.status} ${errorText}` };
    }
    
    const tokenData = await response.json();
    console.log('Token exchange successful');
    
    // Calculate expiry time
    const expiresAt = Math.floor(Date.now() / 1000) + tokenData.expires_in;
    
    // Update the Xero client with the new tokens
    // Convert scope to string if it's an array to satisfy type requirements
    const scopeValue = typeof tokenData.scope === 'string' 
      ? tokenData.scope 
      : (process.env.NEXT_PUBLIC_XERO_SCOPES || 'openid profile email accounting.transactions accounting.settings offline_access');
    
    xero.setTokenSet({
      id_token: tokenData.id_token,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      token_type: 'Bearer',
      scope: scopeValue
    });
    
    return {
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during token exchange'
    };
  }
};

// Refresh access token
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    console.log('Refreshing access token...');
    
    // Manually refresh the token to avoid network errors
    const tokenUrl = 'https://identity.xero.com/connect/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${process.env.NEXT_PUBLIC_XERO_CLIENT_ID || ''}:${process.env.XERO_CLIENT_SECRET || ''}`).toString('base64')
      },
      body: params
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token refresh failed:', response.status, errorData);
      throw new Error(`Token refresh failed: ${response.status} ${errorData}`);
    }
    
    const tokenData = await response.json();
    console.log('Token refresh successful');
    
    // Convert scope to string if it's an array
    const scopeString = typeof tokenData.scope === 'string' 
      ? tokenData.scope 
      : 'openid profile email accounting.transactions accounting.settings offline_access';
    
    // Set the token in the Xero client
    await xero.setTokenSet({
      id_token: tokenData.id_token || '',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: scopeString
    });
    
    return {
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + tokenData.expires_in
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Create invoice from XML
export const createInvoiceFromXml = async (xmlContent: string, accessToken: string) => {
  try {
    console.log('Starting invoice creation from XML');
    
    // Convert scopes array to string if needed
    const scopeString = 'openid profile email accounting.transactions accounting.settings offline_access';
    
    // Set the access token
    await xero.setTokenSet({
      access_token: accessToken,
      refresh_token: '',
      id_token: '',
      expires_at: 0,
      token_type: 'Bearer',
      scope: scopeString
    });
    
    console.log('Token set in Xero client');
    
    // Get the first connected tenant
    console.log('Fetching tenants...');
    const tenants = await xero.updateTenants();
    
    if (!tenants || tenants.length === 0) {
      throw new Error('No connected Xero organizations found. Please reconnect to Xero.');
    }
    
    const firstTenant = tenants[0];
    console.log('Using tenant:', firstTenant.tenantName);
    
    // Parse XML and create invoice
    console.log('Parsing XML data...');
    const invoiceData = await parseXmlToInvoiceData(xmlContent);
    console.log('XML parsed successfully:', JSON.stringify(invoiceData, null, 2));
    
    // Convert to Xero's expected format
    const xeroInvoice = {
      type: invoiceData.type,
      contact: invoiceData.contact,
      date: invoiceData.date,
      dueDate: invoiceData.dueDate,
      lineItems: invoiceData.lineItems,
      status: invoiceData.status
    };
    
    console.log('Sending invoice to Xero API...');
    
    try {
      const response = await xero.accountingApi.createInvoices(
        firstTenant.tenantId,
        {
          invoices: [xeroInvoice as any]
        }
      );
      
      console.log('Invoice created successfully:', response.body);
      
      return {
        success: true,
        invoice: response.body.invoices?.[0]
      };
    } catch (apiError) {
      console.error('Xero API error:', apiError);
      
      // Try to extract more detailed error information
      let errorMessage = 'Failed to create invoice in Xero';
      
      if (apiError.response && apiError.response.body) {
        try {
          const errorBody = JSON.parse(apiError.response.body);
          errorMessage = errorBody.Message || errorBody.message || errorMessage;
        } catch (e) {
          errorMessage = apiError.response.body || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Export other functions that use the default client
export { xero }; 
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function XeroCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Getting URL parameters...');
        // Get code and state from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        console.log('Callback received:', {
          hasCode: !!code,
          hasState: !!state,
          state: state,
          fullUrl: window.location.href
        });

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Validate state parameter
        const storedState = localStorage.getItem('xero_auth_state');
        console.log('Validating state:', {
          receivedState: state,
          storedState: storedState
        });

        if (!storedState || storedState !== state) {
          throw new Error('Invalid state parameter - possible security issue');
        }

        setStatus('Exchanging code for tokens...');
        // Exchange code for tokens
        const response = await fetch('/api/xero/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'exchangeCode',
            code,
            state,
            redirectUri: process.env.NEXT_PUBLIC_XERO_REDIRECT_URI || 'https://localhost:3000/xero-upload/callback'
          }),
        });

        const data = await response.json();
        console.log('Token exchange response:', {
          status: response.status,
          ok: response.ok,
          hasError: !!data.error,
          errorDetails: data.error
        });

        if (!response.ok) {
          throw new Error(data.error || 'Failed to authenticate with Xero');
        }

        // Clear the stored state
        localStorage.removeItem('xero_auth_state');

        setStatus('Storing tokens...');
        // Store tokens
        localStorage.setItem('xero_access_token', data.accessToken);
        localStorage.setItem('xero_refresh_token', data.refreshToken);
        localStorage.setItem('xero_expires_at', data.expiresAt.toString());

        setStatus('Fetching connected tenants...');
        // Fetch connected tenants
        const tenantsResponse = await fetch('/api/xero/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.accessToken}`
          },
          body: JSON.stringify({
            action: 'getTenants'
          }),
        });

        const tenantsData = await tenantsResponse.json();
        console.log('Tenants response:', {
          status: tenantsResponse.status,
          ok: tenantsResponse.ok,
          tenantsCount: tenantsData.tenants?.length || 0
        });

        if (!tenantsResponse.ok) {
          throw new Error(tenantsData.error || 'Failed to fetch Xero organizations');
        }

        // Store the first tenant ID (or let user choose if multiple)
        if (tenantsData.tenants && tenantsData.tenants.length > 0) {
          localStorage.setItem('xero_tenant_id', tenantsData.tenants[0].tenantId);
          localStorage.setItem('xero_tenant_name', tenantsData.tenants[0].tenantName);
          setStatus('Successfully connected to Xero!');
          
          // Short delay before redirect
          setTimeout(() => {
            router.push('/xero-upload');
          }, 1000);
        } else {
          throw new Error('No organizations found in your Xero account');
        }
      } catch (error) {
        console.error('Error in callback:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setStatus('Authentication failed');
        
        // Wait before redirecting on error
        setTimeout(() => {
          router.push('/xero-upload?error=auth_failed');
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {error ? (
          <>
            <div className="text-red-500 mb-4 flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Authentication Error
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting back to upload page...</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mr-3"></div>
              <p className="text-gray-600">{status}</p>
            </div>
            <p className="text-sm text-gray-500 text-center">Please wait while we connect your Xero account...</p>
          </>
        )}
      </div>
    </div>
  );
} 
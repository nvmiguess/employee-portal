'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('Login Page - Component mounted', {
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
      search: window.location.search
    });
  }, []);

  useEffect(() => {
    console.log('Login Page - Auth State Changed:', {
      authLoading,
      isAuthenticated: !!user,
      userEmail: user?.email,
      redirectedFrom: searchParams.get('redirectedFrom'),
      timestamp: new Date().toISOString()
    });

    if (!authLoading && user) {
      const redirectedFrom = searchParams.get('redirectedFrom');
      console.log('Login Page - User already authenticated, redirecting:', {
        to: redirectedFrom || '/',
        timestamp: new Date().toISOString()
      });
      router.push(redirectedFrom || '/');
    }
  }, [user, authLoading, router, searchParams]);

  if (authLoading) {
    console.log('Login Page - Auth loading, showing spinner', {
      timestamp: new Date().toISOString()
    });
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login Page - Login form submitted', {
      timestamp: new Date().toISOString(),
      email: email,
      hasPassword: !!password
    });
    setError(null);
    setLoading(true);

    try {
      console.log('Login Page - Importing Supabase client', {
        timestamp: new Date().toISOString()
      });
      const { supabase } = await import('../../lib/supabase');
      console.log('Login Page - Calling Supabase auth', {
        timestamp: new Date().toISOString()
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login Page - Login error:', {
          error,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      if (!data?.user) {
        console.error('Login Page - No user data returned', {
          timestamp: new Date().toISOString()
        });
        throw new Error('No user data returned');
      }
      
      console.log('Login Page - Login successful:', {
        userId: data.user.id,
        email: data.user.email,
        timestamp: new Date().toISOString()
      });

      const redirectedFrom = searchParams.get('redirectedFrom');
      console.log('Login Page - Redirecting after successful login:', {
        to: redirectedFrom || '/',
        timestamp: new Date().toISOString()
      });
      
      // Add a small delay to ensure the auth state is updated
      setTimeout(() => {
        router.push(redirectedFrom || '/');
      }, 100);
    } catch (error: any) {
      console.error('Login Page - Login failed:', {
        error,
        timestamp: new Date().toISOString()
      });
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    console.log('Login Page - Email input changed', {
                      value: e.target.value,
                      timestamp: new Date().toISOString()
                    });
                    setEmail(e.target.value);
                  }}
                  onFocus={() => {
                    console.log('Login Page - Email input focused', {
                      timestamp: new Date().toISOString()
                    });
                  }}
                  onBlur={() => {
                    console.log('Login Page - Email input blurred', {
                      timestamp: new Date().toISOString()
                    });
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    console.log('Login Page - Password input changed', {
                      hasValue: !!e.target.value,
                      timestamp: new Date().toISOString()
                    });
                    setPassword(e.target.value);
                  }}
                  onFocus={() => {
                    console.log('Login Page - Password input focused', {
                      timestamp: new Date().toISOString()
                    });
                  }}
                  onBlur={() => {
                    console.log('Login Page - Password input blurred', {
                      timestamp: new Date().toISOString()
                    });
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                onClick={() => {
                  console.log('Login Page - Submit button clicked', {
                    loading,
                    timestamp: new Date().toISOString()
                  });
                }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/signup"
                onClick={(e) => {
                  console.log('Login Page - Sign up link clicked', {
                    timestamp: new Date().toISOString(),
                    event: e
                  });
                }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isEmailAllowed, isValidEmail } from '../../lib/auth';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign Up Page - Sign up attempt:', {
      email,
      timestamp: new Date().toISOString()
    });

    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      // Validate email format
      if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Check if email is allowed
      const { allowed, reason } = isEmailAllowed(email);
      if (!allowed) {
        throw new Error(reason || 'Email not authorized');
      }

      console.log('Sign Up Page - Email validation passed:', {
        email,
        timestamp: new Date().toISOString()
      });

      const { supabase } = await import('../../lib/supabase');
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      console.log('Sign Up Page - Sign up successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        timestamp: new Date().toISOString()
      });

      // Show success message and redirect
      alert('Please check your email for the confirmation link.');
      router.push('/');
    } catch (error: any) {
      console.error('Sign Up Page - Sign up error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setError(null);
    setResendLoading(true);

    try {
      console.log('Resending confirmation email to:', email);
      const { supabase } = await import('../../lib/supabase');
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      console.log('Resend response:', { data, error });

      if (error) throw error;

      setSuccess(true);
    } catch (error: any) {
      console.error('Resend error:', error);
      setError(error.message);
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Check your email
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We've sent a confirmation email to <span className="font-medium">{email}</span>.
                Please check your inbox and click the confirmation link to verify your account.
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleResendConfirmation}
                  disabled={resendLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                </button>
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSignUp}>
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
                    console.log('Sign Up Page - Email input changed', {
                      value: e.target.value,
                      timestamp: new Date().toISOString()
                    });
                    setEmail(e.target.value);
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    console.log('Sign Up Page - Password input changed', {
                      hasValue: !!e.target.value,
                      timestamp: new Date().toISOString()
                    });
                    setPassword(e.target.value);
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Sign up'}
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
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
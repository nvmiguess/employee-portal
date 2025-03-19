'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedRoute - Auth State:', {
      loading,
      isAuthenticated: !!user,
      userEmail: user?.email,
      currentPath: window.location.pathname
    });

    if (!loading && !user) {
      const currentPath = window.location.pathname;
      console.log('ProtectedRoute - Redirecting to login:', {
        from: currentPath,
        to: `/login?redirectedFrom=${encodeURIComponent(currentPath)}`
      });
      router.push(`/login?redirectedFrom=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router]);

  if (loading) {
    console.log('ProtectedRoute - Loading state, showing spinner');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, returning null');
    return null;
  }

  console.log('ProtectedRoute - User authenticated, rendering children');
  return <>{children}</>;
} 
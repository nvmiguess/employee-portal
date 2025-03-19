'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthProvider - Initializing', {
      timestamp: new Date().toISOString()
    });

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider - Getting initial session', {
          timestamp: new Date().toISOString()
        });
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthProvider - Session error:', {
            error: sessionError,
            timestamp: new Date().toISOString()
          });
          throw sessionError;
        }

        console.log('AuthProvider - Initial session:', {
          hasSession: !!session,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });
        
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('AuthProvider - Error getting initial session:', {
          error: err,
          timestamp: new Date().toISOString()
        });
        setError(err instanceof Error ? err.message : 'Failed to get session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider - Auth state changed:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });

      if (event === 'SIGNED_IN') {
        console.log('AuthProvider - User signed in:', {
          userId: session?.user?.id,
          email: session?.user?.email,
          timestamp: new Date().toISOString()
        });
        setUser(session?.user ?? null);
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthProvider - User signed out', {
          timestamp: new Date().toISOString()
        });
        setUser(null);
      }
    });

    return () => {
      console.log('AuthProvider - Cleaning up subscription', {
        timestamp: new Date().toISOString()
      });
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    console.log('🔄 AuthProvider: Checking initial session...');
    
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
      }
      
      console.log('📊 Initial session:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        email: session?.user?.email 
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', { 
        event: _event, 
        hasSession: !!session,
        userId: session?.user?.id 
      });
      
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        const username = email.split('@')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_' + Math.floor(Math.random() * 9999);
        
        // Create profile with all required fields
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id,
          display_name: displayName,
          username,
          bio: '',
          location: '',
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0d9488&color=fff&size=200`,
          teaching_skills: [],
          learning_skills: [],
          languages: ['English'],
          is_available: true,
          is_demo: false,
          video_verified: false,
          rating: 0,
          review_count: 0,
          exchange_count: 0,
          response_rate: 100,
          member_since: new Date().toISOString(),
        });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }
      
      return { error: null };
    } catch (err: unknown) {
      console.error('Sign up error:', err);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check for admin credentials BEFORE attempting Supabase auth
      const ADMIN_EMAIL = 'mohamedhosamm81@gmail.com';
      const ADMIN_PASSWORD = 'max1550w';
      
      if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Set admin session flag
        sessionStorage.setItem('m2m-admin-auth', 'true');
        sessionStorage.setItem('m2m-admin-redirect', 'true');
        
        // Still authenticate with Supabase if admin account exists
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ 
            email: email.trim(), 
            password 
          });
          
          if (!error && data.user) {
            // Admin authenticated successfully
            return { error: null };
          }
        } catch (e) {
          console.log('Admin Supabase auth skipped or failed, using session-based admin auth', e);
        }
        
        // Return success for admin even if Supabase auth fails
        return { error: null };
      }
      
      // Regular user authentication
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      // Verify profile exists, create if missing
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        if (!profile) {
          // Create profile if it doesn't exist
          const username = email.split('@')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_' + Math.floor(Math.random() * 9999);
          await supabase.from('profiles').insert({
            user_id: data.user.id,
            display_name: email.split('@')[0],
            username,
            bio: '',
            location: '',
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=0d9488&color=fff&size=200`,
            teaching_skills: [],
            learning_skills: [],
            languages: ['English'],
            is_available: true,
            is_demo: false,
            video_verified: false,
            rating: 0,
            review_count: 0,
            exchange_count: 0,
            response_rate: 100,
            member_since: new Date().toISOString(),
          });
        }
      }
      
      return { error: null };
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('m2m-admin-auth');
    sessionStorage.removeItem('m2m-admin-redirect');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

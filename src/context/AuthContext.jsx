import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Initial load: wait for both the session AND the profile so route
    // guards (ProtectedRoute / AdminRoute) can read the role reliably.
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      }
      if (active) setLoading(false);
    });

    // This callback must NOT be async and must NOT await a Supabase call
    // directly — that deadlocks the auth lock. We defer loadProfile().
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (newSession?.user) {
        setTimeout(() => {
          if (active) loadProfile(newSession.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
  }

  async function signIn(email, password) {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (!result.error && result.data?.user) {
      // Stamp last_login via a secure RPC (fire-and-forget).
      supabase.rpc('record_login');
    }
    return result;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const isAdmin = profile?.role === 'admin';
  const value = { session, profile, loading, isAdmin, signIn, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

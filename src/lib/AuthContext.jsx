import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  /** Registrierung als Privatperson (ohne Firma) */
  const signUpPrivat = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) throw error;

    if (data.user) {
      await supabase
        .from('profiles')
        .update({
          name,
          role: 'privat',
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_status: 'trialing',
        })
        .eq('id', data.user.id);
    }

    return data;
  };

  /** Registrierung als Firma (erstellt Firma + Arbeitgeber-Profil) */
  const signUpFirma = async (email, password, name, firmaName) => {
    // 1. Firma erstellen (Auto-Trial Trigger setzt trial_ends_at)
    const { data: firmaData, error: firmaError } = await supabase
      .from('firmen')
      .insert({ name: firmaName })
      .select()
      .single();

    if (firmaError) {
      if (firmaError.message?.includes('duplicate')) {
        throw new Error('Ein Unternehmen mit diesem Namen existiert bereits.');
      }
      throw firmaError;
    }

    // 2. User registrieren
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) throw error;

    // 3. Profile mit Firma verknüpfen
    if (data.user) {
      await supabase
        .from('profiles')
        .update({
          name,
          firma: firmaData.name,
          firma_id: firmaData.id,
          role: 'arbeitgeber',
        })
        .eq('id', data.user.id);
    }

    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const value = {
    user,
    profile,
    loading,
    signUpPrivat,
    signUpFirma,
    signIn,
    signOut,
    updateProfile,
    isPrivat: profile?.role === 'privat',
    isLernender: profile?.role === 'lernender',
    isArbeitgeber: profile?.role === 'arbeitgeber',
    isBetreiber: profile?.role === 'betreiber',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

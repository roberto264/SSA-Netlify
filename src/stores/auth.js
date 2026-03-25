// ============================================
// Auth Store (nanostores)
// ============================================
// Shared auth state across Astro React Islands.
// Replaces AuthContext for cross-island communication.

import { atom, computed } from 'nanostores';
import { supabase } from '../lib/supabase';

export const $user = atom(null);
export const $profile = atom(null);
export const $loading = atom(true);

export const $isAuthenticated = computed($user, user => !!user);

// Initialize auth — call once from any island
let initialized = false;

export async function initAuth() {
  if (initialized) return;
  initialized = true;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      $user.set(session.user);
      await loadProfile(session.user.id);
    }
  } catch (err) {
    console.error('Auth init error:', err);
  } finally {
    $loading.set(false);
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      $user.set(session.user);
      await loadProfile(session.user.id);
    } else {
      $user.set(null);
      $profile.set(null);
    }
  });
}

async function loadProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (data) {
    $profile.set(data);
  }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpPrivat(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: 'privat' } },
  });
  if (error) throw error;

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      name,
      role: 'privat',
    });
  }
  return data;
}

export async function signUpFirma(email, password, name, firmaName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, firma: firmaName, role: 'arbeitgeber' } },
  });
  if (error) throw error;

  if (data.user) {
    // Create firma
    const { data: firma } = await supabase.from('firmen').insert({ name: firmaName }).select().single();

    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      name,
      firma: firmaName,
      firma_id: firma?.id,
      role: 'arbeitgeber',
    });
  }
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  $user.set(null);
  $profile.set(null);
  window.location.href = '/login';
}

// ============================================
// useAuth Hook (nanostores-based)
// ============================================
// Drop-in replacement for the old AuthContext useAuth().
// Works across Astro React Islands.

import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { $user, $profile, $loading, initAuth, signIn, signUpPrivat, signUpFirma, signOut } from '../stores/auth';

export function useAuth() {
  const user = useStore($user);
  const profile = useStore($profile);
  const loading = useStore($loading);

  useEffect(() => {
    initAuth();
  }, []);

  return {
    user,
    profile,
    loading,
    signIn,
    signUpPrivat,
    signUpFirma,
    signOut,
  };
}

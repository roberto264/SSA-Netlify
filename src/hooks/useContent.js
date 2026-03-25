// ============================================
// useContent Hooks
// ============================================
// React hooks for loading content from Supabase.
// Wraps async contentLoader functions in useState/useEffect.

import { useState, useEffect } from 'react';
import {
  getModules,
  getModuleById,
  getQuizzes,
  getQuizByTopicId,
  getFlashcards,
  getMindmaps,
  getPersonas,
  getPersonaById,
  getLernhilfen,
  getPdfs,
  getAcademyConfig,
} from '../lib/contentLoader';

function useAsync(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then(result => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, deps);

  return { data, loading, error };
}

export function useModules() {
  return useAsync(() => getModules());
}

export function useModuleById(id) {
  return useAsync(() => getModuleById(id), [id]);
}

export function useQuizzes(moduleId) {
  return useAsync(() => getQuizzes(moduleId), [moduleId]);
}

export function useQuizByTopicId(topicId) {
  return useAsync(() => getQuizByTopicId(topicId), [topicId]);
}

export function useFlashcards(moduleId) {
  return useAsync(() => getFlashcards(moduleId), [moduleId]);
}

export function useMindmaps(moduleId) {
  return useAsync(() => getMindmaps(moduleId), [moduleId]);
}

export function usePersonas() {
  return useAsync(() => getPersonas());
}

export function usePersonaById(id) {
  return useAsync(() => getPersonaById(id), [id]);
}

export function useLernhilfen(moduleId) {
  return useAsync(() => getLernhilfen(moduleId), [moduleId]);
}

export function usePdfs(moduleId) {
  return useAsync(() => getPdfs(moduleId), [moduleId]);
}

export function useAcademyConfig() {
  return useAsync(() => getAcademyConfig());
}

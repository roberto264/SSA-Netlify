import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

// ============================================
// FORTSCHRITT HOOKS
// ============================================

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('modul_fortschritt')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (modulId, topicId, completed, score = 0) => {
    try {
      const { data, error } = await supabase
        .from('modul_fortschritt')
        .upsert({
          user_id: user.id,
          modul_id: modulId,
          topic_id: topicId,
          completed,
          score,
          completed_at: completed ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,modul_id,topic_id'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setProgress(prev => {
        const existing = prev.findIndex(p => p.modul_id === modulId && p.topic_id === topicId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        }
        return [...prev, data];
      });

      return data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const getModuleProgress = (modulId) => {
    const moduleTopics = progress.filter(p => p.modul_id === modulId);
    const completed = moduleTopics.filter(p => p.completed).length;
    return { completed, total: moduleTopics.length, topics: moduleTopics };
  };

  return { progress, loading, updateProgress, getModuleProgress, refresh: fetchProgress };
}

// ============================================
// QUIZ HOOKS
// ============================================

export function useQuizResults() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_ergebnisse')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveQuizResult = async (modulId, topicId, score, maxScore, passed, answers) => {
    try {
      const { data, error } = await supabase
        .from('quiz_ergebnisse')
        .insert({
          user_id: user.id,
          modul_id: modulId,
          topic_id: topicId,
          score,
          max_score: maxScore,
          passed,
          answers
        })
        .select()
        .single();

      if (error) throw error;
      setResults(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw error;
    }
  };

  return { results, loading, saveQuizResult, refresh: fetchResults };
}

// ============================================
// ROLLENSPIEL HOOKS
// ============================================

export function useRollenspiele() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('rollenspiel_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async (personaId, messages, rating, aiFeedback, softSkills) => {
    try {
      const { data, error } = await supabase
        .from('rollenspiel_sessions')
        .insert({
          user_id: user.id,
          persona_id: personaId,
          messages,
          rating,
          ai_feedback: aiFeedback,
          ...softSkills
        })
        .select()
        .single();

      if (error) throw error;
      setSessions(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  };

  return { sessions, loading, saveSession, refresh: fetchSessions };
}

// ============================================
// ADMIN HOOKS (für Betreiber)
// ============================================

export function useAllUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'betreiber') {
      fetchAllUsers();
    }
  }, [profile]);

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          modul_fortschritt (*),
          quiz_ergebnisse (*),
          rollenspiel_sessions (*),
          pruefungen (*)
        `)
        .eq('role', 'lernender');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, refresh: fetchAllUsers };
}

export function useFirmaUsers(firma) {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'arbeitgeber' && firma) {
      fetchFirmaUsers();
    }
  }, [profile, firma]);

  const fetchFirmaUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          modul_fortschritt (*),
          quiz_ergebnisse (*),
          rollenspiel_sessions (*)
        `)
        .eq('firma', firma)
        .eq('role', 'lernender');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching firma users:', error);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, refresh: fetchFirmaUsers };
}

// ============================================
// FIRMEN HOOK
// ============================================

export function useFirmen() {
  const [firmen, setFirmen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFirmen();
  }, []);

  const fetchFirmen = async () => {
    try {
      const { data, error } = await supabase
        .from('firmen')
        .select('*')
        .order('name');

      if (error) throw error;
      setFirmen(data || []);
    } catch (error) {
      console.error('Error fetching firmen:', error);
    } finally {
      setLoading(false);
    }
  };

  return { firmen, loading };
}

// ============================================
// AUDIO FORTSCHRITT HOOK
// ============================================

export function useAudioProgress() {
  const { user } = useAuth();
  const [audioProgress, setAudioProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAudioProgress();
    }
  }, [user]);

  const fetchAudioProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('audio_fortschritt')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Convert array to object keyed by modul_id
      const progressMap = {};
      (data || []).forEach(item => {
        progressMap[item.modul_id] = item.position;
      });
      setAudioProgress(progressMap);
    } catch (error) {
      console.error('Error fetching audio progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAudioProgress = async (modulId, position) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('audio_fortschritt')
        .upsert({
          user_id: user.id,
          modul_id: modulId,
          position: position,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,modul_id'
        });

      if (error) throw error;
      
      setAudioProgress(prev => ({
        ...prev,
        [modulId]: position
      }));
    } catch (error) {
      console.error('Error saving audio progress:', error);
    }
  };

  const getAudioProgress = (modulId) => {
    return audioProgress[modulId] || 0;
  };

  return { audioProgress, loading, saveAudioProgress, getAudioProgress, refresh: fetchAudioProgress };
}
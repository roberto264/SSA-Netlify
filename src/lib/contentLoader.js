// ============================================
// CONTENT LOADER (Supabase)
// ============================================
// Loads all content from Supabase tables.
// All functions are async. Use useContent hooks for React components.

import { supabase } from './supabase';

// Simple in-memory cache
const cache = {};

async function cached(key, fetcher) {
  if (cache[key]) return cache[key];
  const data = await fetcher();
  cache[key] = data;
  return data;
}

export function clearContentCache() {
  Object.keys(cache).forEach(k => delete cache[k]);
}

// ============================================
// CONFIG
// ============================================
export async function getAcademyConfig() {
  return cached('config', async () => {
    const { data, error } = await supabase
      .from('academy_config')
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      tagline: data.tagline,
      theme: { primary: data.theme_primary, accent: data.theme_accent, logo: data.theme_logo },
      features: {
        voiceChat: data.feature_voice_chat,
        flashcards: data.feature_flashcards,
        mindmaps: data.feature_mindmaps,
        certificates: data.feature_certificates,
        aiTutor: data.feature_ai_tutor,
      },
    };
  });
}

// ============================================
// MODULES (with topics from quiz_topics)
// ============================================
export async function getModules() {
  return cached('modules', async () => {
    const { data: mods, error: modErr } = await supabase
      .from('module')
      .select('*')
      .order('sort_order');
    if (modErr) throw modErr;

    const { data: topics, error: topicErr } = await supabase
      .from('quiz_topics')
      .select('*')
      .order('sort_order');
    if (topicErr) throw topicErr;

    return mods.map(m => ({
      id: m.id,
      title: m.title,
      icon: m.icon,
      color: m.color,
      description: m.description,
      topics: topics
        .filter(t => t.module_id === m.id)
        .map(t => ({ id: t.id, title: t.title, description: t.description })),
    }));
  });
}

export async function getModuleById(id) {
  const modules = await getModules();
  return modules.find(m => m.id === id);
}

// ============================================
// QUIZZES
// ============================================
export async function getQuizzes(moduleId) {
  const cacheKey = `quizzes_${moduleId}`;
  return cached(cacheKey, async () => {
    const { data: topics, error: topicErr } = await supabase
      .from('quiz_topics')
      .select('*')
      .eq('module_id', moduleId)
      .order('sort_order');
    if (topicErr) throw topicErr;

    const topicIds = topics.map(t => t.id);
    if (topicIds.length === 0) return [];

    const { data: questions, error: qErr } = await supabase
      .from('quiz_questions')
      .select('*')
      .in('quiz_topic_id', topicIds)
      .order('sort_order');
    if (qErr) throw qErr;

    return topics.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      questions: questions
        .filter(q => q.quiz_topic_id === t.id)
        .map(q => ({
          question: q.question,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
        })),
    }));
  });
}

export async function getQuizByTopicId(topicId) {
  const { data: topic, error: topicErr } = await supabase
    .from('quiz_topics')
    .select('*')
    .eq('id', topicId)
    .single();
  if (topicErr) return undefined;

  const { data: questions, error: qErr } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_topic_id', topicId)
    .order('sort_order');
  if (qErr) return undefined;

  return {
    id: topic.id,
    title: topic.title,
    description: topic.description,
    questions: questions.map(q => ({
      question: q.question,
      options: q.options,
      correct: q.correct,
      explanation: q.explanation,
    })),
  };
}

// ============================================
// FLASHCARDS
// ============================================
export async function getFlashcards(moduleId) {
  const cacheKey = `flashcards_${moduleId}`;
  return cached(cacheKey, async () => {
    const { data, error } = await supabase
      .from('content_flashcards')
      .select('*')
      .eq('module_id', moduleId)
      .order('sort_order');
    if (error) throw error;
    return data.map(c => ({
      question: c.question,
      answer: c.answer,
      id: c.id,
      category: c.category,
    }));
  });
}

// ============================================
// MINDMAPS
// ============================================
export async function getMindmaps(moduleId) {
  const cacheKey = `mindmaps_${moduleId}`;
  return cached(cacheKey, async () => {
    const { data: mm, error: mmErr } = await supabase
      .from('mindmaps')
      .select('*')
      .eq('module_id', moduleId)
      .single();
    if (mmErr) return null;

    const { data: topics, error: topicErr } = await supabase
      .from('mindmap_topics')
      .select('*')
      .eq('mindmap_module_id', moduleId)
      .order('sort_order');
    if (topicErr) return null;

    return {
      centerLabel: mm.center_label,
      topics: topics.map(t => ({
        id: t.id,
        title: t.title,
        color: t.color,
        details: t.details,
      })),
    };
  });
}

// ============================================
// PERSONAS
// ============================================
export async function getPersonas() {
  return cached('personas', async () => {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    return data.map(mapPersonaRow);
  });
}

export async function getPersonaById(id) {
  const cacheKey = `persona_${id}`;
  return cached(cacheKey, async () => {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return mapPersonaRow(data);
  });
}

function mapPersonaRow(p) {
  return {
    schemaVersion: p.schema_version,
    id: p.id,
    name: p.name,
    firstName: p.first_name,
    icon: p.icon,
    color: p.color,
    difficulty: p.difficulty,
    tags: p.tags || [],
    image: p.image,
    voiceType: p.voice_type,
    summary: p.summary,
    caseStudy: {
      situation: p.case_study_situation,
      concerns: p.case_study_concerns,
      needs: p.case_study_needs,
      idealSolution: p.case_study_ideal_solution,
    },
    systemPrompt: p.system_prompt,
    zenModePrompt: p.zen_mode_prompt,
  };
}

// ============================================
// LERNHILFEN (combined learning aids per module)
// ============================================
export async function getLernhilfen(moduleId) {
  const cacheKey = `lernhilfen_${moduleId}`;
  return cached(cacheKey, async () => {
    const { data, error } = await supabase
      .from('module_lernhilfen')
      .select('*')
      .eq('module_id', moduleId)
      .single();
    if (error) return null;

    const [flashcards, mindmap, pdf] = await Promise.all([
      getFlashcards(moduleId),
      getMindmaps(moduleId),
      getPdfs(moduleId),
    ]);

    return {
      audio: {
        title: data.audio_title,
        duration: data.audio_duration,
        url: data.audio_url,
        description: data.audio_description,
      },
      flashcards,
      mindmap,
      pdf,
    };
  });
}

// ============================================
// PDFS (from lernhilfen table)
// ============================================
export async function getPdfs(moduleId) {
  const cacheKey = `pdfs_${moduleId}`;
  return cached(cacheKey, async () => {
    const { data, error } = await supabase
      .from('module_lernhilfen')
      .select('pdf_title, pdf_description, pdf_file, pdf_topics')
      .eq('module_id', moduleId)
      .single();
    if (error || !data?.pdf_file) return null;
    return {
      title: data.pdf_title,
      description: data.pdf_description,
      file: data.pdf_file,
      topics: data.pdf_topics || [],
    };
  });
}

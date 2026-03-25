#!/usr/bin/env node

/**
 * Content Migration Script
 * Liest alle JSON-Dateien aus content/ und schreibt sie in Supabase-Tabellen.
 *
 * Voraussetzungen:
 * - Supabase Content-Tabellen müssen existieren (add_content_tables.sql)
 * - SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY als Env-Variablen
 *
 * Nutzung:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-content.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentDir = join(__dirname, '..', 'content');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Fehler: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.');
  console.error('Beispiel: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/migrate-content.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

async function upsert(table, data, onConflict) {
  const { error } = await supabase.from(table).upsert(data, { onConflict });
  if (error) {
    console.error(`Fehler bei ${table}:`, error.message);
    throw error;
  }
}

// ============================================
// 1. ACADEMY CONFIG
// ============================================
async function migrateConfig() {
  const config = readJson(join(contentDir, 'config.json'));
  await upsert('academy_config', {
    id: config.id,
    name: config.name,
    tagline: config.tagline || '',
    theme_primary: config.theme?.primary || '#059669',
    theme_accent: config.theme?.accent || '#F59E0B',
    theme_logo: config.theme?.logo || null,
    feature_voice_chat: config.features?.voiceChat ?? true,
    feature_flashcards: config.features?.flashcards ?? true,
    feature_mindmaps: config.features?.mindmaps ?? true,
    feature_certificates: config.features?.certificates ?? true,
    feature_ai_tutor: config.features?.aiTutor ?? true,
  }, 'id');
  console.log('✓ academy_config');
}

// ============================================
// 2. MODULES
// ============================================
async function migrateModules() {
  const files = readdirSync(join(contentDir, 'modules')).filter(f => f.endsWith('.json')).sort();
  const modules = files.map((f, i) => {
    const m = readJson(join(contentDir, 'modules', f));
    return {
      id: m.id,
      title: m.title,
      icon: m.icon,
      color: m.color,
      description: m.description,
      sort_order: i,
    };
  });
  await upsert('module', modules, 'id');
  console.log(`✓ module (${modules.length} Einträge)`);
}

// ============================================
// 3. QUIZZES (Topics + Questions)
// ============================================
async function migrateQuizzes() {
  const files = readdirSync(join(contentDir, 'quizzes')).filter(f => f.endsWith('.json')).sort();
  let topicCount = 0;
  let questionCount = 0;

  for (const f of files) {
    const data = readJson(join(contentDir, 'quizzes', f));
    const moduleId = data.moduleId;

    for (let i = 0; i < data.quizzes.length; i++) {
      const quiz = data.quizzes[i];

      // Quiz Topic
      await upsert('quiz_topics', {
        id: quiz.id,
        module_id: moduleId,
        title: quiz.title,
        description: quiz.description || null,
        sort_order: i,
      }, 'id');
      topicCount++;

      // Quiz Questions
      const questions = quiz.questions.map((q, qi) => ({
        quiz_topic_id: quiz.id,
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        sort_order: qi,
      }));

      for (const q of questions) {
        const { error } = await supabase.from('quiz_questions').insert(q);
        if (error) {
          console.error(`Fehler bei quiz_questions (${quiz.id}):`, error.message);
          throw error;
        }
        questionCount++;
      }
    }
  }
  console.log(`✓ quiz_topics (${topicCount}) + quiz_questions (${questionCount})`);
}

// ============================================
// 4. FLASHCARDS
// ============================================
async function migrateFlashcards() {
  const files = readdirSync(join(contentDir, 'flashcards')).filter(f => f.endsWith('.json')).sort();
  let setCount = 0;
  let cardCount = 0;

  for (const f of files) {
    const data = readJson(join(contentDir, 'flashcards', f));
    const moduleId = data.moduleId;

    // Flashcard Set
    await upsert('flashcard_sets', {
      module_id: moduleId,
      title: data.title,
      description: data.description,
    }, 'module_id');
    setCount++;

    // Flashcards
    const cards = data.cards.map((c, i) => ({
      module_id: moduleId,
      question: c.question,
      answer: c.answer,
      category: c.category || null,
      sort_order: i,
    }));

    for (const card of cards) {
      const { error } = await supabase.from('content_flashcards').insert(card);
      if (error) {
        console.error(`Fehler bei content_flashcards (modul ${moduleId}):`, error.message);
        throw error;
      }
      cardCount++;
    }
  }
  console.log(`✓ flashcard_sets (${setCount}) + content_flashcards (${cardCount})`);
}

// ============================================
// 5. MINDMAPS
// ============================================
async function migrateMindmaps() {
  const files = readdirSync(join(contentDir, 'mindmaps')).filter(f => f.endsWith('.json')).sort();
  let mapCount = 0;
  let topicCount = 0;

  for (const f of files) {
    const data = readJson(join(contentDir, 'mindmaps', f));
    const moduleId = data.moduleId;

    // Mindmap
    await upsert('mindmaps', {
      module_id: moduleId,
      center_label: data.centerLabel,
    }, 'module_id');
    mapCount++;

    // Mindmap Topics
    const topics = data.topics.map((t, i) => ({
      id: t.id,
      mindmap_module_id: moduleId,
      title: t.title,
      color: t.color,
      details: t.details,
      sort_order: i,
    }));

    await upsert('mindmap_topics', topics, 'id,mindmap_module_id');
    topicCount += topics.length;
  }
  console.log(`✓ mindmaps (${mapCount}) + mindmap_topics (${topicCount})`);
}

// ============================================
// 6. PERSONAS
// ============================================
async function migratePersonas() {
  const files = readdirSync(join(contentDir, 'personas')).filter(f => f.endsWith('.json')).sort();
  const personas = files.map((f, i) => {
    const p = readJson(join(contentDir, 'personas', f));
    return {
      id: p.id,
      schema_version: p.schemaVersion || 1,
      name: p.name,
      first_name: p.firstName,
      icon: p.icon,
      color: p.color,
      difficulty: p.difficulty,
      tags: p.tags || [],
      image: p.image,
      voice_type: p.voiceType,
      summary: p.summary,
      case_study_situation: p.caseStudy.situation,
      case_study_concerns: p.caseStudy.concerns,
      case_study_needs: p.caseStudy.needs,
      case_study_ideal_solution: p.caseStudy.idealSolution,
      system_prompt: p.systemPrompt,
      zen_mode_prompt: p.zenModePrompt || null,
      sort_order: i,
    };
  });
  await upsert('personas', personas, 'id');
  console.log(`✓ personas (${personas.length})`);
}

// ============================================
// 7. MODULE LERNHILFEN (hardcoded data from contentLoader)
// ============================================
async function migrateLernhilfen() {
  const lernhilfen = [
    {
      module_id: 1,
      audio_title: 'Vom Stausee zum Flaschenhals im Keller',
      audio_duration: '15:13',
      audio_url: '/audio/modul1-grundlagen.mp3',
      audio_description: 'Höre dir die wichtigsten Konzepte an - perfekt für unterwegs!',
      pdf_title: 'Grundlagen Photovoltaik',
      pdf_description: 'Komplette Schulungsunterlagen für Modul 1',
      pdf_file: '/pdfs/Modul_01_Grundlagen_Swiss_Solar_Academy.pdf',
      pdf_topics: ['Strommix der Schweiz', 'Netzebenen der Schweiz', 'Hausanschlusskasten (HAK)', 'Hausnetz', 'Drehstrom und Phasen', 'Gleichstrom vs. Wechselstrom', 'Solarstromproduktion'],
    },
    {
      module_id: 2,
      audio_title: 'Die vier Kundentypen im Solarvertrieb',
      audio_duration: '12:00',
      audio_url: null,
      audio_description: 'Lerne Alfred, Beni, Othmar und Tim kennen und wie du sie richtig ansprichst.',
      pdf_title: 'Kundengruppen & Sales',
      pdf_description: 'Lernunterlage Kundengruppen für Berater',
      pdf_file: '/pdfs/SSA_Kundengruppen_Berater.pdf',
      pdf_topics: ['Alfred Angst — Der vorsichtige Eigenheimbesitzer', 'Beni Bank — Der renditeorientierte Investor', 'Othmar Öko — Der umweltbewusste Gestalter', 'Tim Technik — Der technikaffine Optimierer'],
    },
    {
      module_id: 3,
      audio_title: 'Der Weg vom Sonnenstrahl zum Hausstrom',
      audio_duration: '16:28',
      audio_url: '/audio/modul2-systemkomponente.mp3',
      audio_description: 'Lerne alle Komponenten einer PV-Anlage kennen!',
      pdf_title: 'Systemkomponenten Photovoltaik',
      pdf_description: 'Komplette Schulungsunterlagen für Modul 3',
      pdf_file: '/pdfs/Modul_02_Systemkomponente_Swiss_Solar_Academy.pdf',
      pdf_topics: ['Das Photovoltaikmodul', 'Der Wechselrichter', 'Der Optimierer', 'Die Batterie', 'Die Notstrombox', 'Der Eigenverbrauchsmanager', 'Die Ladestation', 'Der Generatoranschlusskasten'],
    },
    {
      module_id: 4,
      audio_title: 'Audio-Zusammenfassung',
      audio_duration: '11:45',
      audio_url: null,
      audio_description: 'Planung und Dimensionierung einer PV-Anlage!',
      pdf_title: null,
      pdf_description: null,
      pdf_file: null,
      pdf_topics: null,
    },
    {
      module_id: 5,
      audio_title: 'Audio-Zusammenfassung',
      audio_duration: '14:10',
      audio_url: null,
      audio_description: 'Alles über Montage und Installation!',
      pdf_title: null,
      pdf_description: null,
      pdf_file: null,
      pdf_topics: null,
    },
    {
      module_id: 6,
      audio_title: 'Audio-Zusammenfassung',
      audio_duration: '13:25',
      audio_url: null,
      audio_description: 'Wirtschaftlichkeit und Förderprogramme!',
      pdf_title: null,
      pdf_description: null,
      pdf_file: null,
      pdf_topics: null,
    },
  ];

  await upsert('module_lernhilfen', lernhilfen, 'module_id');
  console.log(`✓ module_lernhilfen (${lernhilfen.length})`);
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('=== Content Migration Start ===\n');

  try {
    await migrateConfig();
    await migrateModules();
    await migrateQuizzes();
    await migrateFlashcards();
    await migrateMindmaps();
    await migratePersonas();
    await migrateLernhilfen();
    console.log('\n=== Migration erfolgreich abgeschlossen ===');
  } catch (err) {
    console.error('\n=== Migration fehlgeschlagen ===');
    console.error(err);
    process.exit(1);
  }
}

main();

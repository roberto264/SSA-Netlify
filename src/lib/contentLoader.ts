// ============================================
// CONTENT LOADER
// ============================================
// Loads all content from JSON files and provides
// helper functions for accessing it.

// Config
import config from '@content/config.json';

// Modules
import modul1 from '@content/modules/modul1.json';
import modul2 from '@content/modules/modul2.json';
import modul3 from '@content/modules/modul3.json';
import modul4 from '@content/modules/modul4.json';
import modul5 from '@content/modules/modul5.json';

// Quizzes
import modul1Quizzes from '@content/quizzes/modul1-quizzes.json';
import modul2Quizzes from '@content/quizzes/modul2-quizzes.json';
import modul3Quizzes from '@content/quizzes/modul3-quizzes.json';
import modul4Quizzes from '@content/quizzes/modul4-quizzes.json';
import modul5Quizzes from '@content/quizzes/modul5-quizzes.json';

// Flashcards
import modul1Flashcards from '@content/flashcards/modul1-flashcards.json';

// Mindmaps
import modul1Mindmap from '@content/mindmaps/modul1-mindmap.json';
import modul2Mindmap from '@content/mindmaps/modul2-mindmap.json';
import modul3Mindmap from '@content/mindmaps/modul3-mindmap.json';
import modul4Mindmap from '@content/mindmaps/modul4-mindmap.json';
import modul5Mindmap from '@content/mindmaps/modul5-mindmap.json';

// Personas
import mueller from '@content/personas/mueller.json';
import gruenfeld from '@content/personas/gruenfeld.json';
import baumann from '@content/personas/baumann.json';
import techag from '@content/personas/techag.json';

// ============================================
// TYPES (re-export for convenience)
// ============================================
import type {
  AcademyConfig,
  TopicQuiz,
  Flashcard,
  MindmapTopic,
  Persona,
} from '@/types/content';

// ============================================
// CONFIG
// ============================================
export const academyConfig = config as AcademyConfig;

// ============================================
// QUIZZES
// ============================================
const quizzesMap: Record<number, TopicQuiz[]> = {
  1: modul1Quizzes.quizzes as TopicQuiz[],
  2: modul2Quizzes.quizzes as TopicQuiz[],
  3: modul3Quizzes.quizzes as TopicQuiz[],
  4: modul4Quizzes.quizzes as TopicQuiz[],
  5: modul5Quizzes.quizzes as TopicQuiz[],
};

export function getQuizzes(moduleId: number): TopicQuiz[] | null {
  return quizzesMap[moduleId] || null;
}

export function getQuizByTopicId(topicId: string): TopicQuiz | undefined {
  for (const quizzes of Object.values(quizzesMap)) {
    const quiz = quizzes.find((q) => q.id === topicId);
    if (quiz) return quiz;
  }
  return undefined;
}

// ============================================
// FLASHCARDS
// ============================================
const flashcardsMap: Record<number, Flashcard[]> = {
  1: modul1Flashcards.cards as Flashcard[],
};

export function getFlashcards(moduleId: number): Flashcard[] {
  return flashcardsMap[moduleId] || [];
}

// ============================================
// MINDMAPS
// ============================================
interface MindmapData {
  centerLabel: string;
  topics: MindmapTopic[];
}

const mindmapsMap: Record<number, MindmapData> = {
  1: modul1Mindmap as MindmapData,
  2: modul2Mindmap as MindmapData,
  3: modul3Mindmap as MindmapData,
  4: modul4Mindmap as MindmapData,
  5: modul5Mindmap as MindmapData,
};

export function getMindmaps(moduleId: number): MindmapData | null {
  return mindmapsMap[moduleId] || null;
}

// ============================================
// PDFS
// ============================================
interface PdfData {
  title: string;
  description?: string;
  file: string;
  topics: string[];
}

const pdfsMap: Record<number, PdfData> = {
  1: {
    title: 'Grundlagen Photovoltaik',
    description: 'Komplette Schulungsunterlagen für Modul 1',
    file: '/pdfs/Modul_01_Grundlagen_Swiss_Solar_Academy.pdf',
    topics: [
      'Strommix der Schweiz',
      'Netzebenen der Schweiz',
      'Hausanschlusskasten (HAK)',
      'Hausnetz',
      'Drehstrom und Phasen',
      'Gleichstrom vs. Wechselstrom',
      'Solarstromproduktion',
    ],
  },
};

export function getPdfs(moduleId: number): PdfData | null {
  return pdfsMap[moduleId] || null;
}

// ============================================
// LERNHILFEN (combined learning aids per module)
// ============================================
interface LernhilfenData {
  audio: {
    title: string;
    duration: string;
    url: string | null;
    description: string;
  };
  flashcards: Flashcard[];
  mindmap: MindmapData | null;
  pdf: PdfData | null;
}

const lernhilfenMap: Record<number, LernhilfenData> = {
  1: {
    audio: {
      title: 'Audio-Zusammenfassung',
      duration: '15:13',
      url: '/audio/modul1-grundlagen.mp3',
      description: 'Höre dir die wichtigsten Konzepte an - perfekt für unterwegs! 🚗',
    },
    get flashcards() { return getFlashcards(1); },
    get mindmap() { return getMindmaps(1); },
    get pdf() { return getPdfs(1); },
  },
  2: {
    audio: {
      title: 'Audio-Zusammenfassung',
      duration: '15:20',
      url: null,
      description: 'Lerne alle Komponenten einer PV-Anlage kennen! 🔧',
    },
    get flashcards() { return getFlashcards(2); },
    get mindmap() { return getMindmaps(2); },
    get pdf() { return getPdfs(2); },
  },
  3: {
    audio: {
      title: 'Audio-Zusammenfassung',
      duration: '11:45',
      url: null,
      description: 'Planung und Dimensionierung einer PV-Anlage! 📐',
    },
    get flashcards() { return getFlashcards(3); },
    get mindmap() { return getMindmaps(3); },
    get pdf() { return getPdfs(3); },
  },
  4: {
    audio: {
      title: 'Audio-Zusammenfassung',
      duration: '14:10',
      url: null,
      description: 'Alles über Montage und Installation! 🔨',
    },
    get flashcards() { return getFlashcards(4); },
    get mindmap() { return getMindmaps(4); },
    get pdf() { return getPdfs(4); },
  },
  5: {
    audio: {
      title: 'Audio-Zusammenfassung',
      duration: '13:25',
      url: null,
      description: 'Wirtschaftlichkeit und Förderprogramme! 💰',
    },
    get flashcards() { return getFlashcards(5); },
    get mindmap() { return getMindmaps(5); },
    get pdf() { return getPdfs(5); },
  },
};

export function getLernhilfen(moduleId: number): LernhilfenData | null {
  return lernhilfenMap[moduleId] || null;
}

// ============================================
// MODULES (with topics from quizzes)
// ============================================
interface ModuleData {
  id: number;
  title: string;
  icon: string;
  color: string;
  description: string;
  topics: TopicQuiz[];
}

export const modules: ModuleData[] = [
  {
    ...modul1,
    topics: modul1Quizzes.quizzes as TopicQuiz[],
  },
  {
    ...modul2,
    topics: modul2Quizzes.quizzes as TopicQuiz[],
  },
  {
    ...modul3,
    topics: modul3Quizzes.quizzes as TopicQuiz[],
  },
  {
    ...modul4,
    topics: modul4Quizzes.quizzes as TopicQuiz[],
  },
  {
    ...modul5,
    topics: modul5Quizzes.quizzes as TopicQuiz[],
  },
];

export function getModuleById(id: number): ModuleData | undefined {
  return modules.find((m) => m.id === id);
}

// ============================================
// PERSONAS
// ============================================
// Personas in JSON don't have lucide-react icon components.
// We map icon names to components at the component level.
export const personas = [mueller, gruenfeld, baumann, techag] as Persona[];

export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}

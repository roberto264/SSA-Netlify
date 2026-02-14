// ============================================
// CONFIG
// ============================================
export interface AcademyConfig {
  id: string;
  name: string;
  tagline: string;
  theme: {
    primary: string;
    accent: string;
    logo?: string;
  };
  features: {
    voiceChat: boolean;
    flashcards: boolean;
    mindmaps: boolean;
    certificates: boolean;
    aiTutor: boolean;
  };
}

// ============================================
// MODULES
// ============================================
export interface Topic {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  materialien?: Array<{
    type: string;
    title: string;
    url: string;
  }>;
}

export interface ModuleLernhilfen {
  audio?: {
    url: string | null;
    title: string;
    duration: string;
    description: string;
  };
  flashcards?: string;
  mindmap?: string;
  pdf?: {
    url: string;
    title: string;
    topics: string[];
  };
}

export interface Module {
  id: number;
  title: string;
  icon: string;
  color: string;
  description: string;
  topics: Topic[];
  lernhilfen?: ModuleLernhilfen;
}

// ============================================
// QUIZZES
// ============================================
export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface TopicQuiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

export interface ModuleQuizzes {
  moduleId: number;
  quizzes: TopicQuiz[];
}

// ============================================
// FLASHCARDS
// ============================================
export interface Flashcard {
  question: string;
  answer: string;
  id?: string;
  category?: string;
}

export interface ModuleFlashcards {
  moduleId: number;
  title: string;
  description: string;
  cards: Flashcard[];
}

// ============================================
// MINDMAPS
// ============================================
export interface MindmapTopic {
  id: string;
  title: string;
  color: string;
  details: string[];
}

export interface ModuleMindmap {
  moduleId: number;
  centerLabel: string;
  topics: MindmapTopic[];
}

// ============================================
// PERSONAS
// ============================================
export type VoiceType = 'onyx' | 'nova' | 'fable' | 'echo';

export interface PersonaCaseStudy {
  situation: string;
  concerns: string[];
  needs: string[];
  idealSolution: string;
}

export interface Persona {
  schemaVersion: number;
  id: string;
  name: string;
  firstName: string;
  icon: string;
  color: string;
  difficulty: string;
  tags: string[];
  image: string;
  voiceType: VoiceType;
  summary: string;
  caseStudy: PersonaCaseStudy;
  systemPrompt: string;
  zenModePrompt?: string;
}

// ============================================
// ZEN MODE FEEDBACK
// ============================================
export interface ZenFeedback {
  // Existing soft skills (1-5)
  gesprachsfuhrung: number;
  aktives_zuhoren: number;
  klarheit: number;
  einwand_behandlung: number;
  empathie: number;
  uberzeugungskraft: number;
  gesamtbewertung: 'schwach' | 'mittel' | 'gut';
  feedback: string;
  staerken: string[];
  verbesserungen: string[];
  // Zen-specific metrics
  user_question_count: number;
  user_question_quality: number;
  sentiment_score: number;
  tonalitaet: string;
  gefragte_fragen_analyse: string;
  // Interruption metrics
  interruption_count: number;
  dem_kunden_reingeredet: number; // 1-5 (5 = keine Unterbrechungen)
  unterbrechungs_analyse: string;
  // Computed metrics (from frontend/backend)
  speaking_ratio: number;
  duration_seconds: number;
  exchange_count: number;
}

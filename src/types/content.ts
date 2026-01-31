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
export interface PersonaCaseStudy {
  situation: string;
  concerns: string[];
  needs: string[];
  idealSolution: string;
}

export interface Persona {
  id: string;
  name: string;
  firstName: string;
  icon: string;
  color: string;
  difficulty: string;
  tags: string[];
  image: string;
  voiceType: string;
  summary: string;
  caseStudy: PersonaCaseStudy;
  systemPrompt: string;
}

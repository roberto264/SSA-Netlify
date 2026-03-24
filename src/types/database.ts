/** Database types for Supabase tables */

export interface Profile {
  id: string;
  email: string;
  name: string;
  firma: string | null;
  firma_id: string | null;
  role: 'lernender' | 'arbeitgeber' | 'betreiber';
  created_at: string;
  last_login: string | null;
  deleted_at: string | null;
}

export interface ModulFortschritt {
  id: string;
  user_id: string;
  modul_id: number;
  topic_id: string;
  completed: boolean;
  score: number;
  completed_at: string | null;
}

export interface QuizErgebnis {
  id: string;
  user_id: string;
  modul_id: number;
  topic_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  answers: unknown;
  created_at: string;
}

export interface RollenspielSession {
  id: string;
  user_id: string;
  persona_id: string;
  messages: unknown;
  rating: 'schwach' | 'mittel' | 'gut' | null;
  ai_feedback: string | null;
  gesprachsfuhrung: number | null;
  aktives_zuhoren: number | null;
  klarheit: number | null;
  einwand_behandlung: number | null;
  empathie: number | null;
  uberzeugungskraft: number | null;
  session_type: 'standard' | 'zen';
  created_at: string;
}

/** User with joined data (from useFirmaUsers / useAllUsers) */
export interface UserWithData extends Profile {
  modul_fortschritt: ModulFortschritt[];
  quiz_ergebnisse: QuizErgebnis[];
  rollenspiel_sessions: RollenspielSession[];
}

export interface Firma {
  id: string;
  name: string;
  stripe_customer_id: string | null;
  subscription_id: string | null;
  subscription_status: string;
  seat_limit: number;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

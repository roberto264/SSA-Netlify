// ============================================
// Island Wrapper
// ============================================
// Wraps each React Island with necessary providers:
// - AuthProvider (from existing AuthContext)
// - Simple navigation helper (replaces react-router)

import { AuthProvider } from '../../lib/AuthContext';

export function IslandWrapper({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

// Navigation helper (replaces useNavigate from react-router)
export function useNavigate() {
  return (path) => {
    window.location.href = path;
  };
}

// useParams replacement — reads from URL
export function useParams() {
  const path = window.location.pathname;
  const params = {};

  // Match common patterns
  const moduleMatch = path.match(/\/module\/(\d+)/);
  if (moduleMatch) params.moduleId = moduleMatch[1];

  const quizMatch = path.match(/\/module\/\d+\/quiz\/([^/]+)/);
  if (quizMatch) params.topicId = quizMatch[1];

  const personaMatch = path.match(/\/roleplay\/([^/]+)/);
  if (personaMatch) params.personaId = personaMatch[1];

  const tokenMatch = path.match(/\/invite\/([^/]+)/);
  if (tokenMatch) params.token = tokenMatch[1];

  return params;
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Header } from './components/layout';

// Pages
import AuthPage from './components/AuthPage';
import { LernenderDashboard } from './pages/LernenderDashboard';
import { ArbeitgeberDashboard } from './pages/ArbeitgeberDashboard';
import { BetreiberDashboard } from './pages/BetreiberDashboard';
import { ModuleDetailPage } from './pages/ModuleDetailPage';
import { QuizPage } from './pages/QuizPage';
import { PersonaSelectionPage } from './pages/PersonaSelectionPage';
import { VoiceChatPage } from './pages/VoiceChatPage';
import AITutor from './components/AITutor';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function DashboardRedirect() {
  const { profile } = useAuth();

  switch (profile?.role) {
    case 'betreiber':
      return <BetreiberDashboard />;
    case 'arbeitgeber':
      return <ArbeitgeberDashboard />;
    default:
      return <LernenderDashboard />;
  }
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {children}
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Redirect logged-in users away from login
  if (user && window.location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<AuthPage />} />

      {/* Protected - Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardRedirect />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected - Module Detail */}
      <Route
        path="/module/:moduleId"
        element={
          <ProtectedRoute>
            <ModuleDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Protected - Quiz */}
      <Route
        path="/module/:moduleId/quiz/:topicId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <QuizPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected - Roleplay Selection */}
      <Route
        path="/roleplay"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PersonaSelectionPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected - Voice Chat */}
      <Route
        path="/roleplay/:personaId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <VoiceChatPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected - AI Tutor */}
      <Route
        path="/tutor"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AITutor onBack={() => window.history.back()} />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

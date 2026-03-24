import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Header } from './components/layout';
import { lazy, Suspense } from 'react';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages (code splitting)
const AuthPage = lazy(() => import('./components/AuthPage'));
const LernenderDashboard = lazy(() => import('./pages/LernenderDashboard').then(m => ({ default: m.LernenderDashboard })));
const ArbeitgeberDashboard = lazy(() => import('./pages/ArbeitgeberDashboard').then(m => ({ default: m.ArbeitgeberDashboard })));
const BetreiberDashboard = lazy(() => import('./pages/BetreiberDashboard').then(m => ({ default: m.BetreiberDashboard })));
const ModuleDetailPage = lazy(() => import('./pages/ModuleDetailPage').then(m => ({ default: m.ModuleDetailPage })));
const QuizPage = lazy(() => import('./pages/QuizPage').then(m => ({ default: m.QuizPage })));
const PersonaSelectionPage = lazy(() => import('./pages/PersonaSelectionPage').then(m => ({ default: m.PersonaSelectionPage })));
const VoiceChatPage = lazy(() => import('./pages/VoiceChatPage').then(m => ({ default: m.VoiceChatPage })));
const ZenModePage = lazy(() => import('./pages/ZenModePage').then(m => ({ default: m.ZenModePage })));
const AITutor = lazy(() => import('./components/AITutor'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const InvitePage = lazy(() => import('./pages/InvitePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

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

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      {children}
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (user && window.location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/invite/:token" element={<InvitePage />} />

        {/* Protected - Dashboard */}
        <Route path="/" element={<ProtectedRoute><AppLayout><DashboardRedirect /></AppLayout></ProtectedRoute>} />

        {/* Protected - Module Detail */}
        <Route path="/module/:moduleId" element={<ProtectedRoute><ModuleDetailPage /></ProtectedRoute>} />

        {/* Protected - Quiz */}
        <Route path="/module/:moduleId/quiz/:topicId" element={<ProtectedRoute><AppLayout><QuizPage /></AppLayout></ProtectedRoute>} />

        {/* Protected - Roleplay Selection */}
        <Route path="/roleplay" element={<ProtectedRoute><AppLayout><PersonaSelectionPage /></AppLayout></ProtectedRoute>} />

        {/* Protected - Voice Chat */}
        <Route path="/roleplay/:personaId" element={<ProtectedRoute><AppLayout><VoiceChatPage /></AppLayout></ProtectedRoute>} />

        {/* Protected - Zen Mode (fullscreen, no AppLayout) */}
        <Route path="/roleplay/:personaId/zen" element={<ProtectedRoute><ZenModePage /></ProtectedRoute>} />

        {/* Protected - Settings */}
        <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />

        {/* Protected - AI Tutor */}
        <Route path="/tutor" element={<ProtectedRoute><AppLayout><AITutor onBack={() => window.history.back()} /></AppLayout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

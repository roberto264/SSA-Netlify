import { useAuth } from '../../lib/AuthContext';
import { Header } from '../layout';
import { Loader2 } from 'lucide-react';

export default function ProtectedShell({ children, noHeader = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  if (noHeader) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      {children}
    </div>
  );
}

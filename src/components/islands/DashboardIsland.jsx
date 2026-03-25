import { IslandWrapper } from './IslandWrapper';
import { useAuth } from '../../lib/AuthContext';
import { LernenderDashboard } from '../pages/LernenderDashboard';
import { ArbeitgeberDashboard } from '../pages/ArbeitgeberDashboard';
import { BetreiberDashboard } from '../pages/BetreiberDashboard';
import { Header } from '../layout';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
  const { user, profile, loading } = useAuth();

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

  const Dashboard = profile?.role === 'betreiber' ? BetreiberDashboard
    : profile?.role === 'arbeitgeber' ? ArbeitgeberDashboard
    : LernenderDashboard;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <Dashboard />
    </div>
  );
}

export default function DashboardIsland() {
  return (
    <IslandWrapper>
      <DashboardContent />
    </IslandWrapper>
  );
}

import { useEffect } from 'react';
import { useParams, useNavigate } from '../islands/IslandWrapper';
import { Loader2 } from 'lucide-react';
import { useModuleById } from '../../hooks/useContent';
import ModuleDetail from '../ModuleDetail';

export function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { data: module, loading } = useModuleById(Number(moduleId));

  useEffect(() => {
    if (!loading && !module) {
      window.location.href = '/';
    }
  }, [loading, module]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!module) {
    return null;
  }

  return (
    <ModuleDetail
      module={module}
      onBack={() => navigate('/')}
      onSelectTopic={(topic) => navigate(`/module/${moduleId}/quiz/${topic.id}`)}
    />
  );
}

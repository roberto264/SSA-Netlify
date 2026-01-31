import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { modules } from '../lib/contentLoader';
import ModuleDetail from '../components/ModuleDetail';

export function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const module = modules.find(m => m.id === Number(moduleId));

  if (!module) {
    return <Navigate to="/" replace />;
  }

  return (
    <ModuleDetail
      module={module}
      onBack={() => navigate('/')}
      onSelectTopic={(topic) => navigate(`/module/${moduleId}/quiz/${topic.id}`)}
    />
  );
}

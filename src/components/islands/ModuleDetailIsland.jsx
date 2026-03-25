import { IslandWrapper } from './IslandWrapper';
import ProtectedShell from './ProtectedShell';
import { ModuleDetailPage } from '../pages/ModuleDetailPage';

export default function ModuleDetailIsland() {
  return (
    <IslandWrapper>
      <ProtectedShell noHeader>
        <ModuleDetailPage />
      </ProtectedShell>
    </IslandWrapper>
  );
}

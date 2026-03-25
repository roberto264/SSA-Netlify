import { IslandWrapper } from './IslandWrapper';
import ProtectedShell from './ProtectedShell';
import { PersonaSelectionPage } from '../pages/PersonaSelectionPage';

export default function PersonaSelectionIsland() {
  return (
    <IslandWrapper>
      <ProtectedShell>
        <PersonaSelectionPage />
      </ProtectedShell>
    </IslandWrapper>
  );
}

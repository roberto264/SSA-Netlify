import { IslandWrapper } from './IslandWrapper';
import ProtectedShell from './ProtectedShell';
import SettingsPage from '../pages/SettingsPage';

export default function SettingsIsland() {
  return (
    <IslandWrapper>
      <ProtectedShell>
        <SettingsPage />
      </ProtectedShell>
    </IslandWrapper>
  );
}

import { IslandWrapper } from './IslandWrapper';
import ProtectedShell from './ProtectedShell';
import { ZenModePage } from '../pages/ZenModePage';

export default function ZenModeIsland() {
  return (
    <IslandWrapper>
      <ProtectedShell noHeader>
        <ZenModePage />
      </ProtectedShell>
    </IslandWrapper>
  );
}

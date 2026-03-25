import { IslandWrapper } from './IslandWrapper';
import ProtectedShell from './ProtectedShell';
import { VoiceChatPage } from '../pages/VoiceChatPage';

export default function VoiceChatIsland() {
  return (
    <IslandWrapper>
      <ProtectedShell>
        <VoiceChatPage />
      </ProtectedShell>
    </IslandWrapper>
  );
}

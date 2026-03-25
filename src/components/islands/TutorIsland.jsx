import { IslandWrapper } from './IslandWrapper';
import ProtectedShell from './ProtectedShell';
import AITutor from '../AITutor';

export default function TutorIsland() {
  return (
    <IslandWrapper>
      <ProtectedShell>
        <AITutor />
      </ProtectedShell>
    </IslandWrapper>
  );
}

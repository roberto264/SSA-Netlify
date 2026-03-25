import { IslandWrapper } from './IslandWrapper';
import ProtectedShell from './ProtectedShell';
import { QuizPage } from '../pages/QuizPage';

export default function QuizIsland() {
  return (
    <IslandWrapper>
      <ProtectedShell>
        <QuizPage />
      </ProtectedShell>
    </IslandWrapper>
  );
}

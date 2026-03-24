import { useState } from 'react';
import { ArrowLeft, Trophy, XCircle, Check, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgress, useQuizResults } from '../lib/database';
import { modules, getQuizByTopicId } from '../lib/contentLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function QuizPage() {
  const { moduleId, topicId } = useParams();
  const navigate = useNavigate();
  const module = modules.find(m => m.id === Number(moduleId));
  const topic = module?.topics.find(t => t.id === topicId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);

  const { updateProgress } = useProgress();
  const { saveQuizResult } = useQuizResults();

  if (!module || !topic) {
    navigate('/');
    return null;
  }

  const question = topic.questions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    setAnswers([...answers, { question: currentQuestion, selected: index, correct: question.correct }]);
    if (index === question.correct) setScore(score + 1);
  };

  const handleNext = async () => {
    if (currentQuestion < topic.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      const passed = (score / topic.questions.length) >= 0.7;
      await saveQuizResult(module.id, topic.id, score, topic.questions.length, passed, answers);
      if (passed) {
        await updateProgress(module.id, topic.id, true, score);
      }
      setShowResult(true);
    }
  };

  const goBack = () => navigate(`/module/${moduleId}`);

  if (showResult) {
    const percentage = Math.round((score / topic.questions.length) * 100);
    const passed = percentage >= 70;
    return (
      <main className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Card className="border border-slate-200 shadow-lg animate-slide-in rounded-xl">
          <CardContent className="p-8 text-center">
            <div className={cn(
              "h-20 w-20 mx-auto mb-6 rounded-2xl flex items-center justify-center",
              passed ? 'bg-emerald-50' : 'bg-red-50'
            )}>
              {passed
                ? <Trophy className="h-10 w-10 text-emerald-500" />
                : <XCircle className="h-10 w-10 text-destructive" />
              }
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {passed ? 'Gratulation!' : 'Nicht bestanden'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {passed ? 'Du hast das Quiz erfolgreich bestanden!' : 'Versuch es noch einmal, du schaffst das!'}
            </p>
            <div className={cn(
              "text-5xl font-bold mb-1",
              passed ? 'text-emerald-500' : 'text-destructive'
            )}>
              {percentage}%
            </div>
            <p className="text-muted-foreground mb-8">{score} von {topic.questions.length} richtig</p>
            <div className="space-y-3">
              <Button
                onClick={() => { setCurrentQuestion(0); setSelectedAnswer(null); setAnswered(false); setScore(0); setAnswers([]); setShowResult(false); }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
              >
                Quiz wiederholen
              </Button>
              <Button
                onClick={goBack}
                variant="secondary"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                size="lg"
              >
                Zurück zum Modul
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const progressPercent = ((currentQuestion + 1) / topic.questions.length) * 100;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Button variant="ghost" onClick={goBack} className="gap-2 text-muted-foreground hover:text-foreground -ml-2 mb-4">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </Button>

      <Card className="border border-slate-200 shadow-sm animate-slide-in rounded-xl">
        <CardContent className="p-5 sm:p-6">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {currentQuestion + 1} / {topic.questions.length}
            </span>
            <Progress value={progressPercent} className="flex-1 h-2" />
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option: string, index: number) => {
              const isCorrect = index === question.correct;
              const wasSelected = selectedAnswer === index;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={answered}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                    !answered && "hover:border-primary/50 hover:bg-primary/5",
                    !answered && "border-border bg-background",
                    answered && isCorrect && "border-emerald-500 bg-emerald-50",
                    answered && wasSelected && !isCorrect && "border-destructive bg-destructive/5",
                    answered && !isCorrect && !wasSelected && "border-border bg-background opacity-60",
                    answered ? 'cursor-default' : 'cursor-pointer'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center font-medium text-sm flex-shrink-0",
                      answered && isCorrect && "bg-emerald-500 text-white",
                      answered && wasSelected && !isCorrect && "bg-destructive text-white",
                      !answered && "bg-secondary text-muted-foreground",
                      answered && !isCorrect && !wasSelected && "bg-secondary text-muted-foreground"
                    )}>
                      {answered && isCorrect ? <Check className="h-4 w-4" /> :
                       answered && wasSelected ? <X className="h-4 w-4" /> :
                       String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium text-sm sm:text-base text-foreground">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="mt-5 space-y-4">
              <div className={cn(
                "p-4 rounded-xl border",
                selectedAnswer === question.correct
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
              )}>
                <p className={cn(
                  "text-sm",
                  selectedAnswer === question.correct ? 'text-emerald-800' : 'text-amber-800'
                )}>
                  <strong>Erklärung:</strong> {question.explanation}
                </p>
              </div>
              <Button onClick={handleNext} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                {currentQuestion < topic.questions.length - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

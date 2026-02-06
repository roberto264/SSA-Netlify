import { useState } from 'react';
import { ArrowLeft, Trophy, XCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgress, useQuizResults } from '../lib/database';
import { modules, getQuizByTopicId } from '../lib/contentLoader';

export function QuizPage() {
  const { moduleId, topicId } = useParams();
  const navigate = useNavigate();
  const module = modules.find(m => m.id === Number(moduleId));
  const topic = module?.topics.find(t => t.id === topicId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);

  const { updateProgress } = useProgress();
  const { saveQuizResult } = useQuizResults();

  if (!module || !topic) {
    navigate('/');
    return null;
  }

  const question = topic.questions[currentQuestion];

  const handleAnswer = (index) => {
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
        <div className="bg-white rounded-2xl card-shadow p-6 sm:p-8 text-center animate-slide-in">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center ${passed ? 'text-amber-500' : 'text-red-500'}`}>
            {passed ? <Trophy className="w-12 h-12 sm:w-16 sm:h-16" /> : <XCircle className="w-12 h-12 sm:w-16 sm:h-16" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            {passed ? 'Gratulation! 🎉' : 'Nicht bestanden'}
          </h2>
          <p className="text-slate-600 mb-6">
            {passed ? 'Du hast das Quiz erfolgreich bestanden!' : 'Versuch es noch einmal, du schaffst das!'}
          </p>
          <div className={`text-5xl font-bold mb-2 ${passed ? 'text-green-500' : 'text-red-500'}`}>{percentage}%</div>
          <p className="text-slate-500 mb-6">{score} von {topic.questions.length} richtig</p>
          <div className="space-y-3">
            <button onClick={() => { setCurrentQuestion(0); setSelectedAnswer(null); setAnswered(false); setScore(0); setAnswers([]); setShowResult(false); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all">
              Quiz wiederholen
            </button>
            <button onClick={goBack}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all">
              Zurück zum Modul
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <button onClick={goBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Zurück
      </button>
      <div className="bg-white rounded-2xl card-shadow p-4 sm:p-6 animate-slide-in">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500">Frage {currentQuestion + 1} von {topic.questions.length}</span>
          <div className="h-2 flex-1 mx-4 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full progress-bar-animate" style={{ width: `${((currentQuestion + 1) / topic.questions.length) * 100}%` }}></div>
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-6">{question.question}</h2>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correct;
            const wasSelected = selectedAnswer === index;
            let classes = 'bg-slate-50 hover:bg-slate-100 border-slate-200';
            if (answered) {
              if (isCorrect) classes = 'bg-green-100 border-green-500 text-green-800';
              else if (wasSelected) classes = 'bg-red-100 border-red-500 text-red-800';
            }
            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                className={`w-full p-3 sm:p-4 rounded-xl border-2 ${classes} text-left transition-all ${answered ? 'cursor-default' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm ${
                    answered && isCorrect ? 'bg-green-500 text-white' :
                    answered && wasSelected ? 'bg-red-500 text-white' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {answered && isCorrect ? '✓' : answered && wasSelected ? '✗' : String.fromCharCode(65 + index)}
                  </span>
                  <span className="font-medium text-sm sm:text-base">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {answered && (
          <>
            <div className={`mt-4 p-3 sm:p-4 rounded-xl border ${selectedAnswer === question.correct ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className={`text-xs sm:text-sm ${selectedAnswer === question.correct ? 'text-green-800' : 'text-amber-800'}`}>
                <strong>Erklärung:</strong> {question.explanation}
              </p>
            </div>
            <button onClick={handleNext} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all">
              {currentQuestion < topic.questions.length - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

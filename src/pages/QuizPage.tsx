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
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 text-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center ${percentage >= 70 ? 'bg-green-100' : 'bg-red-100'}`}>
            {percentage >= 70 ? <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" /> : <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{percentage >= 70 ? 'Bestanden!' : 'Nicht bestanden'}</h2>
          <p className="text-gray-500 mb-4 sm:mb-6">{score}/{topic.questions.length} richtig ({percentage}%)</p>
          <button onClick={goBack} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg font-medium text-sm sm:text-base">Zurück zum Modul</button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <button onClick={goBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">{topic.title}</h3>
          <span className="text-xs sm:text-sm text-gray-500">{currentQuestion + 1}/{topic.questions.length}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4 sm:mb-6">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${((currentQuestion + 1) / topic.questions.length) * 100}%` }}></div>
        </div>
        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">{question.question}</h4>
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {question.options.map((option, index) => (
            <button key={index} onClick={() => handleAnswer(index)} disabled={answered}
              className={`w-full p-3 sm:p-4 text-left rounded-xl border-2 transition text-sm sm:text-base ${
                answered
                  ? index === question.correct ? 'border-green-500 bg-green-50'
                    : index === selectedAnswer ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}>
              {option}
            </button>
          ))}
        </div>
        {answered && (
          <>
            <div className={`p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 ${selectedAnswer === question.correct ? 'bg-green-50' : 'bg-amber-50'}`}>
              <p className="text-xs sm:text-sm">{question.explanation}</p>
            </div>
            <button onClick={handleNext} className="w-full py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg font-medium text-sm sm:text-base">
              {currentQuestion < topic.questions.length - 1 ? 'Weiter' : 'Ergebnis'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

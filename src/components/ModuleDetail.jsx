import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronRight, CheckCircle, ChevronLeft, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, X, Headphones, Layers, Share2, FileText, ListChecks } from 'lucide-react';
import { useProgress, useAudioProgress, useFlashcardProgress } from '../lib/database';
import { getLernhilfen } from '../lib/contentLoader';
import MindMapMarkmap from './mindmap/MindMapMarkmap';
import PdfViewer from './pdf/PdfViewer';
import { Button } from '@/components/ui/button';

// ============================================
// AUDIO PLAYER KOMPONENTE
// ============================================
function AudioPlayer({ audioData, modulId }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const { audioProgress, loading: progressLoading, saveAudioProgress, getAudioProgress } = useAudioProgress();

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  // Auto-load: Restore saved position when audio and progress data are ready
  useEffect(() => {
    // Wait for all data to be loaded
    if (!progressLoading && !isLoading && audioRef.current && !hasRestoredPosition) {
      const savedPosition = audioProgress[modulId] || 0;

      if (savedPosition > 0) {
        // Set both audio element and state to keep them in sync
        audioRef.current.currentTime = savedPosition;
        setCurrentTime(savedPosition);
      }
      setHasRestoredPosition(true);
    }
  }, [progressLoading, isLoading, audioProgress, modulId, hasRestoredPosition]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    saveAudioProgress(modulId, 0);
  };

  // Save progress every 5 seconds while playing
  useEffect(() => {
    let saveInterval;
    if (isPlaying && audioRef.current) {
      saveInterval = setInterval(() => {
        if (audioRef.current) {
          saveAudioProgress(modulId, audioRef.current.currentTime);
        }
      }, 5000);
    }
    return () => clearInterval(saveInterval);
  }, [isPlaying, modulId, saveAudioProgress]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        // Save position when pausing
        saveAudioProgress(modulId, audioRef.current.currentTime);
      } else {
        // Always restore saved position before playing
        const savedPosition = getAudioProgress(modulId);
        if (savedPosition > 0) {
          audioRef.current.currentTime = savedPosition;
          // Force update the state immediately
          setCurrentTime(savedPosition);
        }

        setIsBuffering(true);
        await audioRef.current.play();
        setIsPlaying(true);
        setIsBuffering(false);
      }
    } catch (err) {
      console.error('Playback error:', err);
      setError('Audio konnte nicht abgespielt werden');
      setIsPlaying(false);
      setIsBuffering(false);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    saveAudioProgress(modulId, newTime);
  };

  const skip = (seconds) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioData.url) {
    return (
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
            <Headphones className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{audioData.title}</h3>
            <p className="text-sm text-slate-400">Audio wird bald verfügbar sein...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <audio
        ref={audioRef}
        src={audioData.url}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => setError('Audio konnte nicht geladen werden')}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onPlaying={() => setIsBuffering(false)}
        preload="auto"
      />

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
          <Headphones className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{audioData.title}</h3>
          <p className="text-sm text-slate-400">
            {isLoading ? 'Lädt...' : audioData.description}
          </p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm border border-red-200">{error}</div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <button onClick={() => skip(-10)} className="p-2 text-slate-400 hover:text-slate-600 transition">
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading || isBuffering}
              className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-emerald-700 transition flex-shrink-0 disabled:opacity-50"
            >
              {isBuffering ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button onClick={() => skip(10)} className="p-2 text-slate-400 hover:text-slate-600 transition">
              <SkipForward className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
                <div
                  className="h-full bg-emerald-600 transition-all duration-100 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <button onClick={toggleMute} className="p-2 text-slate-400 hover:text-slate-600 transition">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// KARTEIKARTEN KOMPONENTE (Preview)
// ============================================
function Flashcards({ flashcardsData, onOpenFullscreen }) {
  if (!flashcardsData || flashcardsData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Karteikarten</h3>
            <p className="text-sm text-slate-400">Noch keine Karten verfügbar</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-400 flex-1 flex items-center justify-center">
          <p>Karteikarten werden bald hinzugefügt...</p>
        </div>
      </div>
    );
  }

  const card = flashcardsData[0];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
          <Layers className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">Karteikarten</h3>
          <p className="text-sm text-emerald-600">{flashcardsData.length} Karten verfügbar</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-5 mb-4 border border-slate-100 flex-1 flex flex-col justify-center min-h-[140px]">
        <p className="text-xs text-emerald-600 font-medium mb-3 uppercase tracking-wide">Vorschau</p>
        <p className="text-slate-700 leading-relaxed line-clamp-3">{card.question}</p>
      </div>

      <button
        onClick={onOpenFullscreen}
        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
      >
        Karteikarten üben
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================
// KARTEIKARTEN FULLSCREEN MODAL
// ============================================
function FlashcardsModal({ flashcardsData, modulId, onClose }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { progress, markAsReviewed, toggleMastered, getCardProgress, getModuleStats } = useFlashcardProgress(modulId);

  // Generate card ID if not present
  const getCardId = (card, index) => {
    return card.id || `modul${modulId}-card-${index}`;
  };

  // Track when a card is viewed
  useEffect(() => {
    const cardId = getCardId(flashcardsData[currentCard], currentCard);
    markAsReviewed(cardId);
  }, [currentCard, flashcardsData, modulId]);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard((prev) => (prev + 1) % flashcardsData.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard((prev) => (prev - 1 + flashcardsData.length) % flashcardsData.length);
    }, 150);
  };

  const markAsKnown = async () => {
    const cardId = getCardId(flashcardsData[currentCard], currentCard);
    await toggleMastered(cardId);
    nextCard();
  };

  const resetCards = () => {
    setCurrentCard(0);
    setIsFlipped(false);
  };

  const card = flashcardsData[currentCard];
  const stats = getModuleStats();
  const progressPercent = stats.percentageMastered;

  // Check if current card is mastered
  const currentCardId = getCardId(card, currentCard);
  const isCardMastered = getCardProgress(currentCardId).mastered;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-[#0F172A] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-emerald-400" />
              <div>
                <h2 className="font-semibold">Karteikarten</h2>
                <p className="text-slate-400 text-sm">{stats.mastered} von {flashcardsData.length} gemeistert ({progressPercent}%)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 bg-white/10 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-600">Karte {currentCard + 1} von {flashcardsData.length}</span>
          <button onClick={resetCards} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Neustart
          </button>
        </div>

        <div className="p-6">
          <div
            className="relative h-64 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative w-full h-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              <div
                className="absolute inset-0 bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <p className="text-xs text-emerald-600 font-medium mb-3 tracking-wide">FRAGE</p>
                <p className="text-slate-900 text-center text-lg leading-relaxed">{card.question}</p>
                <p className="text-sm text-slate-400 mt-6 text-center">Tippen zum Umdrehen</p>
              </div>

              <div
                className="absolute inset-0 bg-[#0F172A] rounded-xl p-6 flex flex-col justify-center"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <p className="text-xs text-emerald-400 font-medium mb-3 tracking-wide">ANTWORT</p>
                <p className="text-white text-center text-lg leading-relaxed">{card.answer}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center justify-between gap-4">
            <button onClick={prevCard} className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-600">
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-3 flex-1 justify-center">
              <button
                onClick={nextCard}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition"
              >
                Nochmal üben
              </button>
              <button
                onClick={markAsKnown}
                className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                  isCardMastered
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                {isCardMastered ? 'Gemeistert' : 'Gewusst!'}
              </button>
            </div>

            <button onClick={nextCard} className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-600">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="flex gap-1 justify-center flex-wrap">
            {flashcardsData.map((c, i) => {
              const cardId = getCardId(c, i);
              const cardProgress = getCardProgress(cardId);
              return (
                <button
                  key={i}
                  onClick={() => { setCurrentCard(i); setIsFlipped(false); }}
                  className={`w-3 h-3 rounded-full transition ${
                    i === currentCard ? 'bg-emerald-600 scale-125' :
                    cardProgress.mastered ? 'bg-emerald-300' : 'bg-slate-300'
                  }`}
                  title={cardProgress.mastered ? 'Gemeistert' : 'Noch nicht gemeistert'}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MIND MAP PREVIEW
// ============================================
function MindMapPreview({ mindmapData, onOpen }) {
  const topics = mindmapData.topics || [];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-[#0F172A] rounded-xl flex items-center justify-center text-white">
          <Share2 className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">Mind Map</h3>
          <p className="text-sm text-slate-400">Visualisiere die Zusammenhänge</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 flex-1 flex items-center justify-center min-h-[140px]">
        <svg viewBox="0 0 280 140" className="w-full h-full max-h-36">
          {/* Lines in background */}
          {topics.slice(0, 7).map((topic, i) => {
            const angle = -Math.PI/2 + (i * 2 * Math.PI) / Math.min(topics.length, 7);
            const cx = 140 + 80 * Math.cos(angle);
            const cy = 70 + 55 * Math.sin(angle);
            return (
              <line
                key={`line-${topic.id}`}
                x1="140" y1="70" x2={cx} y2={cy}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
            );
          })}

          {/* Topic nodes */}
          {topics.slice(0, 7).map((topic, i) => {
            const angle = -Math.PI/2 + (i * 2 * Math.PI) / Math.min(topics.length, 7);
            const cx = 140 + 80 * Math.cos(angle);
            const cy = 70 + 55 * Math.sin(angle);
            return (
              <ellipse
                key={topic.id}
                cx={cx} cy={cy}
                rx="28" ry="12"
                fill="#cbd5e1"
                fillOpacity="0.8"
              />
            );
          })}

          {/* Center node */}
          <circle cx="140" cy="70" r="32" fill="#0F172A"/>
        </svg>
      </div>

      <button
        onClick={onOpen}
        className="w-full py-3 bg-[#0F172A] text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
      >
        Mind Map öffnen
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================
// PDF PREVIEW
// ============================================
function PdfPreview({ pdfData, onOpen }) {
  const topics = pdfData.topics || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0F172A] rounded-lg flex items-center justify-center text-white">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Unterlagen</h3>
            <p className="text-xs text-slate-400">Schulungsmaterialien</p>
          </div>
        </div>
      </div>

      {/* Inhaltsverzeichnis */}
      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Inhalte</p>
        <p className="text-sm font-medium text-slate-700 mb-3">{pdfData.title}</p>
        <div className="space-y-2">
          {topics.map((topic, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
              <span className="text-slate-300 mt-0.5 text-xs">{i + 1}.</span>
              <span>{topic}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Button */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onOpen}
          className="w-full py-2.5 bg-[#0F172A] text-white rounded-lg font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
        >
          Unterlagen öffnen
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// MIND MAP MODAL
// ============================================
// THEMEN LISTE
// ============================================
function TopicsList({ module, onSelectTopic, progress }) {
  const isTopicCompleted = (topicId) => {
    return progress.some(p => p.modul_id === module.id && p.topic_id === topicId && p.completed);
  };

  const completedCount = module.topics.filter(t => isTopicCompleted(t.id)).length;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-full flex flex-col">
      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <ListChecks className="w-5 h-5 text-emerald-600" />
        Quiz
        <span className="text-sm font-normal text-slate-400">{completedCount}/{module.topics.length}</span>
      </h3>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {module.topics.map((topic, i) => {
          const completed = isTopicCompleted(topic.id);
          return (
            <div
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition ${
                completed ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {completed ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm block truncate ${completed ? 'text-emerald-800' : 'text-slate-700'}`}>
                  {topic.title}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 ${completed ? 'text-emerald-400' : 'text-slate-400'}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// HAUPTKOMPONENTE: MODULE DETAIL
// ============================================
function ModuleDetail({ module, onBack, onSelectTopic }) {
  const { progress } = useProgress();
  const [showMindMap, setShowMindMap] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  const lernhilfen = getLernhilfen(module.id);

  const completedTopics = module.topics.filter(t =>
    progress.some(p => p.modul_id === module.id && p.topic_id === t.id && p.completed)
  ).length;
  const progressPercent = Math.round((completedTopics / module.topics.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#0F172A] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={onBack} className="gap-2 text-slate-400 hover:text-white hover:bg-white/10 -ml-2 mb-3">
            <ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-white/10 rounded-xl flex items-center justify-center text-3xl border border-white/10">
              {module.icon}
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-sm font-medium">Modul {module.id}</p>
              <h1 className="text-xl font-semibold">{module.title}</h1>
              <p className="text-slate-400 text-sm">{module.description}</p>
            </div>
          </div>

          <div className="mt-4 bg-white/10 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-slate-400 text-xs mt-1.5">{progressPercent}% abgeschlossen</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content (left) */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Audio */}
            {lernhilfen?.audio && (
              <AudioPlayer audioData={lernhilfen.audio} modulId={module.id} />
            )}

            {/* Lernhilfen Grid — 2 Spalten */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Lernhilfen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lernhilfen?.flashcards && (
                  <Flashcards flashcardsData={lernhilfen.flashcards} onOpenFullscreen={() => setShowFlashcards(true)} />
                )}
                {lernhilfen?.mindmap && (
                  <MindMapPreview mindmapData={lernhilfen.mindmap} onOpen={() => setShowMindMap(true)} />
                )}
              </div>
            </div>

            {/* Quiz / Themen (volle Breite) */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Quiz & Themen</h2>
              <TopicsList module={module} onSelectTopic={onSelectTopic} progress={progress} />
            </div>
          </div>

          {/* Sidebar (right) — Unterlagen / PDF */}
          {lernhilfen?.pdf && (
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
              <div className="lg:sticky lg:top-20">
                <PdfPreview pdfData={lernhilfen.pdf} onOpen={() => setShowPdf(true)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showMindMap && lernhilfen?.mindmap && (
        <MindMapMarkmap mindmapData={lernhilfen.mindmap} onClose={() => setShowMindMap(false)} />
      )}

      {showFlashcards && lernhilfen?.flashcards && lernhilfen.flashcards.length > 0 && (
        <FlashcardsModal flashcardsData={lernhilfen.flashcards} modulId={module.id} onClose={() => setShowFlashcards(false)} />
      )}

      {showPdf && lernhilfen?.pdf && (
        <PdfViewer pdfData={lernhilfen.pdf} modulId={module.id} onClose={() => setShowPdf(false)} />
      )}
    </div>
  );
}

export default ModuleDetail;

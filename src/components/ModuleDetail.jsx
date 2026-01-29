import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronRight, CheckCircle, ChevronLeft, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, X, Maximize2 } from 'lucide-react';
import { useProgress, useAudioProgress } from '../lib/database';
import { getLernhilfen } from '../modules/lernhilfen';

// ============================================
// AUDIO PLAYER KOMPONENTE
// ============================================
function AudioPlayer({ audioData, modulId }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { saveAudioProgress, getAudioProgress } = useAudioProgress();

  // Lade gespeicherten Fortschritt beim Start
  useEffect(() => {
    const savedPosition = getAudioProgress(modulId);
    if (savedPosition && audioRef.current) {
      audioRef.current.currentTime = savedPosition;
      setCurrentTime(savedPosition);
    }
  }, [modulId, getAudioProgress]);

  // Speichere Fortschritt alle 5 Sekunden während der Wiedergabe
  useEffect(() => {
    let saveInterval;
    if (isPlaying) {
      saveInterval = setInterval(() => {
        if (audioRef.current) {
          saveAudioProgress(modulId, audioRef.current.currentTime);
        }
      }, 5000);
    }
    return () => clearInterval(saveInterval);
  }, [isPlaying, modulId, saveAudioProgress]);

  // Speichere Fortschritt beim Pausieren
  const handlePause = () => {
    if (audioRef.current) {
      saveAudioProgress(modulId, audioRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioData.url) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      handlePause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Playback error:', err);
        setError('Audio konnte nicht abgespielt werden');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
      
      // Setze gespeicherte Position
      const savedPosition = getAudioProgress(modulId);
      if (savedPosition) {
        audioRef.current.currentTime = savedPosition;
      }
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      saveAudioProgress(modulId, newTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    saveAudioProgress(modulId, 0); // Reset beim Ende
  };

  const skip = (seconds) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Wenn keine Audio-URL vorhanden
  if (!audioData.url) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg text-xl">
            🎧
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{audioData.title}</h3>
            <p className="text-sm text-gray-500">Audio wird bald verfügbar sein...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioData.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setError('Audio konnte nicht geladen werden')}
        preload="metadata"
      />

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg text-xl">
          🎧
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{audioData.title}</h3>
          <p className="text-sm text-gray-500">
            {isLoading ? 'Lädt...' : audioData.description}
          </p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex items-center gap-3 mb-3">
            {/* Skip Back */}
            <button 
              onClick={() => skip(-10)}
              className="p-2 text-gray-500 hover:text-gray-700 transition"
              title="-10 Sekunden"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Play/Pause */}
            <button 
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition flex-shrink-0 disabled:opacity-50"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            {/* Skip Forward */}
            <button 
              onClick={() => skip(10)}
              className="p-2 text-gray-500 hover:text-gray-700 transition"
              title="+10 Sekunden"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Progress Bar */}
            <div className="flex-1">
              <div 
                className="h-2 bg-amber-200 rounded-full overflow-hidden cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume */}
            <button 
              onClick={toggleMute}
              className="p-2 text-gray-500 hover:text-gray-700 transition"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Resume indicator */}
          {currentTime > 0 && !isPlaying && (
            <p className="text-xs text-amber-600 mt-2">
              ▶️ Fortsetzen bei {formatTime(currentTime)}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// KARTEIKARTEN KOMPONENTE
// ============================================
function Flashcards({ flashcardsData, onOpenFullscreen }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);

  // Prüfe ob Flashcards vorhanden sind
  if (!flashcardsData || flashcardsData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
            📇
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Karteikarten</h3>
            <p className="text-xs text-gray-500">Noch keine Karten verfügbar</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 text-center text-gray-500">
          <p>Karteikarten werden bald hinzugefügt...</p>
        </div>
      </div>
    );
  }

  const card = flashcardsData[currentCard];

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
            📇
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Karteikarten</h3>
            <p className="text-xs text-gray-500">{flashcardsData.length} Karten verfügbar</p>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-white rounded-xl p-4 mb-4 border border-emerald-100">
        <p className="text-xs text-emerald-600 font-medium mb-2">VORSCHAU</p>
        <p className="text-gray-800 text-sm line-clamp-2">{card.question}</p>
      </div>

      <button 
        onClick={onOpenFullscreen}
        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition shadow-lg text-sm"
      >
        Karteikarten üben →
      </button>
    </div>
  );
}

// ============================================
// KARTEIKARTEN FULLSCREEN MODAL
// ============================================
function FlashcardsModal({ flashcardsData, onClose }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);

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

  const markAsKnown = () => {
    if (!knownCards.includes(currentCard)) {
      setKnownCards([...knownCards, currentCard]);
    }
    nextCard();
  };

  const resetCards = () => {
    setCurrentCard(0);
    setKnownCards([]);
    setIsFlipped(false);
  };

  const card = flashcardsData[currentCard];
  const progress = Math.round((knownCards.length / flashcardsData.length) * 100);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📇</span>
              <div>
                <h2 className="font-bold">Karteikarten</h2>
                <p className="text-emerald-100 text-sm">{knownCards.length} von {flashcardsData.length} gewusst ({progress}%)</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card Counter */}
        <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
          <span className="text-sm text-gray-600">Karte {currentCard + 1} von {flashcardsData.length}</span>
          <button 
            onClick={resetCards}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Neustart
          </button>
        </div>

        {/* Flip Card */}
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
              {/* Front - Question */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg border border-gray-200 flex flex-col justify-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <p className="text-xs text-emerald-600 font-semibold mb-3 tracking-wide">FRAGE</p>
                <p className="text-gray-800 font-medium text-center text-lg leading-relaxed">{card.question}</p>
                <p className="text-sm text-gray-400 mt-6 text-center">👆 Tippen zum Umdrehen</p>
              </div>
              
              {/* Back - Answer */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg flex flex-col justify-center"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <p className="text-xs text-emerald-100 font-semibold mb-3 tracking-wide">ANTWORT</p>
                <p className="text-white font-medium text-center text-lg leading-relaxed">{card.answer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between gap-4">
            <button 
              onClick={prevCard}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-600"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex gap-3 flex-1 justify-center">
              <button 
                onClick={nextCard}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                Nochmal üben
              </button>
              <button 
                onClick={markAsKnown}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Gewusst!
              </button>
            </div>
            
            <button 
              onClick={nextCard}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-600"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Card Indicators */}
        <div className="px-6 pb-4">
          <div className="flex gap-1 justify-center flex-wrap">
            {flashcardsData.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentCard(i); setIsFlipped(false); }}
                className={`w-3 h-3 rounded-full transition ${
                  i === currentCard ? 'bg-emerald-500 scale-125' : 
                  knownCards.includes(i) ? 'bg-emerald-300' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MIND MAP PREVIEW & MODAL
// ============================================
function MindMapPreview({ mindmapData, onOpen }) {
  const topics = mindmapData.topics || [];
  
  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
          🧠
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Mind Map</h3>
          <p className="text-xs text-gray-500">Visualisiere die Zusammenhänge</p>
        </div>
      </div>

      {/* Mini Preview */}
      <div className="bg-white rounded-xl p-3 mb-4 border border-violet-100">
        <svg viewBox="0 0 280 120" className="w-full h-24">
          {/* Center */}
          <rect x="105" y="45" width="70" height="30" rx="15" fill="#8b5cf6"/>
          <text x="140" y="64" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
            {mindmapData.centerLabel?.split(' ')[0] || 'Thema'}
          </text>
          
          {/* Branches - dynamisch basierend auf Topics */}
          {topics.slice(0, 6).map((topic, i) => {
            const angle = -Math.PI/2 + (i * 2 * Math.PI) / Math.min(topics.length, 6);
            const cx = 140 + 70 * Math.cos(angle);
            const cy = 60 + 40 * Math.sin(angle);
            return (
              <g key={topic.id}>
                <line x1="140" y1="60" x2={cx} y2={cy} stroke={topic.color} strokeWidth="1.5" strokeOpacity="0.5"/>
                <rect x={cx - 25} y={cy - 10} width="50" height="20" rx="10" fill={topic.color} fillOpacity="0.2" stroke={topic.color} strokeWidth="1"/>
              </g>
            );
          })}
        </svg>
      </div>

      <button 
        onClick={onOpen}
        className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-700 transition shadow-lg text-sm"
      >
        Mind Map öffnen →
      </button>
    </div>
  );
}

// ============================================
// MIND MAP MODAL (VOLLBILD)
// ============================================
function MindMapModal({ mindmapData, onClose }) {
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const topics = mindmapData.topics || [];
  
  const width = 1000, height = 600;
  const centerX = width / 2, centerY = height / 2;
  const topicRadius = 160;

  const getTopicPosition = (index, total) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
    return { 
      x: centerX + topicRadius * Math.cos(angle), 
      y: centerY + topicRadius * Math.sin(angle), 
      angle 
    };
  };

  const getDetailPositions = (topicPos, details, topicAngle) => {
    const positions = [];
    for (let i = 0; i < details.length; i++) {
      const distance = 80 + i * 32;
      positions.push({
        x: topicPos.x + distance * Math.cos(topicAngle),
        y: topicPos.y + distance * Math.sin(topicAngle),
        label: details[i]
      });
    }
    return positions;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h2 className="font-bold">Mind Map</h2>
              <p className="text-violet-200 text-sm">{mindmapData.centerLabel}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-2 bg-violet-50 text-xs text-violet-700 text-center">
          Klicke auf ein Thema um Details zu sehen
        </div>
        
        {/* SVG Mind Map */}
        <div className="overflow-auto bg-gray-50" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
            <defs>
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
              </filter>
            </defs>

            {/* Lines: Center -> Topics */}
            {topics.map((topic, i) => {
              const pos = getTopicPosition(i, topics.length);
              const isExpanded = expandedTopic === topic.id;
              return (
                <line key={`line-${topic.id}`} x1={centerX} y1={centerY} x2={pos.x} y2={pos.y}
                  stroke={topic.color} strokeWidth={isExpanded ? 3 : 2} strokeOpacity={isExpanded ? 0.6 : 0.25}
                />
              );
            })}

            {/* Lines: Topic -> Details */}
            {expandedTopic && topics.map((topic, i) => {
              if (topic.id !== expandedTopic) return null;
              const topicPos = getTopicPosition(i, topics.length);
              const details = getDetailPositions(topicPos, topic.details, topicPos.angle);
              return details.map((dp, j) => {
                const prevPos = j === 0 ? topicPos : details[j - 1];
                return (
                  <line key={`detail-line-${j}`} x1={prevPos.x} y1={prevPos.y} x2={dp.x} y2={dp.y}
                    stroke={topic.color} strokeWidth="2" strokeOpacity="0.4"
                  />
                );
              });
            })}

            {/* Details */}
            {expandedTopic && topics.map((topic, i) => {
              if (topic.id !== expandedTopic) return null;
              const topicPos = getTopicPosition(i, topics.length);
              const details = getDetailPositions(topicPos, topic.details, topicPos.angle);
              return details.map((dp, j) => (
                <g key={`detail-${j}`}>
                  <rect 
                    x={dp.x - 100} y={dp.y - 12} width={200} height={24} rx={12}
                    fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1"
                  />
                  <text x={dp.x} y={dp.y + 4} textAnchor="middle" fill="#334155" fontSize="10" fontWeight="500">
                    {dp.label}
                  </text>
                </g>
              ));
            })}

            {/* Topics */}
            {topics.map((topic, i) => {
              const pos = getTopicPosition(i, topics.length);
              const isExpanded = expandedTopic === topic.id;
              const isOther = expandedTopic && expandedTopic !== topic.id;
              return (
                <g key={topic.id} 
                  onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                  style={{ cursor: 'pointer', opacity: isOther ? 0.4 : 1 }}
                >
                  <rect 
                    x={pos.x - 60} y={pos.y - 20} width={120} height={40} rx={20}
                    fill={topic.color} filter="url(#shadow)"
                    stroke={isExpanded ? '#fff' : 'transparent'} strokeWidth={isExpanded ? 2 : 0}
                  />
                  <text x={pos.x + 40} y={pos.y + 5} fill="rgba(255,255,255,0.9)" fontSize="14" fontWeight="bold">
                    {isExpanded ? '−' : '+'}
                  </text>
                  <text x={pos.x - 5} y={pos.y + 5} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600">
                    {topic.title}
                  </text>
                </g>
              );
            })}

            {/* Center Node */}
            <g>
              <rect x={centerX - 70} y={centerY - 30} width={140} height={60} rx={30}
                fill="url(#centerGrad)" filter="url(#shadow)"/>
              <defs>
                <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
              <text x={centerX} y={centerY - 5} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
                {mindmapData.centerLabel?.split(' ').slice(0, 2).join(' ')}
              </text>
              <text x={centerX} y={centerY + 10} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="9">
                {topics.length} Themen
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ============================================
// THEMEN LISTE (Lektionen)
// ============================================
function TopicsList({ module, onSelectTopic, progress }) {
  const isTopicCompleted = (topicId) => {
    return progress.some(p => p.modul_id === module.id && p.topic_id === topicId && p.completed);
  };

  const completedCount = module.topics.filter(t => isTopicCompleted(t.id)).length;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        📚 Lektionen
        <span className="text-sm font-normal text-gray-500">
          {completedCount}/{module.topics.length}
        </span>
      </h3>
      
      <div className="space-y-2">
        {module.topics.map((topic, i) => {
          const completed = isTopicCompleted(topic.id);
          return (
            <div 
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition ${
                completed 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {completed ? '✓' : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm block truncate ${completed ? 'text-green-800' : 'text-gray-700'}`}>
                  {topic.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          );
        })}
      </div>
      
      <button 
        onClick={() => module.topics[0] && onSelectTopic(module.topics[0])}
        className="w-full mt-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition text-sm"
      >
        Quiz starten →
      </button>
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
  
  // Hole Lernhilfen für dieses Modul
  const lernhilfen = getLernhilfen(module.id);
  
  // Berechne Fortschritt
  const completedTopics = module.topics.filter(t => 
    progress.some(p => p.modul_id === module.id && p.topic_id === t.id && p.completed)
  ).length;
  const progressPercent = Math.round((completedTopics / module.topics.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${module.color} text-white`}>
        <div className="max-w-6xl mx-auto px-4 py-5">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-white/80 hover:text-white mb-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Zurück zum Dashboard
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
              {module.icon}
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-sm">Modul {module.id}</p>
              <h1 className="text-xl font-bold">{module.title}</h1>
              <p className="text-white/80 text-sm">{module.description}</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-white/80 text-xs mt-1">{progressPercent}% abgeschlossen</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Linke Spalte - Lernhilfen */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-lg font-bold text-gray-900">🎯 Lernhilfen</h2>
            
            {/* Audio Player */}
            {lernhilfen?.audio && (
              <AudioPlayer audioData={lernhilfen.audio} modulId={module.id} />
            )}
            
            {/* Grid für Karteikarten und Mind Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {lernhilfen?.flashcards && (
                <Flashcards 
                  flashcardsData={lernhilfen.flashcards} 
                  onOpenFullscreen={() => setShowFlashcards(true)}
                />
              )}
              {lernhilfen?.mindmap && (
                <MindMapPreview 
                  mindmapData={lernhilfen.mindmap} 
                  onOpen={() => setShowMindMap(true)} 
                />
              )}
            </div>
          </div>
          
          {/* Rechte Spalte - Themen */}
          <div>
            <TopicsList 
              module={module} 
              onSelectTopic={onSelectTopic} 
              progress={progress}
            />
          </div>
        </div>
      </div>

      {/* Mind Map Modal */}
      {showMindMap && lernhilfen?.mindmap && (
        <MindMapModal 
          mindmapData={lernhilfen.mindmap} 
          onClose={() => setShowMindMap(false)} 
        />
      )}

      {/* Flashcards Modal */}
      {showFlashcards && lernhilfen?.flashcards && lernhilfen.flashcards.length > 0 && (
        <FlashcardsModal 
          flashcardsData={lernhilfen.flashcards} 
          onClose={() => setShowFlashcards(false)} 
        />
      )}
    </div>
  );
}

export default ModuleDetail;

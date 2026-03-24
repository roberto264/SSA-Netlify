import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Loader2, Brain, BookOpen, Target, TrendingUp, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useProgress, useQuizResults, useRollenspiele } from '../lib/database';
import { modules } from '../lib/contentLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function AITutor({ onBack }) {
  const { profile } = useAuth();
  const { progress } = useProgress();
  const { results: quizResults } = useQuizResults();
  const { sessions: rollenspielSessions } = useRollenspiele();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [audioLevels, setAudioLevels] = useState(new Array(20).fill(0));
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const analyzerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const analyzeProgress = () => {
    const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);
    const completedTopics = progress.filter(p => p.completed).length;
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const moduleProgress = modules.map(module => {
      const moduleTopics = module.topics.length;
      const completed = progress.filter(p => p.modul_id === module.id && p.completed).length;
      const percent = moduleTopics > 0 ? Math.round((completed / moduleTopics) * 100) : 0;
      return { ...module, completed, total: moduleTopics, percent };
    });

    const weakAreas = [];
    const strongAreas = [];

    moduleProgress.forEach(m => {
      if (m.percent < 50) {
        weakAreas.push({ type: 'module', name: m.title, reason: `Nur ${m.percent}% abgeschlossen` });
      } else if (m.percent === 100) {
        strongAreas.push({ type: 'module', name: m.title });
      }
    });

    const failedQuizzes = quizResults.filter(q => !q.passed);
    const passedQuizzes = quizResults.filter(q => q.passed);

    failedQuizzes.forEach(quiz => {
      const module = modules.find(m => m.id === quiz.modul_id);
      const topic = module?.topics.find(t => t.id === quiz.topic_id);
      if (topic && !weakAreas.find(w => w.name === topic.title)) {
        weakAreas.push({
          type: 'quiz',
          name: topic.title,
          module: module?.title,
          reason: `Quiz nicht bestanden (${quiz.score}/${quiz.max_score})`
        });
      }
    });

    const avgSoftSkills = {
      gesprachsfuhrung: 0, aktives_zuhoren: 0, klarheit: 0,
      einwand_behandlung: 0, empathie: 0, uberzeugungskraft: 0
    };

    if (rollenspielSessions.length > 0) {
      Object.keys(avgSoftSkills).forEach(key => {
        const values = rollenspielSessions.filter(s => s[key]).map(s => s[key]);
        avgSoftSkills[key] = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
      });
    }

    const weakSoftSkills = Object.entries(avgSoftSkills)
      .filter(([_, value]) => value > 0 && value < 3)
      .map(([key, value]) => ({ name: formatSoftSkill(key), score: value }));

    const strongSoftSkills = Object.entries(avgSoftSkills)
      .filter(([_, value]) => value >= 4)
      .map(([key, value]) => ({ name: formatSoftSkill(key), score: value }));

    return {
      overallProgress, completedTopics, totalTopics, moduleProgress,
      weakAreas, strongAreas,
      quizStats: { total: quizResults.length, passed: passedQuizzes.length, failed: failedQuizzes.length },
      rollenspielCount: rollenspielSessions.length,
      weakSoftSkills, strongSoftSkills, avgSoftSkills
    };
  };

  const formatSoftSkill = (key) => {
    const names = {
      gesprachsfuhrung: 'Gesprächsführung', aktives_zuhoren: 'Aktives Zuhören',
      klarheit: 'Klarheit', einwand_behandlung: 'Einwandbehandlung',
      empathie: 'Empathie', uberzeugungskraft: 'Überzeugungskraft'
    };
    return names[key] || key;
  };

  const analysis = analyzeProgress();

  const generateSystemPrompt = () => {
    const a = analysis;
    return `Du bist ein freundlicher und motivierender AI-Tutor der Swiss Solar Academy. Dein Name ist "Solar-Coach".

WICHTIG: Du sprichst Deutsch (Schweizer Hochdeutsch) und duzt den Lernenden.

## Über den Lernenden: ${profile?.name || 'Unbekannt'}
- Firma: ${profile?.firma || 'Unbekannt'}
- Gesamtfortschritt: ${a.overallProgress}% (${a.completedTopics}/${a.totalTopics} Themen)

## Modulfortschritt:
${a.moduleProgress.map(m => `- ${m.title}: ${m.percent}% (${m.completed}/${m.total})`).join('\n')}

## Stärken:
${a.strongAreas.length > 0 ? a.strongAreas.map(s => `- ${s.name}`).join('\n') : '- Noch keine Module vollständig abgeschlossen'}
${a.strongSoftSkills.length > 0 ? a.strongSoftSkills.map(s => `- ${s.name} (${s.score}/5 Sterne)`).join('\n') : ''}

## Schwächen / Verbesserungspotential:
${a.weakAreas.length > 0 ? a.weakAreas.map(w => `- ${w.name}: ${w.reason}`).join('\n') : '- Keine offensichtlichen Schwächen'}
${a.weakSoftSkills.length > 0 ? a.weakSoftSkills.map(s => `- ${s.name} (nur ${s.score}/5 Sterne)`).join('\n') : ''}

## Quiz-Statistik:
- ${a.quizStats.passed} bestanden, ${a.quizStats.failed} nicht bestanden

## Rollenspiele: ${a.rollenspielCount} durchgeführt

## Deine Aufgabe:
1. Begrüsse den Lernenden persönlich und gib eine kurze Zusammenfassung seines Lernstands
2. Identifiziere die wichtigsten Verbesserungsbereiche
3. Biete an, ein bestimmtes Thema zu erklären oder zu üben
4. Stelle Verständnisfragen, um das Wissen zu testen
5. Gib konstruktives Feedback und motiviere

## Modulinhalte die du erklären kannst:
${modules.map(m => `
### ${m.title}
${m.topics.map(t => `- ${t.title}: ${t.description}`).join('\n')}
`).join('\n')}

Halte deine Antworten prägnant (max. 150 Wörter). Sei ermutigend aber ehrlich.`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (progress !== undefined) {
      const greeting = generateGreeting();
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [progress, profile]);

  const generateGreeting = () => {
    const a = analyzeProgress();
    const name = profile?.name?.split(' ')[0] || 'Lernender';

    let greeting = `Hallo ${name}! Ich bin dein persönlicher Solar-Coach.\n\n`;
    greeting += `**Dein Lernstand:** ${a.overallProgress}% abgeschlossen\n\n`;

    if (a.weakAreas.length > 0) {
      greeting += `Ich sehe, dass du bei **${a.weakAreas[0].name}** noch Unterstützung gebrauchen könntest. `;
    }
    if (a.strongAreas.length > 0) {
      greeting += `Super gemacht bei **${a.strongAreas[0].name}**!\n\n`;
    }

    greeting += `Was möchtest du heute lernen? Ich kann dir:\n`;
    greeting += `- Ein Thema erklären\n`;
    greeting += `- Verständnisfragen stellen\n`;
    greeting += `- Bei schwierigen Konzepten helfen\n\n`;
    greeting += `Womit sollen wir anfangen?`;

    return greeting;
  };

  const sendMessage = async (text) => {
    if (!text.trim() || isProcessing) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInputText('');
    setIsProcessing(true);
    setShowAnalysis(false);

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: text }],
          systemPrompt: generateSystemPrompt()
        })
      });
      const result = await response.json();
      const reply = result.data?.choices?.[0]?.message?.content || result.choices?.[0]?.message?.content;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      if (ttsEnabled) {
        try {
          const ttsResponse = await fetch('/.netlify/functions/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: reply, voice: 'nova' })
          });
          const ttsResult = await ttsResponse.json();
          const audioBase64 = ttsResult.data?.audio || ttsResult.audio;
          if (audioBase64) {
            const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
            new Audio(URL.createObjectURL(audioBlob)).play();
          }
        } catch {
          // TTS not available, continue without audio
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 64;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      const updateLevels = () => {
        if (!analyzerRef.current) return;
        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
        analyzerRef.current.getByteFrequencyData(dataArray);
        const levels = [];
        const step = Math.floor(dataArray.length / 20);
        for (let i = 0; i < 20; i++) {
          levels.push(dataArray[i * step] / 255);
        }
        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();

      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/wav'];
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) { selectedMimeType = mimeType; break; }
      }

      const options = selectedMimeType ? { mimeType: selectedMimeType } : {};
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setAudioLevels(new Array(20).fill(0));

        const actualMimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];
          setIsTranscribing(true);
          try {
            const response = await fetch('/.netlify/functions/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64, mimeType: actualMimeType })
            });
            const result = await response.json();
            const text = result.data?.text || result.text;
            if (text) sendMessage(text);
          } catch (error) {
            console.error('Transcribe fetch error:', error);
          } finally {
            setIsTranscribing(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      analyzerRef.current = null;
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <Card className="lg:w-80 border-0 shadow-sm lg:h-full overflow-y-auto scrollbar-thin order-2 lg:order-1">
        <CardContent className="p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Dein Lernprofil
          </h3>

          <div className="mb-5">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Gesamtfortschritt</span>
              <span className="font-bold text-foreground">{analysis.overallProgress}%</span>
            </div>
            <Progress value={analysis.overallProgress} className="h-2" />
          </div>

          <div className="space-y-3">
            {analysis.moduleProgress.map(m => (
              <div key={m.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-foreground truncate">{m.icon} {m.title.split(' ').slice(0, 2).join(' ')}</span>
                  <span className="text-xs text-muted-foreground ml-2">{m.percent}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${m.color} rounded-full transition-all duration-500`} style={{ width: `${m.percent}%` }} />
                </div>
              </div>
            ))}
          </div>

          {analysis.weakAreas.length > 0 && (
            <div className="mt-6 pt-5 border-t">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-500" />
                Fokus-Bereiche
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.weakAreas.slice(0, 3).map((area, i) => (
                  <Badge key={i} variant="warning" className="text-xs">{area.name}</Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.strongAreas.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                Stärken
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.strongAreas.slice(0, 3).map((area, i) => (
                  <Badge key={i} variant="success" className="text-xs">{area.name}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col border-0 shadow-sm overflow-hidden order-1 lg:order-2">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold">Solar-Coach</h2>
                <p className="text-sm text-white/80">Dein persönlicher Lernassistent</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="text-white/80 hover:text-white hover:bg-white/20"
              title={ttsEnabled ? 'Sprache ausschalten' : 'Sprache einschalten'}
            >
              {ttsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
          {messages.length === 0 ? (
            <div className="bg-amber-50 rounded-xl p-4 mb-4">
              <p className="text-amber-800 text-sm">Hallo {profile?.name?.split(' ')[0] || 'Lernender'}!</p>
              <p className="text-amber-700 mt-2 text-sm">Basierend auf deinem Fortschritt empfehle ich dir, dich auf folgende Bereiche zu konzentrieren:</p>
              <ul className="mt-2 space-y-1 text-amber-700 text-sm">
                <li>- Vertiefung der Wirtschaftlichkeitsberechnung</li>
                <li>- Übung von Einwandbehandlung im Kundengespräch</li>
              </ul>
              <p className="text-amber-700 mt-2 text-sm">Wie kann ich dir heute helfen?</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    "max-w-[90%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-amber-50 text-amber-900 rounded-bl-md'
                  )}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-amber-50 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={cn(
                "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                isRecording
                  ? 'bg-destructive text-white shadow-lg shadow-destructive/30'
                  : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
              )}
            >
              <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {isRecording ? (
              <div className="flex-1 h-12 bg-destructive/5 rounded-xl flex items-center justify-center gap-[2px] px-4">
                {audioLevels.map((level, i) => (
                  <div
                    key={i}
                    className="w-1 bg-destructive rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, level * 40)}px` }}
                  />
                ))}
              </div>
            ) : isTranscribing ? (
              <div className="flex-1 h-12 bg-amber-50 rounded-xl flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                <span className="text-sm text-amber-600">Wird transkribiert...</span>
              </div>
            ) : (
              <Input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                placeholder="Frage stellen..."
                className="flex-1 h-12"
              />
            )}

            <Button
              size="icon-lg"
              onClick={() => sendMessage(inputText)}
              disabled={isProcessing || !inputText.trim() || isRecording || isTranscribing}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            {isRecording ? 'Aufnahme läuft... Loslassen zum Senden' : 'Halte den Mikrofon-Button gedrückt zum Aufnehmen'}
          </p>
        </div>
      </Card>
    </main>
  );
}

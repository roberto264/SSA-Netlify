import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Mic, Loader2, Brain, BookOpen, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useProgress, useQuizResults, useRollenspiele } from '../lib/database';
import { modules } from '../lib/contentLoader';

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
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Berechne Lernstand-Analyse
  const analyzeProgress = () => {
    const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);
    const completedTopics = progress.filter(p => p.completed).length;
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Modul-Fortschritt
    const moduleProgress = modules.map(module => {
      const moduleTopics = module.topics.length;
      const completed = progress.filter(p => p.modul_id === module.id && p.completed).length;
      const percent = moduleTopics > 0 ? Math.round((completed / moduleTopics) * 100) : 0;
      return { ...module, completed, total: moduleTopics, percent };
    });

    // Schwache Bereiche (Module < 50% oder mit fehlgeschlagenen Quiz)
    const weakAreas = [];
    const strongAreas = [];

    moduleProgress.forEach(m => {
      if (m.percent < 50) {
        weakAreas.push({ type: 'module', name: m.title, reason: `Nur ${m.percent}% abgeschlossen` });
      } else if (m.percent === 100) {
        strongAreas.push({ type: 'module', name: m.title });
      }
    });

    // Quiz-Analyse
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

    // Rollenspiel-Analyse
    const avgSoftSkills = {
      gesprachsfuhrung: 0,
      aktives_zuhoren: 0,
      klarheit: 0,
      einwand_behandlung: 0,
      empathie: 0,
      uberzeugungskraft: 0
    };

    if (rollenspielSessions.length > 0) {
      Object.keys(avgSoftSkills).forEach(key => {
        const values = rollenspielSessions.filter(s => s[key]).map(s => s[key]);
        avgSoftSkills[key] = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
      });
    }

    const weakSoftSkills = Object.entries(avgSoftSkills)
      .filter(([_, value]) => value > 0 && value < 3)
      .map(([key, value]) => ({ 
        name: formatSoftSkill(key), 
        score: value 
      }));

    const strongSoftSkills = Object.entries(avgSoftSkills)
      .filter(([_, value]) => value >= 4)
      .map(([key, value]) => ({ 
        name: formatSoftSkill(key), 
        score: value 
      }));

    return {
      overallProgress,
      completedTopics,
      totalTopics,
      moduleProgress,
      weakAreas,
      strongAreas,
      quizStats: {
        total: quizResults.length,
        passed: passedQuizzes.length,
        failed: failedQuizzes.length
      },
      rollenspielCount: rollenspielSessions.length,
      weakSoftSkills,
      strongSoftSkills,
      avgSoftSkills
    };
  };

  const formatSoftSkill = (key) => {
    const names = {
      gesprachsfuhrung: 'Gesprächsführung',
      aktives_zuhoren: 'Aktives Zuhören',
      klarheit: 'Klarheit',
      einwand_behandlung: 'Einwandbehandlung',
      empathie: 'Empathie',
      uberzeugungskraft: 'Überzeugungskraft'
    };
    return names[key] || key;
  };

  const analysis = analyzeProgress();

  // System Prompt für den AI Tutor
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

  // Initialnachricht - warten bis progress geladen ist
  useEffect(() => {
    if (progress !== undefined) {
      const greeting = generateGreeting();
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [progress, profile]);

  const generateGreeting = () => {
    const a = analyzeProgress();
    const name = profile?.name?.split(' ')[0] || 'Lernender';
    
    let greeting = `Hallo ${name}! 👋 Ich bin dein persönlicher Solar-Coach.\n\n`;
    
    greeting += `**Dein Lernstand:** ${a.overallProgress}% abgeschlossen\n\n`;
    
    if (a.weakAreas.length > 0) {
      greeting += `Ich sehe, dass du bei **${a.weakAreas[0].name}** noch Unterstützung gebrauchen könntest. `;
    }
    
    if (a.strongAreas.length > 0) {
      greeting += `Super gemacht bei **${a.strongAreas[0].name}**! 🎉\n\n`;
    }
    
    greeting += `Was möchtest du heute lernen? Ich kann dir:\n`;
    greeting += `• Ein Thema erklären\n`;
    greeting += `• Verständnisfragen stellen\n`;
    greeting += `• Bei schwierigen Konzepten helfen\n\n`;
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
      const data = await response.json();
      const reply = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      
      // Optional: TTS
      try {
        const ttsResponse = await fetch('/.netlify/functions/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: reply, voice: 'nova' })
        });
        const ttsData = await ttsResponse.json();
        if (ttsData.audio) {
          const audioBlob = new Blob([Uint8Array.from(atob(ttsData.audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
          new Audio(URL.createObjectURL(audioBlob)).play();
        }
      } catch (e) {
        console.log('TTS not available');
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
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];
          try {
            const response = await fetch('/.netlify/functions/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64 })
            });
            const data = await response.json();
            if (data.text) sendMessage(data.text);
          } catch (error) {
            console.error('Error:', error);
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4" />
        Zurück zum Dashboard
      </button>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Analyse Sidebar - hidden on mobile, shown as collapsed section */}
        <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              Dein Lernstand
            </h3>
            
            <div className="mb-3 sm:mb-4">
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span>Gesamtfortschritt</span>
                <span className="font-bold">{analysis.overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${analysis.overallProgress}%` }}></div>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              {analysis.moduleProgress.map(m => (
                <div key={m.id} className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">{m.icon} {m.title}</span>
                  <span className={`font-medium ${m.percent === 100 ? 'text-green-600' : m.percent > 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {m.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {analysis.weakAreas.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 sm:p-5 hidden sm:block">
              <h3 className="font-bold text-amber-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                Fokus-Bereiche
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-amber-700">
                {analysis.weakAreas.slice(0, 3).map((area, i) => (
                  <li key={i}>• {area.name}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.strongAreas.length > 0 && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-4 sm:p-5 hidden sm:block">
              <h3 className="font-bold text-green-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                Stärken
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                {analysis.strongAreas.slice(0, 3).map((area, i) => (
                  <li key={i}>✓ {area.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden order-1 lg:order-2">
          <div className="p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-amber-100 flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Solar-Coach</h3>
              <p className="text-xs sm:text-sm text-gray-500">Dein persönlicher AI-Tutor</p>
            </div>
          </div>

          <div className="h-64 sm:h-96 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] sm:max-w-[85%] p-2.5 sm:p-3 rounded-xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="whitespace-pre-wrap text-xs sm:text-sm">{msg.content}</div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-2.5 sm:p-3 rounded-xl">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-gray-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 sm:p-4 border-t border-gray-100 flex items-center gap-2 sm:gap-3">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`p-2.5 sm:p-3 rounded-full transition flex-shrink-0 ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
              placeholder="Frag mich etwas..."
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            />
            <button
              onClick={() => sendMessage(inputText)}
              disabled={isProcessing || !inputText.trim()}
              className="p-2.5 sm:p-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 transition flex-shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

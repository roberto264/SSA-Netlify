import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, Mic, Send } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRollenspiele } from '../lib/database';
import { getPersonaById } from '../lib/contentLoader';

export function VoiceChatPage() {
  const { personaId } = useParams();
  const navigate = useNavigate();
  const persona = getPersonaById(personaId);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const { saveSession } = useRollenspiele();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (persona) {
      setMessages([{ role: 'assistant', content: `Guten Tag, mein Name ist ${persona.firstName}. Wie kann ich Ihnen helfen?` }]);
    }
  }, [persona]);

  if (!persona) { navigate('/roleplay'); return null; }

  const sendMessage = async (text) => {
    if (!text.trim() || isProcessing) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInputText('');
    setIsProcessing(true);
    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: text }], systemPrompt: persona.systemPrompt })
      });
      const data = await response.json();
      const reply = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      const ttsResponse = await fetch('/.netlify/functions/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply, voice: persona.voiceType || 'onyx' })
      });
      const ttsData = await ttsResponse.json();
      const audioBlob = new Blob([Uint8Array.from(atob(ttsData.audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      new Audio(URL.createObjectURL(audioBlob)).play();
    } catch (error) { console.error('Error:', error); }
    finally { setIsProcessing(false); }
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
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64 })
            });
            const data = await response.json();
            if (data.text) sendMessage(data.text);
          } catch (error) { console.error('Error:', error); }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) { console.error('Error:', error); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const endSession = async () => {
    await saveSession(persona.id, messages, null, null, {});
    navigate('/');
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button onClick={endSession} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4" /> Gespräch beenden
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center gap-2 sm:gap-3" style={{ backgroundColor: persona.color + '10' }}>
          <div className="text-3xl sm:text-4xl">{persona.image}</div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">{persona.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{persona.difficulty}</p>
          </div>
        </div>
        <div className="h-64 sm:h-96 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-2.5 sm:p-3 rounded-xl"><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-gray-500" /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 sm:p-4 border-t border-gray-100 flex items-center gap-2 sm:gap-3">
          <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording}
            className={`p-2.5 sm:p-3 rounded-full flex-shrink-0 ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)} placeholder="Nachricht..."
            className="flex-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-sm sm:text-base" />
          <button onClick={() => sendMessage(inputText)} disabled={isProcessing || !inputText.trim()}
            className="p-2.5 sm:p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 flex-shrink-0">
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}

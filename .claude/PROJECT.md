# Swiss Solar Academy (SSA) - Project Documentation

## Project Overview

**Swiss Solar Academy** is a learning platform for solar energy consultants in Switzerland. It provides interactive modules, quizzes, flashcards, voice roleplays with AI customers, and progress tracking.

- **Version:** 2.0.0
- **Deployment:** Netlify (with Netlify Functions)
- **Database:** Supabase (PostgreSQL)
- **AI Provider:** OpenAI (GPT-4o-mini, Whisper, TTS)

---

## Tech Stack

### Frontend
- **React 18.2** with TypeScript
- **Vite 5.0** (build tool)
- **React Router DOM 7.13** (routing)
- **TailwindCSS 3.4** (styling)
- **Lucide React** (icons)

### Backend
- **Netlify Functions** (serverless, ES modules)
- **Supabase** (auth + PostgreSQL database)
- **OpenAI API** (chat, transcription, text-to-speech)

### Key Libraries
- `@react-pdf-viewer/core` - PDF viewing
- `markmap-lib` + `markmap-view` - Mind maps
- `@xyflow/react` - Node diagrams
- `d3` - Data visualization
- **Web Audio API** - Voice recording + real-time waveform visualization

---

## Project Structure

```
SSA-Netlify/
├── src/                          # Frontend source code
│   ├── App.tsx                  # Main routing & app shell
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Global styles + Tailwind
│   ├── components/              # Reusable UI components
│   │   ├── AITutor.jsx          # AI chat assistant (TTS toggle, waveform)
│   │   ├── AuthPage.jsx         # Login/registration
│   │   ├── ModuleDetail.jsx     # Module content display
│   │   ├── pdf/
│   │   │   └── PdfViewer.jsx    # PDF with highlights
│   │   ├── mindmap/
│   │   │   └── MindMapMarkmap.jsx # Mind map visualization
│   │   ├── common/              # Shared components (StarRating, ProgressBar)
│   │   └── layout/              # Header, navigation
│   ├── pages/                   # Route pages
│   │   ├── LernenderDashboard.tsx    # Learner home
│   │   ├── ArbeitgeberDashboard.tsx  # Employer view
│   │   ├── BetreiberDashboard.tsx    # Admin view
│   │   ├── ModuleDetailPage.tsx      # Module content page
│   │   ├── QuizPage.tsx              # Quiz interface
│   │   ├── VoiceChatPage.tsx         # Voice roleplay (TTS toggle, waveform, feedback)
│   │   └── PersonaSelectionPage.tsx  # Persona picker
│   ├── lib/                     # Core utilities
│   │   ├── supabase.js          # Supabase client
│   │   ├── AuthContext.jsx      # Auth state (user, profile, role)
│   │   ├── database.js          # Database hooks (useProgress, etc.)
│   │   └── contentLoader.ts     # JSON content loader
│   ├── types/                   # TypeScript interfaces
│   │   └── content.ts           # Module, Topic, Quiz, Persona types
│   └── hooks/                   # Custom React hooks
│       ├── useVoiceRecording.ts
│       └── useAudioPlayer.ts
├── content/                     # Static JSON content
│   ├── config.json              # Academy branding & feature toggles
│   ├── modules/                 # 5 module definitions (modul1-5.json)
│   ├── quizzes/                 # Quiz questions (modul1-5-quizzes.json)
│   ├── flashcards/              # Q&A flashcards (modul1-2-flashcards.json)
│   ├── mindmaps/                # Mind map data (modul1-5-mindmap.json)
│   └── personas/                # AI roleplay characters (4 personas)
├── netlify/functions/           # Serverless backend (ES modules)
│   ├── chat.js                  # GPT-4o-mini chat
│   ├── transcribe.js            # Whisper speech-to-text (MIME auto-detect)
│   ├── tts.js                   # Text-to-speech
│   ├── analyze-conversation.js  # Soft skills analysis
│   └── test.js                  # Health check
├── public/                      # Static assets
│   ├── pdfs/                    # Learning materials (Modul 1-2)
│   ├── audio/                   # Audio summaries (Modul 1-2)
│   └── logos/                   # Branding
├── supabase/                    # Supabase config & schema
│   ├── schema.sql               # Full database DDL
│   └── migrations/              # Incremental migrations
├── .claude/                     # Claude Code config
│   ├── CLAUDE.md                # Working instructions
│   ├── PROJECT.md               # This file
│   └── skills/                  # Custom skills (/debug)
├── package.json
├── netlify.toml
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## User Roles

| Role | German | Access |
|------|--------|--------|
| `lernender` | Lernender | Own progress, modules, quizzes, roleplay |
| `arbeitgeber` | Arbeitgeber | View employees from same company |
| `betreiber` | Betreiber | Admin - all users, all data |

---

## Database Schema (Supabase)

Full schema: `supabase/schema.sql`

### Main Tables

- **profiles** - User accounts (id, email, name, firma, role)
- **firmen** - Companies
- **modul_fortschritt** - Learning progress per topic
- **quiz_ergebnisse** - Quiz scores and answers
- **rollenspiel_sessions** - Voice roleplay transcripts + soft skills
- **pdf_highlights** - PDF annotations
- **audio_fortschritt** - Audio playback position
- **flashcard_progress** - Flashcard mastery tracking

### Row Level Security (RLS)
- Users see only their own data
- Betreiber sees everything
- Arbeitgeber sees employees from their firma

---

## Key Features

1. **5 Learning Modules** - Solar energy topics with progressive difficulty
2. **Quizzes** - Multiple choice with explanations, score tracking
3. **Flashcards** - Spaced repetition learning (Modul 1-2)
4. **Mind Maps** - Visual topic breakdowns (Markmap)
5. **PDF Materials** - Embedded viewer with highlights & annotations
6. **Audio Learning** - MP3 summaries with progress tracking
7. **Voice Roleplay** - Talk to AI customers with real-time audio waveform
8. **Roleplay Feedback** - AI-powered soft skills analysis after conversations
9. **AI Tutor** - General Q&A assistant with TTS
10. **TTS Toggle** - Both AI Tutor and Roleplay have on/off button for speech output
11. **Role-based Dashboards** - Different views per user type

---

## Voice & Audio Features

### Recording (Speech-to-Text)
- Hold microphone button to record
- **Real-time waveform visualization** (20 animated bars via Web Audio API)
- Auto-detects supported MIME type (webm/opus, mp4, ogg, wav)
- Sends MIME type to transcribe function for correct Whisper format
- Shows "Wird transkribiert..." spinner after recording

### TTS (Text-to-Speech)
- Toggle button in header (Volume2/VolumeX icons)
- AI Tutor uses `nova` voice
- Roleplay uses persona-specific voice (onyx, echo, etc.)
- Disabled state skips TTS API call entirely

### Roleplay Feedback
- "Gespräch beenden" triggers AI analysis
- Soft skills rated 1-5 stars
- Strengths & improvement areas listed
- Results saved to `rollenspiel_sessions` table

---

## Netlify Functions

All functions use ES module syntax (`export const handler`).
All functions include CORS headers for cross-origin requests.

### /.netlify/functions/chat
- **Purpose:** Chat with GPT-4o-mini
- **Input:** `{ messages, systemPrompt }`
- **Model:** `gpt-4o-mini`, max_tokens: 200

### /.netlify/functions/transcribe
- **Purpose:** Speech-to-text with Whisper
- **Input:** `{ audio (base64), mimeType }`
- **Supports:** webm, mp4, ogg, wav, mp3
- **MIME auto-detect:** Maps MIME type to correct file extension for Whisper API
- **Logging:** Audio size, MIME type, transcription result

### /.netlify/functions/tts
- **Purpose:** Text-to-speech
- **Input:** `{ text, voice }`
- **Voices:** onyx, echo, nova, fable, etc.

### /.netlify/functions/analyze-conversation
- **Purpose:** Analyze roleplay for soft skills
- **Input:** `{ messages, personaName, personaSituation }`
- **Output:** Ratings 1-5 for 6 soft skills + overall rating + feedback text

### /.netlify/functions/test
- **Purpose:** Health check / API key verification
- **Output:** `{ hasApiKey: true/false }`

---

## Development

### Prerequisites
- Node.js 18+
- Netlify CLI (`npm install -g netlify-cli`)

### Environment Variables (.env)
```
OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Commands
```bash
# Install dependencies
npm install

# Start development (IMPORTANT: use netlify dev, not npm run dev)
netlify dev

# Build for production
npm run build
```

### Development Server
- **Netlify Dev:** http://localhost:8888 (includes functions)
- **Vite only:** http://localhost:5173 (NO functions - don't use!)

---

## Common Issues & Solutions

### 1. "Unexpected end of JSON input" or 404 on API calls
**Cause:** Using Vite server (port 5173) instead of Netlify Dev (port 8888)
**Solution:** Always use `netlify dev` and access http://localhost:8888

### 2. "The audio file could not be decoded"
**Cause:** Wrong audio format sent to Whisper API
**Solution:** Frontend auto-detects MIME type, transcribe function maps to correct file extension

### 3. Module colors not showing (gray icons)
**Cause:** Dynamic Tailwind classes not in safelist
**Solution:** Gradient classes are in `tailwind.config.js` safelist

### 4. ES Module errors in Netlify Functions
**Cause:** package.json has `"type": "module"` but functions use CommonJS
**Solution:** All functions use `export const handler` (ES module syntax)

### 5. CORS errors
**Solution:** All functions include CORS headers:
```js
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

---

## Debugging Tips

### Check Netlify Function Logs
Functions log to the terminal where `netlify dev` is running:
- Audio data size and MIME type
- File extension used for Whisper
- OpenAI API responses and errors
- Transcription results (first 50 chars)

### Browser Console
- `Using MIME type: audio/webm;codecs=opus` - Recording format selected
- `Actual recorded MIME type: ...` - What was actually recorded
- `Transcription error: ...` - Whisper API errors
- API response errors with details

### Verify API Key
```bash
curl http://localhost:8888/.netlify/functions/test
# Should return: { "hasApiKey": true }
```

---

## Content Files

### Adding a New Module
1. Create `content/modules/modul6.json`
2. Create `content/quizzes/modul6-quizzes.json`
3. Create `content/flashcards/modul6-flashcards.json`
4. Create `content/mindmaps/modul6-mindmap.json`
5. Add PDF to `public/pdfs/`
6. Add audio to `public/audio/`
7. Update `contentLoader.ts` maps if needed

### Adding a New Persona
1. Create `content/personas/newpersona.json`
2. Include: id, name, firstName, image, color, difficulty, tags
3. Write systemPrompt with customer role instructions (see below)
4. Set voiceType for TTS

---

## Persona System Prompts

Personas are AI customers for roleplay. Key instructions in every persona:
- "WICHTIG: Du bist ein KUNDE" (You are a CUSTOMER)
- "Du bist NICHT der Berater" (You are NOT the consultant)
- "Gib NIEMALS Beratung, technische Empfehlungen oder Verkaufsargumente"
- "BLEIBE IMMER IN DEINER ROLLE" (STAY in your role)
- Response length: 1-3 sentences in German

### Available Personas
| ID | Name | Type | Difficulty | Voice |
|----|------|------|------------|-------|
| mueller | Familie Muller | Residential, cost-conscious | Standard | onyx |
| gruenfeld | Familie Grunfeld | Residential | Standard | echo |
| baumann | Baumann | Customer persona | Standard | onyx |
| techag | Tech AG | Commercial/industrial | Advanced | onyx |

---

## File Naming Conventions

- Modules: `modul{N}.json` (N = 1-5)
- Quizzes: `modul{N}-quizzes.json`
- Flashcards: `modul{N}-flashcards.json`
- Mindmaps: `modul{N}-mindmap.json`
- PDFs: `Modul_0{N}_*.pdf`
- Audio: `modul{N}-*.mp3`

---

## Soft Skills Tracking

Roleplay sessions are analyzed for:
- **gesprachsfuhrung** - Conversation leadership
- **aktives_zuhoren** - Active listening
- **klarheit** - Clarity of explanation
- **einwand_behandlung** - Objection handling
- **empathie** - Empathy
- **uberzeugungskraft** - Persuasiveness

Ratings: 1 (weak) to 5 (excellent)
Overall: "schwach" | "mittel" | "gut"

Data is displayed in:
- Feedback modal after roleplay (VoiceChatPage)
- AI Tutor sidebar (aggregate soft skills)
- Betreiber dashboard (all learners)
- Arbeitgeber dashboard (company employees)

---

## Tailwind Safelist

Dynamic gradient classes must be in `tailwind.config.js` safelist:
```
from-blue-500, to-blue-600      (Modul 1)
from-purple-500, to-purple-600  (Modul 2)
from-amber-500, to-orange-500   (Modul 3)
from-cyan-500, to-cyan-600      (Modul 4)
from-emerald-500, to-emerald-600 (Modul 5)
```

---

## Deployment

### Automatic (GitHub -> Netlify)
Push to `main` branch triggers automatic deployment.

### Manual
```bash
netlify deploy --prod
```

### Environment Variables (Netlify Dashboard)
Set in Site Settings -> Environment Variables:
- `OPENAI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Git Hygiene

### .gitignore covers:
- `node_modules/`, `dist/`, `.netlify/`
- `.env*` files
- `.DS_Store`, `Thumbs.db`
- `deno.lock`
- `*.log`

### Not tracked (auto-generated):
- `.netlify/functions-serve/` (compiled function copies)
- `.netlify/state.json` (local Netlify state)

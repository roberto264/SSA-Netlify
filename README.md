# Swiss Solar Academy - Netlify Version

## Deployment auf Netlify

### Option 1: Via GitHub
1. Pushe diesen Ordner zu einem GitHub Repository
2. Gehe zu netlify.com → "Add new site" → "Import an existing project"
3. Wähle dein GitHub Repo
4. Netlify erkennt die Einstellungen automatisch

### Option 2: Drag & Drop
1. Führe lokal `npm install && npm run build` aus
2. Ziehe den `dist` Ordner auf netlify.com/drop

### Environment Variable setzen
1. In Netlify: Site settings → Environment variables
2. Füge hinzu:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-dein-echter-api-key`

## Lokal testen
```bash
npm install
npm run dev
```
Hinweis: Voice-Chat funktioniert lokal nicht (braucht Netlify Functions).

## Struktur
```
├── netlify/
│   └── functions/
│       ├── chat.js      # OpenAI Chat API
│       ├── tts.js       # Text-to-Speech
│       └── transcribe.js # Speech-to-Text
├── src/
│   ├── App.jsx
│   ├── personas/
│   └── ...
└── netlify.toml
```

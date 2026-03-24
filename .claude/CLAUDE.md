# CLAUDE.md — Working Instructions

> Read this section first, every session. It overrides any assumptions about approach or style.

---

## 1. How I Work — Personal Patterns

- I give **high-level goals**, not detailed specs. Ask clarifying questions *before* starting.
- Dieses Projekt ist **ausschliesslich auf Deutsch** — antworte immer auf Deutsch.
- I confirm success with short messages ("perfekt", "gut", "passt"). If I say something looks wrong, **stop and investigate immediately**.
- I work in **sprints** with long sessions. Keep CLAUDE.md up to date between sessions.

---

## 2. Working Rules

### Before Starting Any Task
- **Broad or ambiguous request**: ask one clarifying question before touching any file.
- **Broad codebase changes**: generate a **checklist of all target files** first, confirm, then execute.
- **Styling/UI changes**: ask for reference values, exact CSS, or a screenshot if not provided.

### During Every Task
- **ONE change at a time.** Confirm it works before the next.
- **CSS/styling**: minimal targeted edits — do NOT restructure HTML or change multiple properties at once.
- If I say something "looks wrong": **investigate the root cause immediately**. Do not deny or minimize.

### After Every Task
- Run `npm run build` and confirm no errors.
- Update this CLAUDE.md if new architectural decisions or pitfalls were discovered.

---

## 3. Past Mistakes — Do Not Repeat

| Anti-pattern | Rule |
|---|---|
| Bundled styling changes → layout broke | One CSS change at a time |
| Wrong initial approach broke existing functionality | Verify approach fits existing setup first |
| Missed items on broad changes | Generate checklist first |
| No build check after edits | Always run build |
| Denied causing a regression | Investigate immediately, own it |

---

## 4. CRITICAL: Always Use Netlify Dev

- **NEVER** run `npm run dev` (Vite standalone)
- **ALWAYS** run `netlify dev` → http://localhost:8888
- Port 5173 = broken (no functions), Port 8888 = correct

---

## 5. Debugging Workflow

1. **Diagnose**: What info do you need? (logs, console, network tab)
2. **Hypothesis**: What do you think is wrong and WHY?
3. **Fix**
4. **Verify**: Run verification steps

---

## 6. Common Bug Patterns

| Pattern | Root Cause | Fix |
|---|---|---|
| API 404 | Using port 5173 statt 8888 | `netlify dev` verwenden |
| "Unexpected end of JSON" | Netlify Functions not running | `netlify dev` prüfen |
| Audio/Whisper errors | Wrong MIME type/format | MIME type in transcribe.js prüfen |
| Gespräch hängt / doppelte Nachrichten | Race Condition / State-Machine stuck | `isSendingRef` Lock + `TTS_DONE` dispatch prüfen |
| `[GESPRAECH_ENDE]` sichtbar | Regex nicht global | `/\[GESPRAECH_ENDE\]/g` verwenden |
| Tailwind classes not applying | Dynamic class names not in safelist | `tailwind.config.js` safelist |

---

# PROJECT

## Stack

- **Project:** SSA-Netlify (Soft-Skill-Akademie)
- **Stack:** React 18.2, TypeScript, Vite 7.3, TailwindCSS 3.4, Netlify Functions, Supabase, OpenAI, Stripe
- **AI:** OpenAI (gpt-4o chat, gpt-4o-mini analysis, whisper, tts), ElevenLabs (TTS/STT primary)
- **Payment:** Stripe (B2B per-seat subscriptions)
- **Monitoring:** Sentry, Upstash Redis (rate limiting)
- **Testing:** Vitest (unit), Playwright (e2e)

## Environment

- **Node**: 18+
- **Dev**: `netlify dev` → http://localhost:8888
- **Build**: `npm run build`
- **Test**: `npm test` | `npm run test:e2e`
- **Deploy**: Git push to main (Netlify auto-deploy)
- **Env Vars**: See `.env.example`

## File Structure
```
src/
  components/          # UI (billing/, layout/, common/, ui/)
  pages/               # Route pages (lazy-loaded)
  hooks/               # useConversationSession, useVAD
  lib/                 # supabase, auth, database, api, voiceConfig, audioUtils
  types/               # content.ts, database.ts
  __tests__/           # Vitest unit tests
content/               # JSON (modules, quizzes, personas, flashcards, mindmaps)
netlify/functions/     # Serverless backend
  _shared/             # auth, response, validate, rateLimit, subscription
supabase/migrations/   # SQL migrations
e2e/                   # Playwright tests
```

## Design System (Corporate Clean)

- **Primary:** Emerald `#059669` | **Dark:** Navy `#0F172A` | **Background:** `#F8FAFC`
- **Text:** Slate-900 / Slate-600 / Slate-400
- **Cards:** White, `border border-slate-200 shadow-sm rounded-xl`
- **No gradients**, no emojis — Lucide-React Icons, Plus Jakarta Sans

## Architecture

- **Security:** JWT-Auth auf allen Functions, dynamisches CORS, Input-Validierung, Rate-Limiting, Audit-Logging
- **Frontend API:** Alle Calls über `authFetch()` (`src/lib/api.ts`)
- **Rollen:** `privat`, `lernender`, `arbeitgeber`, `betreiber`
- **Registrierung:** "Als Privatperson" oder "Als Firma" (Firma wird erstellt)
- **Einladungen:** `invite-user.js` → Token-Link → `/invite/:token` → `accept-invite.js`
- **Billing:** Stripe B2B per-seat, Subscription-Check auf Profile-Level (Privat) + Firmen-Level
- **DSGVO:** Daten-Export, Soft-Delete, Cookie-Consent, AGB-Checkbox
- **Code-Splitting:** Lazy-loaded Pages, manualChunks (react, supabase, pdf, charts, ui)
- **Sentry:** ErrorBoundary wraps gesamte App
- **TTS/STT:** ElevenLabs primary, OpenAI fallback, über `voiceConfig.ts`
- **State Machine:** `turnStateMachine.ts` (idle → listening → transcribing → thinking → speaking → analyzing → ended)
- **DB Legacy:** `profiles.firma` (TEXT) noch parallel zu `firma_id` (UUID FK)

## Current Status

- **Last completed:** Full UI Redesign, Registrierungsmodell, Settings-Seite, Einladungssystem, Mitarbeiter-Insights, Code Cleanup
- **Build status:** working (code-split, ~41 unit tests passing)

## TODO

- [ ] Datenschutztext & AGB juristisch prüfen lassen
- [ ] Sentry-Projekt erstellen + VITE_SENTRY_DSN setzen
- [ ] SITE_URL auf Custom Domain setzen
- [ ] Stripe Webhook auf Production testen
- [ ] Legacy `profiles.firma` TEXT-Feld entfernen (→ nur `firma_id`)
- [ ] Streaming-Chat aktivieren (optional)
- [ ] Retry-Logic bei Netzwerkfehlern (optional)
- [ ] Echtes Lernzeit-Tracking (optional)

## Known Issues

- **Streaming nicht aktiv:** Backend unterstützt SSE, Frontend sendet non-streaming
- **Lernzeit geschätzt:** Aus Aktivitäten berechnet, kein echtes Session-Tracking
- **Stripe Webhook lokal:** Nur auf Production (Stripe kann localhost nicht erreichen)
- **npm audit:** HIGH vulnerabilities in pdfjs-dist Kette — kein Update verfügbar

## Full Details
See `.claude/PROJECT.md` for: Database schema, Function specs, Content structure, Persona prompts

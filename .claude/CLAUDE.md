# CLAUDE.md — Working Instructions

> Read this section first, every session. It overrides any assumptions about approach or style.

---

## 1. How I Work — Personal Patterns

- I give **high-level goals**, not detailed specs. Your job is to ask clarifying questions *before* starting, not after.
- I do **iterative refinement** — but excessive back-and-forth means something went wrong upfront.
- Dieses Projekt ist **ausschliesslich auf Deutsch** — antworte immer auf Deutsch.
- I confirm success with short messages ("perfekt", "gut", "passt"). If I say something looks wrong, **stop and investigate immediately**.
- I work in **sprints** with long sessions. Context loss between sessions is expensive. Keep CLAUDE.md up to date.

---

## 2. Universal Working Rules

### Before Starting Any Task
- If the request is **broad or ambiguous**: ask one clarifying question before touching any file.
- For **broad codebase changes** (e.g. "add X to all pages"): generate a **checklist of all target files/elements first**, confirm it with me, then execute.
- For **styling/UI changes**: ask for reference values, exact CSS, or a screenshot if not provided. Do not guess.

### During Every Task
- Make **ONE change at a time**. Confirm it works before moving to the next.
- **CSS/styling**: minimal targeted edits only — do NOT restructure HTML or change multiple properties at once.
- **Never assume a change works** — verify it. If there's a build step, run it.
- If I say something "looks wrong" or "looks terrible": **investigate the root cause immediately**. Do not deny, minimize, or work around it.

### After Every Task
- Run `npm run build` and confirm no errors before saying you're done.
- If the build fails: fix it before reporting completion.
- Update this CLAUDE.md if new architectural decisions, patterns, or pitfalls were discovered.

---

## 3. What Has Gone Wrong Before — Do Not Repeat

| Anti-pattern | What happened | Rule |
|---|---|---|
| Bundled styling changes | Multiple CSS properties changed at once → layout broke, needed 4-6 correction rounds | One change at a time |
| Wrong initial approach | Chose implementation that broke existing functionality, only discovered after I tested | Verify approach fits existing setup before starting |
| Missed items on broad changes | Added attribute/fix to most but not all files on first pass, needed repeated audit rounds | Generate checklist first |
| No build check after edits | Bugs stacked up across several changes before surfacing | Always run build after edits |
| Denied causing a regression | Claude changed CSS, page broke, Claude said it wasn't the cause | Investigate immediately, own it |

---

## 4. Styling & UI — Specific Rules

- **Never bundle more than one visual change per request.** If I ask for multiple things, do them sequentially and confirm each.
- **Do not restructure HTML** to fix a styling issue unless explicitly asked.
- **Reference screenshot or exact values**: if I haven't provided them, ask before proceeding.
- Provide the **exact diff** before applying any CSS change if I ask to "show me first".
- After a styling change, check for regressions on related pages and responsive breakpoints.

---

## 5. Session & Context Management

- At the **start of every session**: read this file and the project status section below.
- At the **end of every session**: update "Current Status" and "TODO" below.
- If context from a previous session is unclear, ask before assuming.
- Keep `## Architecture Decisions` updated with date-stamped entries when anything structural changes.

---

## 6. CRITICAL: Always Use Netlify Dev

- **NEVER** run `npm run dev` (Vite standalone)
- **ALWAYS** run `netlify dev` and use http://localhost:8888
- Port 5173 = broken (no functions), Port 8888 = correct

---

## 7. Debugging Workflow (MANDATORY)

### Before ANY fix:
1. **Diagnose**: What information do you need? (logs, console, network tab)
2. **Hypothesis**: What do you think is wrong and WHY?
3. **Verification Plan**: How will we know the fix worked?
4. **Then fix**
5. **Verify**: Run the verification steps

### Example - "Blank Screen" Issue:
```
WRONG: "Let me modify netlify.toml"
CORRECT:
   1. Check browser console for errors
   2. Check netlify dev terminal output
   3. Verify port 8888 is being used
   4. Check network tab - is index.html loading?
   5. THEN propose fix with verification steps
```

---

## 8. Common Bug Patterns in This Project

### Pattern 1: API calls fail with 404
**Root cause**: Using Vite dev server (5173) instead of Netlify Dev (8888)
**Check first**: What port is the user accessing?
**Fix**: Remind to use `netlify dev`

### Pattern 2: "Unexpected end of JSON input"
**Root cause**: Netlify functions not running
**Check first**:
- Is `netlify dev` running?
- Do functions log to terminal?
- Try `curl http://localhost:8888/.netlify/functions/test`

### Pattern 3: Audio/Whisper errors
**Root cause**: Wrong MIME type or format
**Check first**:
- Log the audio blob MIME type in browser console
- Check function logs for received MIME type
- Verify file format in transcribe.js

### Pattern 4: AI-Gespräch hängt / doppelte Nachrichten
**Root cause**: Race Condition in `sendTextMessage` oder State-Machine stuck in `speaking`
**Check first**:
- Console: Wird `sendTextMessage` doppelt aufgerufen?
- Ist `turnState` korrekt? (sollte nach TTS-Ende auf `idle` zurückgehen)
- Wird `isSendingRef` korrekt zurückgesetzt? (finally-Block)
**Fix**: `isSendingRef` Lock prüfen, `TTS_DONE` dispatch nach Interruption prüfen

### Pattern 5: `[GESPRAECH_ENDE]` Token sichtbar im Chat
**Root cause**: Token nicht global entfernt (`.replace()` statt `.replace(/regex/g)`)
**Check first**: `chat.js` Zeile 83 — wird globales Regex verwendet?
**Fix**: Immer `/\[GESPRAECH_ENDE\]/g` verwenden (chat.js + analyze.js)

### Pattern 6: Tailwind classes not applying

**Root cause**: Dynamic class names not in safelist
**Check first**: Is the class dynamically constructed? (e.g., `bg-${color}`)
**Fix**: Add to tailwind.config.js safelist

---

## 9. Never Do
- Modify code without explaining hypothesis first
- Skip verification steps after applying fix
- Use Vite dev server (port 5173) for testing
- Assume dynamic Tailwind classes work without safelist
- Bundle multiple styling changes into one edit
- Restructure HTML to fix a styling issue (unless explicitly asked)
- Deny causing a regression

## 10. Always Do
- Read full error messages before suggesting fixes
- Check both browser console AND terminal logs
- Verify the user is on correct port (8888)
- Test with `netlify dev`, not `npm run dev`
- Provide exact verification commands after fixes
- Run `npm run build` after every change
- Immer auf Deutsch antworten
- Ask before starting ambiguous tasks

---

# PROJECT-SPECIFIC SECTION

## Project Context

- **Project:** SSA-Netlify (Soft-Skill-Akademie)
- **Stack:** React 18.2, TypeScript, Vite 7.3, TailwindCSS 3.4, Netlify Functions, Supabase, OpenAI, Stripe
- **Routing:** React Router DOM 7.13
- **AI:** OpenAI (gpt-4o for chat, gpt-4o-mini for analysis, whisper, tts), ElevenLabs (TTS/STT primary)
- **Payment:** Stripe (B2B per-seat subscriptions)
- **Monitoring:** Sentry (error tracking), Upstash Redis (rate limiting)
- **Testing:** Vitest (unit), Playwright (e2e)
- **Last updated:** 2026-03-24

## Deployment Rules

- Deploy via: Git push to main (Netlify auto-deploy)
- Build command: `npm run build`
- Dev command: `netlify dev` (NOT `npm run dev`)
- Dev URL: http://localhost:8888

## File Structure
```
src/
  components/          # UI components
    billing/           # SubscriptionCard, SeatManager
    ui/                # shadcn/ui components
  pages/               # Route pages (lazy-loaded)
  hooks/               # Custom hooks (useConversationSession, useVAD)
  lib/                 # Core utilities (supabase, auth, database, api, voiceConfig)
  types/               # TypeScript interfaces (content.ts, database.ts)
  __tests__/           # Vitest unit tests
content/               # JSON data (modules, quizzes, personas)
netlify/functions/     # Serverless backend
  _shared/             # auth.js, response.js, validate.js, rateLimit.js, subscription.js
  stripe-*.js          # Stripe checkout, webhook, portal
  user-export.js       # DSGVO data export
  user-delete.js       # DSGVO account deletion
supabase/migrations/   # SQL migrations (run manually in Supabase)
e2e/                   # Playwright E2E tests
```

## Verification Checklists

### After Frontend Changes:
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors in terminal
- [ ] Browser console shows no errors
- [ ] Feature works in http://localhost:8888

### After Function Changes:
- [ ] Function logs show in `netlify dev` terminal
- [ ] Test endpoint: `curl http://localhost:8888/.netlify/functions/[name]`
- [ ] Check CORS headers in response (must NOT be `*`)
- [ ] Verify JSON response structure
- [ ] Verify JWT auth required (401 without token)
- [ ] Verify rate limiting works (429 after limit)

### After Database Changes:
- [ ] Check Supabase RLS policies
- [ ] Test with different user roles (lernender, arbeitgeber, betreiber)
- [ ] Verify no unauthorized data access

## Environment

- **Node**: 18+
- **Package Manager**: npm
- **Dev Command**: `netlify dev` (NOT npm run dev!)
- **Dev URL**: http://localhost:8888
- **Build Command**: `npm run build`
- **Test Command**: `npm test` (Vitest unit tests)
- **E2E Command**: `npm run test:e2e` (Playwright, requires `netlify dev` running)

## Required Environment Variables
See `.env.example` for full list. Key ones:
- `OPENAI_API_KEY`, `ELEVENLABS_API_KEY` — AI providers
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Frontend Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — Backend auth verification
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` — Billing
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — Rate limiting
- `SITE_URL` — Production domain (for CORS + Stripe redirects)
- `VITE_SENTRY_DSN` — Error tracking (optional)

## Current Status

- **Last completed:** Production-Readiness (6 Phasen): Security, Stripe B2B, DSGVO, Testing, Monitoring, Performance
- **Next step:** Migrationen in Supabase ausführen, Stripe-Test einrichten, Sentry DSN konfigurieren
- **Build status:** working (code-split, ~41 unit tests passing)

## TODO

- [ ] Supabase-Migrationen ausführen (add_subscriptions_and_billing.sql, migrate_firma_to_fk.sql, add_firma_trial_trigger.sql)
- [ ] Stripe-Account einrichten + STRIPE_PRICE_ID erstellen
- [ ] Upstash Redis einrichten + Keys in Netlify Env setzen
- [ ] SUPABASE_SERVICE_ROLE_KEY in Netlify Env setzen
- [ ] Sentry-Projekt erstellen + VITE_SENTRY_DSN setzen
- [ ] SITE_URL auf Production-Domain setzen
- [ ] Playwright Browser installieren (`npx playwright install`)
- [ ] Datenschutztext & AGB durch Juristen prüfen lassen
- [ ] Streaming-Chat aktivieren (optional, aktuell non-streaming)
- [ ] Retry-Logic bei temporären Netzwerkfehlern im Chat (optional)

## Architecture Decisions

- **2026-03-23:** `speechServices.ts` entfernt (Dead Code) — alle TTS/STT über `voiceConfig.ts`
- **2026-03-23:** `sendTextMessage` hat `isSendingRef` Lock gegen Race Conditions
- **2026-03-23:** TTS-Unterbrechung dispatcht `TTS_DONE` + Audio-Cleanup vor `SPEECH_START`
- **2026-03-23:** `[GESPRAECH_ENDE]` Token überall mit globalem Regex entfernt
- **2026-03-24:** Security Hardening — JWT-Auth auf allen Functions (`_shared/auth.js`), dynamisches CORS (`_shared/response.js`), Input-Validierung (`_shared/validate.js`), Rate-Limiting (`_shared/rateLimit.js`)
- **2026-03-24:** Alle Frontend-API-Calls über `authFetch()` (`src/lib/api.ts`) — fügt automatisch JWT-Token hinzu
- **2026-03-24:** Stripe B2B Integration — `stripe-checkout.js`, `stripe-webhook.js`, `stripe-portal.js`, Subscription-Check Middleware (`_shared/subscription.js`)
- **2026-03-24:** `profiles.firma_id` als UUID FK auf `firmen.id` (parallel zu legacy `firma` TEXT)
- **2026-03-24:** DSGVO: Daten-Export (`user-export.js`), Soft-Delete (`user-delete.js`), Cookie-Consent, AGB-Checkbox
- **2026-03-24:** Audit-Logging: jeder authentifizierte API-Call wird in `audit_log` geloggt (fire-and-forget)
- **2026-03-24:** Code-Splitting: alle Pages lazy-loaded, manualChunks für vendor-libs (react, supabase, pdf, charts, ui)
- **2026-03-24:** Sentry ErrorBoundary wraps gesamte App, console.log Cleanup (~40 Statements entfernt)

## Known Issues

- **Streaming nicht aktiv:** `chat.js` unterstützt SSE-Streaming, aber Frontend sendet immer non-streaming.
- **Keine Retry-Logic:** Ein Netzwerkfehler beendet das Gespräch.
- **`profiles.firma` (TEXT) noch nicht entfernt:** Legacy-Feld bleibt parallel zu `firma_id` bestehen bis alle Referenzen umgestellt sind. `useFirmaUsers()` nutzt noch `firma` Text.
- **ModuleDetailPage Chunk gross (903 kB):** Enthält PDF-Viewer + Mindmap. Könnte weiter aufgesplittet werden.
- **npm audit: 25 HIGH vulnerabilities** in pdfjs-dist Kette — kein Update verfügbar.

## For Full Project Details
See `.claude/PROJECT.md` for:
- Complete database schema
- All Netlify functions specs
- Content file structures
- Persona system prompts

# Claude Code Working Instructions

## CRITICAL: Always Use Netlify Dev
- **NEVER** run `npm run dev` (Vite standalone)
- **ALWAYS** run `netlify dev` and use http://localhost:8888
- Port 5173 = broken (no functions), Port 8888 = correct

## My Debugging Workflow (MANDATORY)

### Before ANY fix:
1. **Diagnose**: What information do you need? (logs, console, network tab)
2. **Hypothesis**: What do you think is wrong and WHY?
3. **Verification Plan**: How will we know the fix worked?
4. **Then fix**
5. **Verify**: Run the verification steps

### Example - "Blank Screen" Issue:
```
❌ WRONG: "Let me modify netlify.toml"
✅ CORRECT: 
   1. Check browser console for errors
   2. Check netlify dev terminal output
   3. Verify port 8888 is being used
   4. Check network tab - is index.html loading?
   5. THEN propose fix with verification steps
```

## Common Bug Patterns in This Project

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

### Pattern 4: Tailwind classes not applying
**Root cause**: Dynamic class names not in safelist
**Check first**: Is the class dynamically constructed? (e.g., `bg-${color}`)
**Fix**: Add to tailwind.config.js safelist

## Tech Stack Quick Reference
- **Frontend**: React 18.2 + TypeScript + Vite 5.0
- **Routing**: React Router DOM 7.13
- **Styling**: TailwindCSS 3.4
- **Functions**: Netlify Functions (ES modules)
- **Database**: Supabase
- **AI**: OpenAI (gpt-4o-mini, whisper, tts)

## File Structure Priority
```
src/
  components/     # UI components
  pages/          # Route pages
  lib/            # Core utilities (supabase, auth, database)
  types/          # TypeScript interfaces
content/          # JSON data (modules, quizzes, personas)
netlify/functions/ # Serverless backend
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
- [ ] Check CORS headers in response
- [ ] Verify JSON response structure

### After Database Changes:
- [ ] Check Supabase RLS policies
- [ ] Test with different user roles (lernender, arbeitgeber, betreiber)
- [ ] Verify no unauthorized data access

## Never Do
- Modify code without explaining hypothesis first
- Skip verification steps after applying fix
- Use Vite dev server (port 5173) for testing
- Assume dynamic Tailwind classes work without safelist

## Always Do
- Read full error messages before suggesting fixes
- Check both browser console AND terminal logs
- Verify the user is on correct port (8888)
- Test with `netlify dev`, not `npm run dev`
- Provide exact verification commands after fixes

## Environment
- **Node**: 18+
- **Package Manager**: npm
- **Dev Command**: `netlify dev` (NOT npm run dev!)
- **Dev URL**: http://localhost:8888
- **Build Command**: `npm run build`

## For Full Project Details
See `.claude/PROJECT.md` for:
- Complete database schema
- All Netlify functions specs
- Content file structures
- Persona system prompts

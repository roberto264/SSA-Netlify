# Debug Skill

This skill enforces systematic debugging before attempting any fixes.

## When to Use

Use this skill whenever the user reports:
- Bugs or errors
- Features not working
- API calls failing
- Blank screens
- Build failures
- Any "X doesn't work" statement

## Mandatory Debug Workflow

### Step 1: Information Gathering
Before proposing ANY solution, ask the user for:

**For Frontend Issues:**
- Browser console errors (exact error messages)
- Network tab: which requests are failing? (status codes, URLs)
- Which port are they using? (8888 vs 5173)
- Is `netlify dev` running?

**For Backend/Function Issues:**
- Terminal output from `netlify dev`
- Function logs (visible in netlify dev terminal)
- Test the function directly: `curl http://localhost:8888/.netlify/functions/[name]`

**For Build Issues:**
- Full build error output
- TypeScript errors (`npx tsc --noEmit`)
- Dependencies recently changed?

### Step 2: Read Relevant Code
Use Read tool to examine:
- The file where the error occurs
- Related configuration files
- Recently modified files (if known)

### Step 3: State Your Hypothesis
Clearly explain:
- What you think is wrong
- Why you think this is the cause
- What evidence supports this hypothesis

Example:
```
Hypothesis: API calls are failing because the user is on port 5173 
(Vite dev server) instead of port 8888 (Netlify dev).

Evidence: 
- 404 errors on /api/* endpoints
- Functions only work with netlify dev (port 8888)
- Common pattern in this project (see CLAUDE.md)
```

### Step 4: Propose Fix with Verification
When suggesting a fix:
1. Explain the change
2. Show the exact code/command
3. **Provide verification steps** - how will we know it worked?

Example:
```
Fix: Ensure netlify dev is running and use port 8888

Verification:
1. Run: curl http://localhost:8888/.netlify/functions/test
2. Should return: {"hasApiKey": true}
3. Access app on http://localhost:8888
4. Check browser console - API errors should be gone
```

### Step 5: Verify After Fix
After user applies the fix:
- Ask if the verification steps passed
- If not: go back to Step 1 with new information
- **Never** try another speculative fix without diagnosing why the first failed

## Common Mistakes to Avoid

❌ **Don't:** "Let me modify netlify.toml..."
✅ **Do:** "Before I change anything, can you share the browser console errors?"

❌ **Don't:** Jump to solutions based on similar past issues
✅ **Do:** Verify this specific instance matches the pattern first

❌ **Don't:** Try multiple fixes in sequence without diagnosis
✅ **Do:** Diagnose why the first fix didn't work before trying another

## Reference Documents

For project-specific bug patterns, always check:
- `.claude/CLAUDE.md` - Common bug patterns for this project
- `.claude/PROJECT.md` - Technical architecture

## Example Usage

User: "The audio transcription isn't working"

**Step 1 - Gather Info:**
```
Before I debug this, I need some information:
1. What error message appears in the browser console?
2. Is netlify dev running? Check the terminal for function logs
3. What audio format are you recording? (The MIME type)
4. Can you test if other functions work? Try: 
   curl http://localhost:8888/.netlify/functions/test
```

**Step 2 - Read Code:**
Read netlify/functions/transcribe.js to understand current implementation

**Step 3 - Hypothesis:**
```
Based on past issues in this project (see CLAUDE.md Pattern 3):
Hypothesis: Wrong audio MIME type being sent to Whisper API

The transcribe function expects specific formats (webm, mp4, ogg, wav)
but the browser might be recording in a different format.
```

**Step 4 - Fix + Verification:**
```
Fix: Log the MIME type in browser console and verify format in function

Changes needed:
1. Add console.log in VoiceChatPage.tsx where audio is captured
2. Check function logs in netlify dev terminal
3. Update format mapping in transcribe.js if needed

Verification:
1. Record audio and check console for MIME type
2. Check netlify dev terminal - should show received format
3. Transcription should complete without "file could not be decoded" error
```

## Summary

Always follow this sequence:
1. **Gather** information (errors, logs, context)
2. **Read** relevant code
3. **Hypothesize** root cause with evidence
4. **Propose** fix with verification steps
5. **Verify** the fix actually worked

Never skip to solutions without diagnosis.

import { getCorsHeaders } from './_shared/response.js';
import { validateChat } from './_shared/validate.js';
import { checkRateLimitV2 } from './_shared/rateLimit.js';
import { checkSubscription } from './_shared/subscription.js';
import { createClient } from '@supabase/supabase-js';

/**
 * Chat function (Netlify Functions v2).
 * Supports both streaming (SSE) and non-streaming modes.
 *
 * Non-streaming: POST { messages, systemPrompt, maxTokens }
 *   → { ok: true, data: { choices: [...], conversationEnded } }
 *
 * Streaming: POST { messages, systemPrompt, maxTokens, stream: true }
 *   → SSE stream of OpenAI tokens, final [DONE] event includes conversationEnded flag
 */
export default async (req) => {
  const origin = req.headers.get('origin') || '';
  const corsHeaders = getCorsHeaders(origin);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method Not Allowed' } }),
      { status: 405, headers: corsHeaders }
    );
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not configured');
    return new Response(
      JSON.stringify({ ok: false, error: { code: 'CONFIG_ERROR', message: 'API Key not configured' } }),
      { status: 500, headers: corsHeaders }
    );
  }

  // JWT Auth check
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Missing Authorization header' } }),
      { status: 401, headers: corsHeaders }
    );
  }
  let user;
  try {
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser(authHeader.slice(7));
    if (authErr || !authUser) {
      return new Response(
        JSON.stringify({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }),
        { status: 401, headers: corsHeaders }
      );
    }
    user = authUser;
  } catch (authErr) {
    return new Response(
      JSON.stringify({ ok: false, error: { code: 'AUTH_ERROR', message: 'Authentication failed' } }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Rate limiting
  const { allowed, response: rlResponse } = await checkRateLimitV2(user.id, 'chat', corsHeaders);
  if (!allowed) return rlResponse;

  // Subscription check
  const { allowed: subAllowed, response: subResponse } = await checkSubscription(user.id, origin);
  if (!subAllowed) return new Response(subResponse.body, { status: subResponse.statusCode, headers: subResponse.headers });

  try {
    const { messages, systemPrompt, maxTokens, stream } = await req.json();

    const validationErr = validateChat({ messages, systemPrompt, maxTokens });
    if (validationErr) {
      return new Response(
        JSON.stringify({ ok: false, error: { code: 'INVALID_INPUT', message: validationErr } }),
        { status: 400, headers: corsHeaders }
      );
    }

    const openaiParams = {
      model: 'gpt-4o',  // Upgraded from gpt-4o-mini for better instruction following
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: maxTokens || 150,  // Reduced from 200 for faster responses
      temperature: 0.7,
      stream: !!stream,
    };

    console.log(`Sending ${stream ? 'streaming' : 'non-streaming'} request to OpenAI...`);

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(openaiParams)
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      return new Response(
        JSON.stringify({ ok: false, error: { code: 'OPENAI_ERROR', message: `OpenAI API error: ${openaiResponse.status}` } }),
        { status: openaiResponse.status, headers: corsHeaders }
      );
    }

    // ─── Non-streaming path ──────────────────────────────────────────
    if (!stream) {
      const data = await openaiResponse.json();
      console.log('OpenAI response received');

      const rawContent = data.choices[0].message.content;
      const conversationEnded = rawContent.includes('[GESPRAECH_ENDE]');
      data.choices[0].message.content = rawContent.replace(/\[GESPRAECH_ENDE\]/g, '').trim();

      return new Response(
        JSON.stringify({ ok: true, data: { ...data, conversationEnded } }),
        { status: 200, headers: corsHeaders }
      );
    }

    // ─── Streaming path (SSE) ────────────────────────────────────────
    const reader = openaiResponse.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    const sseStream = new ReadableStream({
      async pull(controller) {
        const encoder = new TextEncoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Final event with conversationEnded flag
            const conversationEnded = fullContent.includes('[GESPRAECH_ENDE]');
            const doneEvent = `data: ${JSON.stringify({ done: true, conversationEnded })}\n\n`;
            controller.enqueue(encoder.encode(doneEvent));
            controller.close();
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;

            try {
              const parsed = JSON.parse(payload);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                fullContent += token;
                // Strip [GESPRAECH_ENDE] from streamed tokens before sending to client
                const cleanToken = token.replace(/\[GESPRAECH_ENDE\]/g, '');
                if (cleanToken) {
                  const tokenEvent = `data: ${JSON.stringify({ token: cleanToken })}\n\n`;
                  controller.enqueue(encoder.encode(tokenEvent));
                }
              }
            } catch {
              // Skip malformed lines
            }
          }
        }
      }
    });

    return new Response(sseStream, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } }),
      { status: 500, headers: corsHeaders }
    );
  }
};

import { handleOptions, success, error } from './_shared/response.js';

export const handler = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== 'POST') {
    return error(405, 'METHOD_NOT_ALLOWED', 'Method Not Allowed');
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return error(500, 'CONFIG_ERROR', 'API Key not configured');
  }

  try {
    const {
      messages, personaName, personaSituation,
      mode = 'practice',
      durationSeconds, exchangeCount, interruptionCount = 0
    } = JSON.parse(event.body);

    if (!messages || !personaName) {
      return error(400, 'INVALID_INPUT', 'Missing messages or personaName');
    }

    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'BERATER' : 'KUNDE'}: ${m.content}`)
      .join('\n');

    // Build analysis prompt based on mode
    let analysisPrompt;

    if (mode === 'zen') {
      // Calculate speaking ratio
      const userWords = messages
        .filter(m => m.role === 'user')
        .reduce((sum, m) => sum + m.content.split(/\s+/).length, 0);
      const totalWords = messages
        .reduce((sum, m) => sum + m.content.split(/\s+/).length, 0);
      const speakingRatio = totalWords > 0 ? (userWords / totalWords).toFixed(2) : 0;

      analysisPrompt = `Du bist ein erfahrener Verkaufstrainer für Solarberater. Analysiere das folgende Kundengespräch im ZEN-MODUS (realistische Gesprächssimulation, nur Sprache) und bewerte die Leistung des Beraters umfassend.

KUNDE: ${personaName}
SITUATION: ${personaSituation}
GESPRÄCHSDAUER: ${durationSeconds} Sekunden (${Math.round(durationSeconds / 60)} Minuten)
ANZAHL AUSTAUSCHE: ${exchangeCount}
SPRECHANTEIL BERATER: ${Math.round((1 - speakingRatio) * 100)}%
UNTERBRECHUNGEN: ${interruptionCount} Mal hat der Berater dem Kunden ins Wort gefallen

GESPRÄCH:
${conversationText}

ANALYSE-AUFGABEN:

1. SOFT SKILLS (1-5 Punkte):
   - Gesprächsführung: Struktur, roter Faden, aktive Führung
   - Aktives Zuhören: Bezugnahme auf Kundenaussagen, Nachfragen
   - Klarheit: Verständlichkeit, kein unnötiger Fachjargon
   - Einwandbehandlung: Umgang mit Bedenken und Skepsis
   - Empathie: Verständnis für Kundensituation
   - Überzeugungskraft: Qualität der Argumentation

2. FRAGENANALYSE:
   - Zähle wie viele FRAGEN der Berater gestellt hat (direkte Fragen mit Fragezeichen oder indirekte Fragen)
   - Bewerte die QUALITÄT der Fragen (1-5): Waren es offene Fragen? Bedarfsermittlung? Oder nur Ja/Nein-Fragen?
   - Beschreibe kurz welche Fragen gut/schlecht waren

3. TONALITÄT/SENTIMENT-ANALYSE:
   - Analysiere die Wortwahl und Formulierungen des Beraters
   - Bewerte den Ton (1-5): 1=unprofessionell/unsicher, 5=professionell/vertrauenerweckend
   - Achte auf: Konjunktiv-Häufung (Unsicherheit), Füllwörter, aktive vs. passive Sprache, Kundenansprache

4. UNTERBRECHUNGEN ("Dem Kunden reingeredet"):
   - Der Berater hat ${interruptionCount} Mal dem Kunden ins Wort gefallen
   - Bewerte das Unterbrechungsverhalten (1-5):
     5 = Keine Unterbrechungen (vorbildlich)
     4 = 1-2 Unterbrechungen (akzeptabel)
     3 = 3-4 Unterbrechungen (verbesserungswürdig)
     2 = 5-6 Unterbrechungen (problematisch)
     1 = 7+ Unterbrechungen (unprofessionell)
   - Beschreibe kurz die Auswirkung der Unterbrechungen auf das Gespräch

Antworte NUR mit einem JSON-Objekt in diesem Format:
{
  "gesprachsfuhrung": <1-5>,
  "aktives_zuhoren": <1-5>,
  "klarheit": <1-5>,
  "einwand_behandlung": <1-5>,
  "empathie": <1-5>,
  "uberzeugungskraft": <1-5>,
  "gesamtbewertung": "<schwach|mittel|gut>",
  "feedback": "<4-6 Sätze detailliertes konstruktives Feedback auf Deutsch>",
  "staerken": ["<Stärke 1>", "<Stärke 2>", "<Stärke 3>"],
  "verbesserungen": ["<Verbesserung 1>", "<Verbesserung 2>", "<Verbesserung 3>"],
  "user_question_count": <Anzahl gestellter Fragen>,
  "user_question_quality": <1-5>,
  "gefragte_fragen_analyse": "<2-3 Sätze über die Qualität der gestellten Fragen>",
  "sentiment_score": <1-5>,
  "tonalitaet": "<2-3 Sätze über Tonalität, Wortwahl und Formulierungen des Beraters>",
  "dem_kunden_reingeredet": <1-5>,
  "unterbrechungs_analyse": "<1-2 Sätze über das Unterbrechungsverhalten>"
}`;
    } else {
      // Practice mode — simpler analysis
      analysisPrompt = `Du bist ein erfahrener Verkaufstrainer für Solarberater. Analysiere das folgende Kundengespräch und bewerte die Leistung des Beraters.

KUNDE: ${personaName}
SITUATION: ${personaSituation}

GESPRÄCH:
${conversationText}

Bewerte den Berater in folgenden Kategorien von 1-5 (1=schwach, 5=exzellent):

1. Gesprächsführung: Strukturiert der Berater das Gespräch gut? Führt er aktiv?
2. Aktives Zuhören: Geht der Berater auf die Aussagen des Kunden ein?
3. Klarheit: Erklärt der Berater verständlich und ohne zu viel Fachjargon?
4. Einwandbehandlung: Wie gut geht der Berater mit Bedenken und Einwänden um?
5. Empathie: Zeigt der Berater Verständnis für die Situation des Kunden?
6. Überzeugungskraft: Wie überzeugend argumentiert der Berater?

Antworte NUR mit einem JSON-Objekt in diesem Format:
{
  "gesprachsfuhrung": <1-5>,
  "aktives_zuhoren": <1-5>,
  "klarheit": <1-5>,
  "einwand_behandlung": <1-5>,
  "empathie": <1-5>,
  "uberzeugungskraft": <1-5>,
  "gesamtbewertung": "<schwach|mittel|gut>",
  "feedback": "<2-3 Sätze konstruktives Feedback auf Deutsch>",
  "staerken": ["<Stärke 1>", "<Stärke 2>"],
  "verbesserungen": ["<Verbesserung 1>", "<Verbesserung 2>"]
}`;
    }

    const maxTokens = mode === 'zen' ? 800 : 500;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Du bist ein erfahrener Verkaufstrainer. Antworte nur mit validem JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return error(response.status, 'OPENAI_ERROR', `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback analysis
      analysis = {
        gesprachsfuhrung: 3, aktives_zuhoren: 3, klarheit: 3,
        einwand_behandlung: 3, empathie: 3, uberzeugungskraft: 3,
        gesamtbewertung: 'mittel',
        feedback: 'Das Gespräch konnte nicht vollständig analysiert werden.',
        staerken: [], verbesserungen: [],
      };
      if (mode === 'zen') {
        analysis.user_question_count = 0;
        analysis.user_question_quality = 3;
        analysis.gefragte_fragen_analyse = 'Konnte nicht analysiert werden.';
        analysis.sentiment_score = 3;
        analysis.tonalitaet = 'Konnte nicht analysiert werden.';
        analysis.dem_kunden_reingeredet = interruptionCount === 0 ? 5 : interruptionCount <= 2 ? 4 : 3;
        analysis.unterbrechungs_analyse = 'Konnte nicht analysiert werden.';
      }
    }

    // Attach computed metrics for zen mode
    if (mode === 'zen') {
      const userWords = messages
        .filter(m => m.role === 'user')
        .reduce((sum, m) => sum + m.content.split(/\s+/).length, 0);
      const totalWords = messages
        .reduce((sum, m) => sum + m.content.split(/\s+/).length, 0);
      analysis.speaking_ratio = totalWords > 0 ? parseFloat((userWords / totalWords).toFixed(2)) : 0;
      analysis.duration_seconds = durationSeconds;
      analysis.exchange_count = exchangeCount;
      analysis.interruption_count = interruptionCount;
    }

    return success(analysis);
  } catch (err) {
    console.error('Analysis error:', err);
    return error(500, 'INTERNAL_ERROR', err.message);
  }
};

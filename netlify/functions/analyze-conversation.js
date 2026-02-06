export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API Key not configured' }) };
  }

  try {
    const { messages, personaName, personaSituation } = JSON.parse(event.body);

    const analysisPrompt = `Du bist ein erfahrener Verkaufstrainer für Solarberater. Analysiere das folgende Kundengespräch und bewerte die Leistung des Beraters.

KUNDE: ${personaName}
SITUATION: ${personaSituation}

GESPRÄCH:
${messages.map(m => `${m.role === 'user' ? 'BERATER' : 'KUNDE'}: ${m.content}`).join('\n')}

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Du bist ein Verkaufstrainer. Antworte nur mit validem JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response (handle potential markdown code blocks)
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      analysis = {
        gesprachsfuhrung: 3,
        aktives_zuhoren: 3,
        klarheit: 3,
        einwand_behandlung: 3,
        empathie: 3,
        uberzeugungskraft: 3,
        gesamtbewertung: 'mittel',
        feedback: 'Das Gespräch konnte nicht vollständig analysiert werden.',
        staerken: [],
        verbesserungen: []
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analysis)
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

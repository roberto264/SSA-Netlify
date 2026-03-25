/**
 * Datenschutzerklärung — DSGVO-konform (CH/EU).
 * WICHTIG: Diesen Text durch einen Juristen prüfen lassen!
 */
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <a href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </a>

        <h1 className="text-3xl font-bold mb-6">Datenschutzerklärung</h1>
        <p className="text-sm text-muted-foreground mb-8">Stand: März 2026</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Verantwortliche Stelle</h2>
            <p className="text-muted-foreground">
              [Firmenname]<br />
              [Adresse]<br />
              [PLZ Ort, Schweiz]<br />
              E-Mail: [datenschutz@domain.ch]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Erhobene Daten</h2>
            <p className="text-muted-foreground">Wir verarbeiten folgende personenbezogene Daten:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Kontodaten:</strong> Name, E-Mail-Adresse, Firmenzugehörigkeit</li>
              <li><strong>Lernfortschritt:</strong> Modulabschlüsse, Quiz-Ergebnisse, Prüfungsergebnisse</li>
              <li><strong>Gesprächsdaten:</strong> Transkripte und Analysen aus Rollenspiel-Übungen</li>
              <li><strong>Nutzungsdaten:</strong> Login-Zeitpunkte, Sitzungsdauer</li>
              <li><strong>Audiodaten:</strong> Sprachaufnahmen während der Rollenspiel-Übungen (werden temporär verarbeitet, nicht dauerhaft gespeichert)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Zweck der Datenverarbeitung</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Bereitstellung der Lernplattform und deren Funktionen</li>
              <li>Personalisiertes Feedback durch KI-gestützte Gesprächsanalyse</li>
              <li>Fortschrittsverfolgung für Lernende und deren Arbeitgeber</li>
              <li>Abrechnung und Abo-Verwaltung</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3a. Einsicht durch Arbeitgeber</h2>
            <p className="text-muted-foreground">
              Wenn Sie über ein Firmenkonto registriert sind, hat der Firma-Administrator (Arbeitgeber) Einsicht in folgende Daten:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Modulfortschritt (abgeschlossene Themen, Prozent)</li>
              <li>Quiz-Ergebnisse (Punkte, bestanden/nicht bestanden)</li>
              <li>Rollenspiel-Bewertungen (Gesamtbewertung, Soft-Skill-Scores)</li>
              <li>Aktivitätsdaten (letzter Login, Anzahl Sitzungen)</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Diese Daten dienen ausschliesslich der Weiterbildung und Personalentwicklung.
              Gesprächsinhalte (Transkripte) werden dem Arbeitgeber <strong>nicht</strong> angezeigt.
              Rechtsgrundlage ist das berechtigte Interesse des Arbeitgebers an der Weiterbildungskontrolle (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Drittanbieter (Auftragsverarbeiter)</h2>
            <p className="text-muted-foreground">Wir nutzen folgende Dienste zur Datenverarbeitung:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Supabase (USA/EU):</strong> Datenbank und Authentifizierung — <a href="https://supabase.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener">Datenschutz</a></li>
              <li><strong>OpenAI (USA):</strong> KI-Textgenerierung und Sprachverarbeitung — <a href="https://openai.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener">Datenschutz</a></li>
              <li><strong>ElevenLabs (USA):</strong> Text-to-Speech und Speech-to-Text — <a href="https://elevenlabs.io/privacy" className="text-primary hover:underline" target="_blank" rel="noopener">Datenschutz</a></li>
              <li><strong>Stripe (USA/EU):</strong> Zahlungsabwicklung — <a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener">Datenschutz</a></li>
              <li><strong>Netlify (USA):</strong> Hosting und Serverless Functions — <a href="https://www.netlify.com/privacy/" className="text-primary hover:underline" target="_blank" rel="noopener">Datenschutz</a></li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Mit allen Anbietern bestehen Auftragsverarbeitungsverträge (AVV) gemäss Art. 28 DSGVO bzw. nDSG.
              Datenübertragungen in die USA erfolgen auf Grundlage von EU-Standardvertragsklauseln (SCC).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Speicherdauer</h2>
            <p className="text-muted-foreground">
              Personenbezogene Daten werden gespeichert, solange Ihr Konto aktiv ist.
              Nach Kontolöschung werden Ihre Daten innerhalb von 30 Tagen endgültig gelöscht.
              Abrechnungsdaten werden gemäss gesetzlicher Aufbewahrungsfristen (10 Jahre) gespeichert.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Ihre Rechte</h2>
            <p className="text-muted-foreground">Sie haben das Recht auf:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Auskunft:</strong> Welche Daten wir über Sie speichern</li>
              <li><strong>Berichtigung:</strong> Korrektur unrichtiger Daten</li>
              <li><strong>Löschung:</strong> Löschung Ihrer Daten ("Recht auf Vergessenwerden")</li>
              <li><strong>Datenportabilität:</strong> Export Ihrer Daten in maschinenlesbarem Format</li>
              <li><strong>Widerspruch:</strong> Gegen die Verarbeitung Ihrer Daten</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Kontaktieren Sie uns unter [datenschutz@domain.ch] oder nutzen Sie die Export-/Lösch-Funktionen in Ihren Kontoeinstellungen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
            <p className="text-muted-foreground">
              Wir verwenden ausschliesslich technisch notwendige Cookies für die Authentifizierung (Session-Cookie).
              Es werden keine Tracking-Cookies oder Analyse-Tools von Drittanbietern eingesetzt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Aufsichtsbehörde</h2>
            <p className="text-muted-foreground">
              Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB)<br />
              Feldeggweg 1, 3003 Bern<br />
              <a href="https://www.edoeb.admin.ch" className="text-primary hover:underline" target="_blank" rel="noopener">www.edoeb.admin.ch</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

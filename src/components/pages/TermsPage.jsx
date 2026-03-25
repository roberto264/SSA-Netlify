/**
 * Allgemeine Geschäftsbedingungen (AGB).
 * WICHTIG: Diesen Text durch einen Juristen prüfen lassen!
 */
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <a href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </a>

        <h1 className="text-3xl font-bold mb-6">Allgemeine Geschäftsbedingungen</h1>
        <p className="text-sm text-muted-foreground mb-8">Stand: März 2026</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Geltungsbereich</h2>
            <p className="text-muted-foreground">
              Diese AGB gelten für die Nutzung der Lernplattform "Swiss Solar Academy" (nachfolgend "Plattform")
              durch Unternehmen (nachfolgend "Kunde") und deren Mitarbeitende (nachfolgend "Nutzer").
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Leistungsumfang</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Zugang zur webbasierten Lernplattform für Solarberater</li>
              <li>KI-gestützte Rollenspiel-Simulationen und Gesprächsanalysen</li>
              <li>Lernmodule mit Quiz-Funktionalität</li>
              <li>Fortschrittsverfolgung und Reporting für Arbeitgeber</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Abonnement und Zahlung</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Die Plattform wird als monatliches oder jährliches Abonnement pro Seat angeboten.</li>
              <li>Jeder Seat berechtigt einen Nutzer zur Nutzung der Plattform.</li>
              <li>Die Abrechnung erfolgt über Stripe. Es gelten die <a href="https://stripe.com/legal" className="text-primary hover:underline" target="_blank" rel="noopener">Stripe-Nutzungsbedingungen</a>.</li>
              <li>Rechnungen werden am Anfang jeder Abrechnungsperiode erstellt.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Testphase</h2>
            <p className="text-muted-foreground">
              Neue Kunden erhalten eine kostenlose Testphase von 14 Tagen mit bis zu 5 Seats.
              Nach Ablauf der Testphase ist ein kostenpflichtiges Abonnement erforderlich, um die Plattform weiter zu nutzen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Kündigung</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Das Abonnement kann jederzeit zum Ende der laufenden Abrechnungsperiode gekündigt werden.</li>
              <li>Die Kündigung erfolgt über das Billing-Portal oder per E-Mail an [support@domain.ch].</li>
              <li>Nach Kündigung bleibt der Zugang bis zum Ende der bezahlten Periode bestehen.</li>
              <li>Bereits gezahlte Beträge werden nicht erstattet.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Nutzungsregeln</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Jeder Seat ist an einen einzelnen Nutzer gebunden und darf nicht geteilt werden.</li>
              <li>Die Plattform darf nur für den vorgesehenen Zweck (Schulung von Solarberatern) genutzt werden.</li>
              <li>Die automatisierte Abfrage der API (Scraping, Bots) ist untersagt.</li>
              <li>Missbräuchliche Nutzung kann zur sofortigen Sperrung führen.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. KI-generierte Inhalte</h2>
            <p className="text-muted-foreground">
              Die Plattform nutzt künstliche Intelligenz für Gesprächssimulationen und Feedback.
              KI-generierte Inhalte können Fehler enthalten und stellen keine verbindliche Beratung dar.
              Die Analyse-Ergebnisse dienen ausschliesslich Schulungszwecken.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Haftung</h2>
            <p className="text-muted-foreground">
              Die Haftung beschränkt sich auf den in der jeweiligen Abrechnungsperiode gezahlten Betrag.
              Für indirekte Schäden, entgangenen Gewinn oder Datenverlust wird keine Haftung übernommen,
              soweit gesetzlich zulässig.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Verfügbarkeit</h2>
            <p className="text-muted-foreground">
              Wir streben eine Verfügbarkeit von 99% an (exkl. geplante Wartungsarbeiten).
              Kurzfristige Unterbrechungen begründen keinen Anspruch auf Preisminderung.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Datenschutz</h2>
            <p className="text-muted-foreground">
              Es gilt unsere <a href="/privacy" className="text-primary hover:underline">Datenschutzerklärung</a>.
              Für Firmenkunden wird auf Anfrage ein Auftragsverarbeitungsvertrag (AVV) gemäss Art. 28 DSGVO bzw. nDSG bereitgestellt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Anwendbares Recht und Gerichtsstand</h2>
            <p className="text-muted-foreground">
              Es gilt schweizerisches Recht. Gerichtsstand ist [Ort], Schweiz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

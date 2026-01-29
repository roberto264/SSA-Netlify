// ============================================
// LERNHILFEN FÜR ALLE MODULE
// ============================================
// Audio, Karteikarten und Mind Map Daten
// Einfach die entsprechenden Daten pro Modul anpassen

export const lernhilfen = {
  // ============================================
  // MODUL 1: GRUNDLAGEN
  // ============================================
  1: {
    audio: {
      title: 'Audio-Zusammenfassung',
      duration: '15:13',
      // Audio-Datei liegt in public/audio/
      url: '/audio/modul1-grundlagen.mp3',
      description: 'Höre dir die wichtigsten Konzepte an - perfekt für unterwegs! 🚗'
    },
    
    flashcards: [
      { 
        question: 'Aus welchen drei Hauptelementen setzt sich der Schweizer Strommix zusammen?', 
        answer: 'Wasserkraft (ca. 60%), Kernenergie (ca. 30%) und neue erneuerbare Energien (ca. 5-10%).' 
      },
      { 
        question: 'Was ist die wichtigste Energiequelle im Schweizer Strommix und warum?', 
        answer: 'Wasserkraft, aufgrund der geografischen Lage mit vielen Flüssen und Bergen.' 
      },
      { 
        question: 'Welches Ziel verfolgt die Energiestrategie 2050 der Schweiz?', 
        answer: 'Eine deutliche Steigerung der erneuerbaren Energien im Strommix und die langfristige Deckung des Bedarfs ohne fossile Energien.' 
      },
      { 
        question: 'Welchen prozentualen Anteil hatten Speicherkraftwerke an der Schweizer Stromproduktion im Jahr 2021?', 
        answer: 'Der Anteil betrug 35,1%.' 
      },
      { 
        question: 'Welchen prozentualen Anteil hatten Kernkraftwerke an der Schweizer Stromproduktion im Jahr 2021?', 
        answer: 'Der Anteil betrug 28,9%.' 
      },
      { 
        question: 'Warum muss die Schweiz im Winter teilweise Strom importieren?', 
        answer: 'Weil die Wasserkraftproduktion geringer ist und Solaranlagen weniger leisten.' 
      },
      { 
        question: 'In wie viele Ebenen ist das Schweizer Stromnetz unterteilt?', 
        answer: 'Das System ist in sieben Netzebenen unterteilt.' 
      },
      { 
        question: 'Welche Funktion und Spannung hat die Netzebene 1 in der Schweiz?', 
        answer: 'Es ist das Übertragungsnetz (380/220 kV) für den Stromtransport über weite Entfernungen.' 
      },
      { 
        question: 'Was ist die Hauptaufgabe der Netzebenen 2, 4 und 6?', 
        answer: 'Die Reduzierung der Spannung mithilfe von Transformatoren für die Weiterleitung an die nächsttiefere Ebene.' 
      },
      { 
        question: 'Welche Netzebene versorgt Haushalte und Kleinunternehmen direkt mit Strom?', 
        answer: 'Netzebene 7, das lokale Verteilnetz.' 
      },
      { 
        question: 'Welche Spannungen liegen in der Netzebene 7 für Endverbraucher an?', 
        answer: 'Die Spannung liegt bei 230 V für normale Steckdosen und 400 V für dreiphasige Anschlüsse.' 
      },
      { 
        question: 'In welcher Netzebene speisen dezentrale Energiequellen wie Photovoltaikanlagen typischerweise ihren Strom ein?', 
        answer: 'In der Netzebene 7 (Lokale Verteilnetze).' 
      },
      { 
        question: 'Was ist die zentrale Schnittstelle zwischen dem öffentlichen Stromnetz und der elektrischen Installation eines Gebäudes?', 
        answer: 'Der Hausanschlusskasten (HAK).' 
      },
      { 
        question: 'Wodurch wird die maximale Leistung einer PV-Anlage, die ins Netz einspeisen kann, primär begrenzt?', 
        answer: 'Durch die Kapazität des Hausanschlusskastens (HAK) und dessen Hauptsicherungen.' 
      },
      { 
        question: 'Wie hoch ist die maximale Einspeiseleistung einer PV-Anlage bei einem typischen Hausanschluss von 25 Ampere pro Phase?', 
        answer: 'Die Obergrenze beträgt ca. 17,3 kW.' 
      },
      { 
        question: 'Welche Nennstromstärke (in Ampere) wird durch die Kennfarbe Gelb bei einer Schmelzsicherung angezeigt?', 
        answer: 'Die Kennfarbe Gelb steht für 25 Ampere.' 
      },
      { 
        question: 'Welche Nennstromstärke (in Ampere) wird durch die Kennfarbe Grau bei einer Schmelzsicherung angezeigt?', 
        answer: 'Die Kennfarbe Grau steht für 16 Ampere.' 
      },
      { 
        question: 'Welche Nennstromstärke (in Ampere) wird durch die Kennfarbe Blau bei einer Schmelzsicherung angezeigt?', 
        answer: 'Die Kennfarbe Blau steht für 20 Ampere.' 
      },
      { 
        question: 'Nennen Sie eine mögliche Lösung, wenn eine geplante PV-Anlage die Leistungsgrenze des Hausanschlusses überschreitet.', 
        answer: 'Entweder wird die PV-Anlage technisch gedrosselt oder der Hausanschluss wird aufgerüstet (z.B. auf 40 A).' 
      },
      { 
        question: 'Was ist ein Vorteil eines aussen montierten Hausanschlusskastens (HAK)?', 
        answer: 'Er bietet einfachen Zugang für den Netzbetreiber und oft kürzere Kabelwege zur PV-Anlage.' 
      },
      { 
        question: 'Was ist die Funktion des Zählerkastens im Hausnetz?', 
        answer: 'Im Zählerkasten wird der Stromverbrauch durch den Stromzähler gemessen.' 
      },
      { 
        question: 'Was versteht man unter dem Hausnetz?', 
        answer: 'Das Hausnetz beschreibt die gesamte elektrische Infrastruktur innerhalb eines Gebäudes zur Verteilung der Energie.' 
      },
      { 
        question: 'Was verteilt den Strom auf die einzelnen Stromkreise des Hauses?', 
        answer: 'Die Hauptverteilung (und ggf. Unterverteilungen).' 
      },
      { 
        question: 'Welche Spannung wird im Schweizer Hausnetz typischerweise für normale Steckdosen und Kleingeräte verwendet?', 
        answer: 'Es wird eine Niederspannung von 230 Volt verwendet.' 
      },
      { 
        question: 'Welcher Stromanschluss wird für leistungsstarke Geräte wie Kochherde oder Wärmepumpen benötigt?', 
        answer: 'Es wird Drehstrom (400 Volt) über einen dreiphasigen Anschluss benötigt.' 
      },
      { 
        question: 'Welche Schutzmassnahme im Hausnetz schützt Menschen vor elektrischen Unfällen bei Fehlerströmen?', 
        answer: 'Der Fehlerstrom-Schutzschalter (FI-Schalter).' 
      },
      { 
        question: 'Was ist die Funktion von Leitungsschutzschaltern?', 
        answer: 'Bei Überlastung oder Kurzschluss den Stromfluss in einem Stromkreis automatisch zu unterbrechen.' 
      },
      { 
        question: 'Was ist einphasiger Strom?', 
        answer: 'Der elektrische Strom wird über eine einzige Phase geleitet und hat eine Spannung von 230 V.' 
      },
      { 
        question: 'Was ist dreiphasiger Strom (Drehstrom)?', 
        answer: 'Der Strom wird über drei um 120° versetzte Phasen geleitet, was eine Spannung von 400 V zwischen den Phasen ergibt.' 
      },
      { 
        question: 'Nennen Sie zwei typische Anwendungsbeispiele für dreiphasigen Strom im Haushalt.', 
        answer: 'Kochherde, Backöfen, Wärmepumpen oder Ladestationen für Elektroautos.' 
      },
      { 
        question: 'Warum ist dreiphasiger Strom effizienter für den Betrieb von Elektromotoren?', 
        answer: 'Weil die drei Phasen eine rotierende Magnetkraft erzeugen, die den Motor gleichmässig antreibt.' 
      },
      { 
        question: 'Wie wird der dreiphasige Strom vom Hausanschluss für normale Steckdosen nutzbar gemacht?', 
        answer: 'Für normale Steckdosen (230 V) wird jeweils nur eine der drei Phasen verwendet.' 
      },
      { 
        question: 'Was ist der grundlegende Unterschied zwischen Gleichstrom (DC) und Wechselstrom (AC)?', 
        answer: 'Bei Gleichstrom fliessen die Elektronen konstant in eine Richtung, bei Wechselstrom ändern sie periodisch ihre Richtung.' 
      },
      { 
        question: 'Welche Stromart wird von Batterien, Akkus und Photovoltaikmodulen erzeugt oder geliefert?', 
        answer: 'Sie liefern Gleichstrom (DC – Direct Current).' 
      },
      { 
        question: 'Welche Stromart wird im öffentlichen Stromnetz und im Hausnetz für die meisten Geräte verwendet?', 
        answer: 'Es wird Wechselstrom (AC – Alternating Current) verwendet.' 
      },
      { 
        question: 'Mit welcher Frequenz ändert der Wechselstrom in Europa seine Richtung?', 
        answer: 'Mit einer Frequenz von 50 Hertz (Hz).' 
      },
      { 
        question: 'Welches Bauteil wird benötigt, um den von Solarmodulen erzeugten Gleichstrom ins Hausnetz einspeisen zu können?', 
        answer: 'Ein Wechselrichter, der den Gleichstrom (DC) in Wechselstrom (AC) umwandelt.' 
      },
      { 
        question: 'Was wandeln Netzteile für Laptops oder Smartphones um?', 
        answer: 'Wechselstrom (AC) aus der Steckdose in Gleichstrom (DC), den das Gerät intern benötigt.' 
      },
      { 
        question: 'Was ist der Hauptgrund, warum Wechselstrom für die Übertragung über lange Strecken effizienter ist?', 
        answer: 'Weil seine Spannung mithilfe von Transformatoren einfach erhöht oder reduziert werden kann, was Verluste minimiert.' 
      },
      { 
        question: 'In welcher Jahreszeit erreicht die Stromproduktion einer PV-Anlage in der Schweiz ihren Höhepunkt?', 
        answer: 'In den Sommermonaten, typischerweise von Mai bis Juli.' 
      },
      { 
        question: 'Zu welcher Tageszeit produziert eine Photovoltaikanlage den meisten Strom?', 
        answer: 'Zur Mittagszeit, wenn die Sonneneinstrahlung am intensivsten ist.' 
      },
      { 
        question: 'Warum besteht oft eine Diskrepanz zwischen der PV-Produktionsspitze und dem Haushaltsverbrauch?', 
        answer: 'Die Produktion ist mittags am höchsten, während die Verbrauchsspitzen oft morgens und abends liegen.' 
      },
      { 
        question: 'Welche zwei Massnahmen können helfen, den Eigenverbrauch von Solarstrom zu erhöhen?', 
        answer: 'Eine zeitliche Verschiebung des Stromverbrauchs (z.B. Geräte mittags laufen lassen) oder der Einsatz eines Batteriespeichers.' 
      }
    ],
    
    mindmap: {
      centerLabel: 'Grundlagen Photovoltaik',
      topics: [
        {
          id: 'strommix',
          title: 'Strommix Schweiz',
          color: '#6366f1',
          details: [
            'Wasserkraft (ca. 60%)',
            'Kernenergie (ca. 30%)',
            'Erneuerbare Energien (5-10%)',
            'Fossile Energien (< 5%)',
            'Energiestrategie 2050'
          ]
        },
        {
          id: 'netzebenen',
          title: 'Netzebenen',
          color: '#8b5cf6',
          details: [
            'Ebene 1: Übertragungsnetz (380/220 kV)',
            'Ebenen 2, 4, 6: Transformierung',
            'Ebene 3: Überregionale Verteilnetze',
            'Ebene 5: Regionale Verteilnetze',
            'Ebene 7: Lokale Verteilnetze (< 1 kV)'
          ]
        },
        {
          id: 'hak',
          title: 'Hausanschlusskasten',
          color: '#a855f7',
          details: [
            'Schnittstelle zum öffentlichen Netz',
            'Begrenzung PV-Leistung (17.3 kW bei 25A)',
            'Farbskala Schmelzsicherungen',
            'Position: Innen oder Aussen'
          ]
        },
        {
          id: 'hausnetz',
          title: 'Hausnetz',
          color: '#d946ef',
          details: [
            'Zählerkasten (Messung)',
            'Haupt- und Unterverteilung',
            'Schutzmassnahmen (FI-Schalter, Erdung)',
            'Stromkreise (Licht, Steckdosen, Grossgeräte)'
          ]
        },
        {
          id: 'phasen',
          title: 'Ein-/Dreiphasig',
          color: '#ec4899',
          details: [
            'Einphasig: 230 V (Haushaltsgeräte)',
            'Dreiphasig: 400 V (Grossverbraucher)',
            'Effizienz: Bessere Lastverteilung'
          ]
        },
        {
          id: 'strom',
          title: 'DC & AC Strom',
          color: '#f43f5e',
          details: [
            'DC: Konstante Richtung (PV-Module, Batterien)',
            'AC: Richtungswechsel (Hausnetz, Transport)',
            'Wechselrichter: Umwandlung DC in AC'
          ]
        },
        {
          id: 'produktion',
          title: 'Energieproduktion',
          color: '#f97316',
          details: [
            'Jahresverlauf: Maximum im Sommer',
            'Tagesverlauf: Mittagsspitze',
            'Eigenverbrauchsoptimierung',
            'Überschussmanagement (Speicher/Einspeisung)'
          ]
        }
      ]
    }
  },

  // ============================================
  // MODUL 2: SYSTEMKOMPONENTEN
  // ============================================
  2: {
    audio: {
      title: 'Audio-Zusammenfassung',
      duration: '15:20',
      url: null,
      description: 'Lerne alle Komponenten einer PV-Anlage kennen! 🔧'
    },
    
    flashcards: [
      { 
        question: 'Was sind die Hauptbestandteile eines Solarmoduls?', 
        answer: 'Solarzellen (meist Silizium), Glasabdeckung, EVA-Folie, Rückseitenfolie und Alurahmen.' 
      },
      { 
        question: 'Was ist die Aufgabe des Wechselrichters?', 
        answer: 'Wandelt Gleichstrom (DC) der Module in netzkonformen Wechselstrom (AC) um und überwacht die Anlage.' 
      },
      { 
        question: 'Wann lohnt sich ein Batteriespeicher?', 
        answer: 'Bei niedrigem Eigenverbrauch, hohen Strompreisen, oder wenn Notstromfunktion gewünscht ist.' 
      },
      { 
        question: 'Was macht ein Optimizer?', 
        answer: 'Maximiert die Leistung jedes einzelnen Moduls, besonders bei Teilverschattung.' 
      },
      { 
        question: 'Was ist ein Hybrid-Wechselrichter?', 
        answer: 'Kombiniert Wechselrichter und Batteriemanagement in einem Gerät.' 
      },
      { 
        question: 'Wie funktioniert eine Notstrombox?', 
        answer: 'Trennt das Haus vom Netz bei Stromausfall und versorgt es aus Batterie und PV-Anlage.' 
      }
    ],
    
    mindmap: {
      centerLabel: 'Systemkomponenten',
      topics: [
        {
          id: 'module',
          title: 'Solarmodule',
          color: '#6366f1',
          details: [
            'Monokristallin vs. Polykristallin',
            'Leistung: 350-450 Wp',
            'Wirkungsgrad: 18-22%',
            'Glas-Glas vs. Glas-Folie',
            'Garantie: 25-30 Jahre'
          ]
        },
        {
          id: 'wechselrichter',
          title: 'Wechselrichter',
          color: '#8b5cf6',
          details: [
            'String-Wechselrichter',
            'Hybrid-Wechselrichter',
            'Micro-Inverter',
            'MPP-Tracking',
            'Monitoring-Funktion'
          ]
        },
        {
          id: 'speicher',
          title: 'Batteriespeicher',
          color: '#a855f7',
          details: [
            'Lithium-Ionen-Technologie',
            'Kapazität: 5-15 kWh',
            'AC- vs. DC-gekoppelt',
            'Notstromfähigkeit',
            'Lebensdauer: 10-15 Jahre'
          ]
        },
        {
          id: 'optimizer',
          title: 'Optimierer',
          color: '#d946ef',
          details: [
            'Modul-Level-Optimierung',
            'Verschattungsmanagement',
            'Sicherheitsabschaltung',
            'Monitoring pro Modul'
          ]
        },
        {
          id: 'wallbox',
          title: 'Ladestationen',
          color: '#ec4899',
          details: [
            'Wallbox 11/22 kW',
            'Lastmanagement',
            'PV-Überschussladen',
            'Abrechnungsfunktion'
          ]
        },
        {
          id: 'manager',
          title: 'Energiemanager',
          color: '#f97316',
          details: [
            'Eigenverbrauchsoptimierung',
            'Smart Home Integration',
            'Laststeuerung',
            'Visualisierung'
          ]
        }
      ]
    }
  },

  // ============================================
  // MODUL 3: PLANUNG
  // ============================================
  3: {
    audio: {
      title: 'Audio-Zusammenfassung',
      duration: '11:45',
      url: null,
      description: 'Planung und Dimensionierung einer PV-Anlage! 📐'
    },
    
    flashcards: [
      { 
        question: 'Welche Dachausrichtung ist optimal für PV?', 
        answer: 'Süden ist optimal, aber Ost-West-Anlagen sind gut für Eigenverbrauch (morgens und abends Strom).' 
      },
      { 
        question: 'Was ist der optimale Neigungswinkel?', 
        answer: 'In der Schweiz ca. 30-35° für maximalen Jahresertrag. Flachdächer werden mit Aufständerung realisiert.' 
      },
      { 
        question: 'Wie berechnet man die Anlagengrösse?', 
        answer: 'Faustformel: Jahresverbrauch (kWh) / 1000 = Anlagengrösse (kWp). Beispiel: 5000 kWh → ca. 5 kWp.' 
      },
      { 
        question: 'Was beeinflusst die Verschattung?', 
        answer: 'Nachbargebäude, Bäume, Kamine, Satellitenschüsseln, Dachfenster und der Horizont.' 
      },
      { 
        question: 'Wann lohnt sich ein Batteriespeicher?', 
        answer: 'Bei Eigenverbrauch unter 30%, hohen Strompreisen (>25 Rp/kWh), oder bei Wunsch nach Autarkie/Notstrom.' 
      }
    ],
    
    mindmap: {
      centerLabel: 'Planung & Dimensionierung',
      topics: [
        {
          id: 'standort',
          title: 'Standortanalyse',
          color: '#6366f1',
          details: [
            'Dachfläche messen',
            'Ausrichtung bestimmen',
            'Neigung ermitteln',
            'Verschattung prüfen'
          ]
        },
        {
          id: 'sonne',
          title: 'Sonnenverlauf',
          color: '#f97316',
          details: [
            'Azimut (Himmelsrichtung)',
            'Elevation (Sonnenhöhe)',
            'Sommer vs. Winter',
            'Horizontverschattung'
          ]
        },
        {
          id: 'dimensionierung',
          title: 'Dimensionierung',
          color: '#8b5cf6',
          details: [
            'Stromverbrauch analysieren',
            'Eigenverbrauch berechnen',
            'Modulanzahl bestimmen',
            'Wechselrichter auslegen'
          ]
        },
        {
          id: 'speicher',
          title: 'Speicherplanung',
          color: '#a855f7',
          details: [
            'Eigenverbrauchsquote',
            'Autarkiegrad',
            'Kosten-Nutzen-Analyse',
            'Notstromkonzept'
          ]
        },
        {
          id: 'ertrag',
          title: 'Ertragsberechnung',
          color: '#22c55e',
          details: [
            'Globalstrahlung Schweiz',
            'Systemverluste',
            'Spezifischer Ertrag',
            'Simulationstools'
          ]
        }
      ]
    }
  },

  // ============================================
  // MODUL 4: INSTALLATION
  // ============================================
  4: {
    audio: {
      title: 'Audio-Zusammenfassung',
      duration: '14:10',
      url: null,
      description: 'Alles über Montage und Installation! 🔨'
    },
    
    flashcards: [
      { 
        question: 'Welche Dacheindeckungen sind für PV geeignet?', 
        answer: 'Ziegel, Blechdach, Flachdach, Eternit (Vorsicht: Asbest bei alten Platten!), Bitumen.' 
      },
      { 
        question: 'Was ist bei Flachdächern zu beachten?', 
        answer: 'Aufständerung nötig, Ballastierung oder Verankerung, Dachlast prüfen, Wartungswege einplanen.' 
      },
      { 
        question: 'Wann braucht man Schneefanggitter?', 
        answer: 'Bei glatten Moduloberflächen in schneereichen Gebieten, besonders über Eingängen und Wegen.' 
      },
      { 
        question: 'Was ist ein Potentialausgleich?', 
        answer: 'Verbindet alle metallischen Teile mit der Erdung zum Schutz vor Blitzschlag und Überspannung.' 
      },
      { 
        question: 'Welche Sicherheitsabstände gelten auf dem Dach?', 
        answer: 'Mind. 50cm zum First für Feuerwehrzugang, Abstand zu Dachrand und Kamin beachten.' 
      }
    ],
    
    mindmap: {
      centerLabel: 'Installation & Montage',
      topics: [
        {
          id: 'dach',
          title: 'Dacheindeckungen',
          color: '#6366f1',
          details: [
            'Ziegeldach (Aufdach)',
            'Blechdach (Klemmen)',
            'Flachdach (Aufständerung)',
            'Indach-Systeme'
          ]
        },
        {
          id: 'montage',
          title: 'Montagesysteme',
          color: '#8b5cf6',
          details: [
            'Dachhaken',
            'Schienensystem',
            'Modulklemmen',
            'Ballastierung'
          ]
        },
        {
          id: 'elektro',
          title: 'Elektroinstallation',
          color: '#a855f7',
          details: [
            'DC-Verkabelung',
            'AC-Anschluss',
            'Zählerschrank',
            'Potentialausgleich'
          ]
        },
        {
          id: 'sicherheit',
          title: 'Sicherheit',
          color: '#ef4444',
          details: [
            'Absturzsicherung',
            'Schneefang',
            'Brandschutz',
            'Feuerwehrschalter'
          ]
        },
        {
          id: 'abnahme',
          title: 'Abnahme',
          color: '#22c55e',
          details: [
            'Inbetriebnahme',
            'Anmeldung Netzbetreiber',
            'Dokumentation',
            'Garantie'
          ]
        }
      ]
    }
  },

  // ============================================
  // MODUL 5: WIRTSCHAFTLICHKEIT
  // ============================================
  5: {
    audio: {
      title: 'Audio-Zusammenfassung',
      duration: '13:25',
      url: null,
      description: 'Wirtschaftlichkeit und Förderprogramme! 💰'
    },
    
    flashcards: [
      { 
        question: 'Was ist die Einmalvergütung (EIV)?', 
        answer: 'Bundesförderung für PV-Anlagen. Ca. 300-400 CHF/kWp, max. 30% der Investitionskosten.' 
      },
      { 
        question: 'Wie berechnet man die Amortisationszeit?', 
        answer: 'Investition ÷ jährliche Ersparnis. Beispiel: 25000 CHF ÷ 2500 CHF/Jahr = 10 Jahre.' 
      },
      { 
        question: 'Was ist der Unterschied zwischen Eigenverbrauch und Einspeisung?', 
        answer: 'Eigenverbrauch: Selbst genutzter Strom (spart ca. 25 Rp/kWh). Einspeisung: Verkauf an Netzbetreiber (ca. 8-12 Rp/kWh).' 
      },
      { 
        question: 'Welche steuerlichen Vorteile gibt es?', 
        answer: 'PV-Investitionen sind in den meisten Kantonen als Unterhaltskosten von den Steuern abziehbar.' 
      },
      { 
        question: 'Was ist der Bezugstarif?', 
        answer: 'Der Preis für Strom vom Netz (Hochtarif/Niedertarif). Wichtig für die Wirtschaftlichkeitsberechnung.' 
      },
      { 
        question: 'Wie hoch ist die typische Rendite einer PV-Anlage?', 
        answer: 'Bei guter Planung 5-8% pro Jahr über 25 Jahre Lebensdauer.' 
      }
    ],
    
    mindmap: {
      centerLabel: 'Wirtschaftlichkeit',
      topics: [
        {
          id: 'kosten',
          title: 'Investitionskosten',
          color: '#6366f1',
          details: [
            'Module (30-40%)',
            'Wechselrichter (15-20%)',
            'Montage (20-25%)',
            'Planung & Admin (10-15%)'
          ]
        },
        {
          id: 'foerderung',
          title: 'Förderprogramme',
          color: '#22c55e',
          details: [
            'Einmalvergütung (EIV)',
            'Kantonale Förderung',
            'Gemeinde-Beiträge',
            'Steuerabzug'
          ]
        },
        {
          id: 'ertrag',
          title: 'Ertragsseite',
          color: '#f97316',
          details: [
            'Eigenverbrauchsersparnis',
            'Einspeisevergütung',
            'HKN-Verkauf',
            'Steuerersparnis'
          ]
        },
        {
          id: 'rechnung',
          title: 'Stromrechnung',
          color: '#8b5cf6',
          details: [
            'Energiepreis',
            'Netznutzung',
            'Abgaben & Steuern',
            'Hoch-/Niedertarif'
          ]
        },
        {
          id: 'kennzahlen',
          title: 'Kennzahlen',
          color: '#a855f7',
          details: [
            'Amortisationszeit',
            'Rendite (ROI)',
            'Gestehungskosten (LCOE)',
            'Eigenverbrauchsquote'
          ]
        }
      ]
    }
  }
};

// Helper-Funktion zum Abrufen der Lernhilfen für ein Modul
export const getLernhilfen = (modulId) => {
  return lernhilfen[modulId] || null;
};

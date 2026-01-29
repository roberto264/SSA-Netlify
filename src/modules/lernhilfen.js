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
      duration: '12:34',
      // URL zur Audio-Datei (später hinzufügen)
      url: null,
      description: 'Höre dir die wichtigsten Konzepte an - perfekt für unterwegs! 🚗'
    },
    
    flashcards: [
      { 
        question: 'Wie viel Prozent des Schweizer Stroms stammt aus Wasserkraft?', 
        answer: 'Etwa 60% des Schweizer Stroms wird aus Wasserkraft gewonnen.' 
      },
      { 
        question: 'Was ist der Unterschied zwischen Gleichstrom (DC) und Wechselstrom (AC)?', 
        answer: 'DC fliesst konstant in eine Richtung (z.B. aus Batterien/Solarmodulen). AC wechselt die Richtung periodisch (50Hz im Hausnetz).' 
      },
      { 
        question: 'Was ist die Funktion des Hausanschlusskastens (HAK)?', 
        answer: 'Der HAK ist die Schnittstelle zwischen öffentlichem Netz und Hausinstallation. Er enthält die Hauptsicherung.' 
      },
      { 
        question: 'Was ist der Unterschied zwischen einphasigem und dreiphasigem Strom?', 
        answer: 'Einphasig: 230V für normale Geräte. Dreiphasig: 400V für Grossverbraucher wie Herd, Wärmepumpe oder Wallbox.' 
      },
      { 
        question: 'Welche Netzebene versorgt Haushalte?', 
        answer: 'Ebene 7 - das lokale Verteilnetz mit weniger als 1 kV Spannung.' 
      },
      { 
        question: 'Was macht ein Wechselrichter?', 
        answer: 'Er wandelt den Gleichstrom (DC) der Solarmodule in Wechselstrom (AC) für das Hausnetz um.' 
      },
      {
        question: 'Wie viele Netzebenen gibt es in der Schweiz?',
        answer: '7 Netzebenen: Ebene 1 (Höchstspannung 380kV) bis Ebene 7 (Niederspannung 400V).'
      },
      {
        question: 'Was ist das Ziel der Energiestrategie 2050?',
        answer: 'Ausstieg aus der Kernenergie und massiver Ausbau erneuerbarer Energien wie Photovoltaik.'
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

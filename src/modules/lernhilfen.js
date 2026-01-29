// ============================================
// LERNHILFEN FÜR ALLE MODULE
// ============================================
// Audio und Mind Map Daten hier
// Karteikarten werden aus separaten Dateien importiert

import { getFlashcards } from './flashcards';

export const lernhilfen = {
  // ============================================
  // MODUL 1: GRUNDLAGEN
  // ============================================
  1: {
    audio: {
      title: 'Audio-Zusammenfassung',
      duration: '15:13',
      url: '/audio/modul1-grundlagen.mp3',
      description: 'Höre dir die wichtigsten Konzepte an - perfekt für unterwegs! 🚗'
    },
    
    // Karteikarten werden aus separater Datei geladen
    get flashcards() {
      return getFlashcards(1);
    },
    
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
      url: null, // Noch keine Audio-Datei
      description: 'Lerne alle Komponenten einer PV-Anlage kennen! 🔧'
    },
    
    get flashcards() {
      return getFlashcards(2);
    },
    
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
    
    get flashcards() {
      return getFlashcards(3);
    },
    
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
    
    get flashcards() {
      return getFlashcards(4);
    },
    
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
    
    get flashcards() {
      return getFlashcards(5);
    },
    
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

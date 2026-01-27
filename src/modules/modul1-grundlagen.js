// ============================================
// MODUL 1: GRUNDLAGEN
// ============================================
// Hier kannst du Themen, Materialien und Fragen bearbeiten
// ohne den Rest des Codes anzufassen.

export const modul1 = {
  id: 1,
  title: 'Grundlagen',
  description: 'Strommix, Netzebenen, Hausinstallation',
  icon: '⚡',
  color: 'from-blue-500 to-blue-600',
  
  topics: [
    {
      id: 'strommix',
      title: 'Strommix Schweiz',
      description: 'Woher kommt der Strom in der Schweiz?',
      
      // Materialien (optional) - PDFs, Videos, Links
      materialien: [
        // { type: 'pdf', title: 'Strommix Übersicht', url: '/docs/strommix.pdf' },
        // { type: 'video', title: 'Erklärvideo', url: 'https://youtube.com/...' },
        // { type: 'link', title: 'BFE Statistik', url: 'https://...' },
      ],
      
      // Quiz-Fragen
      questions: [
        {
          question: 'Welche Energiequelle liefert den grössten Anteil am Schweizer Strommix?',
          options: ['Kernkraft', 'Wasserkraft', 'Solarenergie', 'Windkraft'],
          correct: 1,
          explanation: 'Die Wasserkraft liefert ca. 60% des Schweizer Stroms und ist damit die wichtigste Quelle.'
        },
        {
          question: 'Wie hoch ist der Anteil erneuerbarer Energien am Schweizer Strommix ungefähr?',
          options: ['25%', '50%', '75%', '90%'],
          correct: 2,
          explanation: 'Ca. 75% des Schweizer Stroms stammt aus erneuerbaren Quellen (hauptsächlich Wasserkraft).'
        },
        {
          question: 'Was ist ein Ziel der Energiestrategie 2050?',
          options: ['Mehr Kernkraftwerke bauen', 'Ausbau erneuerbarer Energien', 'Stromimport erhöhen', 'Stromverbrauch verdoppeln'],
          correct: 1,
          explanation: 'Die Energiestrategie 2050 sieht den Ausstieg aus der Kernenergie und den Ausbau erneuerbarer Energien vor.'
        }
      ]
    },
    
    {
      id: 'netzebenen',
      title: 'Netzebenen',
      description: 'Vom Kraftwerk bis zur Steckdose',
      
      materialien: [
        // Füge hier Materialien hinzu
      ],
      
      questions: [
        {
          question: 'Wie viele Netzebenen gibt es in der Schweiz?',
          options: ['3', '5', '7', '9'],
          correct: 2,
          explanation: 'Es gibt 7 Netzebenen in der Schweiz (1 = Höchstspannung, 7 = Niederspannung).'
        },
        {
          question: 'Auf welcher Netzebene speisen Haushalte Solarstrom ein?',
          options: ['Netzebene 1', 'Netzebene 4', 'Netzebene 7', 'Netzebene 5'],
          correct: 2,
          explanation: 'Haushalte speisen auf Netzebene 7 (Niederspannung, 400V) ein.'
        },
        {
          question: 'Wer ist für das Niederspannungsnetz zuständig?',
          options: ['Swissgrid', 'Lokales Elektrizitätswerk', 'Der Kanton', 'Der Hauseigentümer'],
          correct: 1,
          explanation: 'Lokale Elektrizitätswerke (Verteilnetzbetreiber) sind für das Niederspannungsnetz verantwortlich.'
        }
      ]
    },
    
    {
      id: 'hausanschluss',
      title: 'Hausanschluss',
      description: 'Hausanschlusskasten und Sicherungskasten',
      
      materialien: [],
      
      questions: [
        {
          question: 'Was ist die Funktion des Hausanschlusskastens (HAK)?',
          options: ['Strom messen', 'Verbindung zum Netz herstellen', 'Strom speichern', 'Spannung erhöhen'],
          correct: 1,
          explanation: 'Der HAK ist die Schnittstelle zwischen dem öffentlichen Netz und der Hausinstallation.'
        },
        {
          question: 'Wer darf Arbeiten am Hausanschlusskasten durchführen?',
          options: ['Jeder Elektriker', 'Nur der Netzbetreiber', 'Der Hauseigentümer', 'Nur Solarteure'],
          correct: 1,
          explanation: 'Arbeiten am HAK dürfen nur vom zuständigen Netzbetreiber durchgeführt werden.'
        }
      ]
    },
    
    {
      id: 'stromnetz-haus',
      title: 'Stromnetz im Haus',
      description: 'Einphasig, Dreiphasig, Gleich- und Wechselstrom',
      
      materialien: [],
      
      questions: [
        {
          question: 'Welche Spannung liegt im Schweizer Hausnetz an?',
          options: ['110V', '230V', '380V', '400V'],
          correct: 1,
          explanation: 'In der Schweiz beträgt die Netzspannung 230V (einphasig) bzw. 400V (dreiphasig).'
        },
        {
          question: 'Was produziert ein Solarmodul?',
          options: ['Wechselstrom (AC)', 'Gleichstrom (DC)', 'Drehstrom', 'Hochspannung'],
          correct: 1,
          explanation: 'Solarmodule produzieren Gleichstrom (DC), der vom Wechselrichter in Wechselstrom (AC) umgewandelt wird.'
        },
        {
          question: 'Wofür wird ein dreiphasiger Anschluss benötigt?',
          options: ['Nur für Licht', 'Für Grossverbraucher wie Herd, Wärmepumpe', 'Nur für Computer', 'Für Handyladegeräte'],
          correct: 1,
          explanation: 'Dreiphasige Anschlüsse werden für Grossverbraucher wie E-Herd, Wärmepumpe oder Wallbox benötigt.'
        }
      ]
    }
  ]
};

// ============================================
// MODUL 3: PLANUNG UND DIMENSIONIERUNG
// ============================================

export const modul3 = {
  id: 3,
  title: 'Planung',
  description: 'Dimensionierung und Auslegung',
  icon: '📐',
  color: 'from-amber-500 to-orange-500',
  
  topics: [
    {
      id: 'dimensionierung',
      title: 'Anlagengrösse',
      description: 'Berechnung der optimalen Grösse',
      
      materialien: [
        // { type: 'pdf', title: 'Dimensionierungs-Leitfaden', url: '/docs/dimensionierung.pdf' },
        // { type: 'link', title: 'Solarrechner', url: 'https://www.energieschweiz.ch/...' },
      ],
      
      questions: [
        {
          question: 'Wie viel kWp pro Person rechnet man als Faustregel?',
          options: ['0.5 kWp', '1-1.5 kWp', '3 kWp', '5 kWp'],
          correct: 1,
          explanation: 'Als Faustregel rechnet man 1-1.5 kWp pro Person im Haushalt.'
        },
        {
          question: 'Wie viel m² Dachfläche braucht man für 1 kWp?',
          options: ['2-3 m²', '5-7 m²', '10-12 m²', '15-20 m²'],
          correct: 1,
          explanation: 'Für 1 kWp benötigt man etwa 5-7 m² Dachfläche (je nach Moduleffizienz).'
        },
        {
          question: 'Wie viel kWh produziert 1 kWp in der Schweiz pro Jahr?',
          options: ['500 kWh', '700 kWh', '900-1000 kWh', '1500 kWh'],
          correct: 2,
          explanation: 'In der Schweiz produziert 1 kWp etwa 900-1000 kWh pro Jahr (je nach Standort und Ausrichtung).'
        }
      ]
    },
    
    {
      id: 'ausrichtung',
      title: 'Dachausrichtung',
      description: 'Einfluss von Neigung und Himmelsrichtung',
      
      materialien: [],
      
      questions: [
        {
          question: 'Welche Ausrichtung bringt den höchsten Jahresertrag?',
          options: ['Norden', 'Osten', 'Süden', 'Westen'],
          correct: 2,
          explanation: 'Südausrichtung bringt den höchsten Jahresertrag (100%). Ost/West erreichen ca. 80-85%.'
        },
        {
          question: 'Welche Dachneigung ist optimal für die Schweiz?',
          options: ['0° (flach)', '15-20°', '30-35°', '60-70°'],
          correct: 2,
          explanation: 'Eine Neigung von 30-35° ist in der Schweiz optimal für den Jahresertrag.'
        },
        {
          question: 'Wann ist eine Ost-West-Ausrichtung sinnvoll?',
          options: ['Nie', 'Bei hohem Eigenverbrauch', 'Nur im Gebirge', 'Bei Schnee'],
          correct: 1,
          explanation: 'Ost-West liefert gleichmässigere Produktion über den Tag und ist ideal für hohen Eigenverbrauch.'
        }
      ]
    },
    
    {
      id: 'verschattung',
      title: 'Verschattungsanalyse',
      description: 'Sonnenverlauf und Hindernisse',
      
      materialien: [],
      
      questions: [
        {
          question: 'Welches Tool wird für die Verschattungsanalyse verwendet?',
          options: ['Thermometer', 'Sonnenbahnindikator / 3D-Software', 'Kompass', 'Wetterbericht'],
          correct: 1,
          explanation: 'Sonnenbahnindikator oder 3D-Software (z.B. PV*SOL, Eturnity) zeigen Verschattung über das Jahr.'
        },
        {
          question: 'Wann ist die Verschattung am kritischsten?',
          options: ['Im Sommer', 'Im Winter', 'Am Mittag', 'In der Nacht'],
          correct: 1,
          explanation: 'Im Winter steht die Sonne tiefer, daher werfen Hindernisse längere Schatten.'
        },
        {
          question: 'Wie kann man Verschattungsprobleme lösen?',
          options: ['Grössere Module', 'Moduloptimierer oder Mikrowechselrichter', 'Mehr Module', 'Batterie'],
          correct: 1,
          explanation: 'Moduloptimierer oder Mikrowechselrichter optimieren jedes Modul einzeln und minimieren Verschattungsverluste.'
        }
      ]
    },
    
    {
      id: 'eigenverbrauch',
      title: 'Eigenverbrauchsoptimierung',
      description: 'Speicher ja oder nein?',
      
      materialien: [],
      
      questions: [
        {
          question: 'Wie hoch ist der typische Eigenverbrauch ohne Speicher?',
          options: ['10-20%', '25-35%', '50-60%', '80-90%'],
          correct: 1,
          explanation: 'Ohne Speicher liegt der Eigenverbrauch typischerweise bei 25-35% (je nach Verbrauchsprofil).'
        },
        {
          question: 'Wie viel kann ein Batteriespeicher den Eigenverbrauch erhöhen?',
          options: ['Auf 40-50%', 'Auf 60-80%', 'Auf 100%', 'Gar nicht'],
          correct: 1,
          explanation: 'Mit Batteriespeicher lässt sich der Eigenverbrauch typischerweise auf 60-80% steigern.'
        },
        {
          question: 'Wann lohnt sich ein Batteriespeicher wirtschaftlich?',
          options: ['Immer', 'Bei grosser Differenz zwischen Einspeise- und Bezugstarif', 'Nie', 'Nur bei Notstrom'],
          correct: 1,
          explanation: 'Je grösser die Differenz zwischen Bezugstarif und Einspeisevergütung, desto eher lohnt sich ein Speicher.'
        }
      ]
    }
  ]
};

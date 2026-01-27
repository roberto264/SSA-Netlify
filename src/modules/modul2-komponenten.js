// ============================================
// MODUL 2: SYSTEMKOMPONENTEN
// ============================================

export const modul2 = {
  id: 2,
  title: 'Systemkomponenten',
  description: 'Module, Wechselrichter, Speicher',
  icon: '🔧',
  color: 'from-purple-500 to-purple-600',
  
  topics: [
    {
      id: 'solarmodule',
      title: 'Solarmodule',
      description: 'Aufbau, Typen und Funktion',
      
      materialien: [
        // { type: 'pdf', title: 'Modultypen Vergleich', url: '/docs/modultypen.pdf' },
      ],
      
      questions: [
        {
          question: 'Welcher Zelltyp hat den höchsten Wirkungsgrad?',
          options: ['Polykristallin', 'Monokristallin', 'Dünnschicht', 'Organisch'],
          correct: 1,
          explanation: 'Monokristalline Zellen haben den höchsten Wirkungsgrad (bis 22% im Standardmodul).'
        },
        {
          question: 'Was passiert bei Teilverschattung eines Moduls?',
          options: ['Nichts', 'Leistung sinkt proportional', 'Gesamte Leistung bricht ein', 'Modul schaltet ab'],
          correct: 2,
          explanation: 'Bei Teilverschattung kann die Leistung des gesamten Strings überproportional einbrechen (Hot-Spot-Effekt).'
        },
        {
          question: 'Wie lange beträgt die typische Leistungsgarantie?',
          options: ['10 Jahre', '15 Jahre', '25 Jahre', '30 Jahre'],
          correct: 2,
          explanation: 'Die meisten Hersteller geben 25 Jahre Leistungsgarantie (mind. 80% der Nennleistung).'
        },
        {
          question: 'Was bedeutet "bifazial" bei Solarmodulen?',
          options: ['Doppelte Leistung', 'Beidseitige Lichtaufnahme', 'Zwei Wechselrichter', 'Doppelte Garantie'],
          correct: 1,
          explanation: 'Bifaziale Module können Licht von beiden Seiten aufnehmen und so zusätzlichen Ertrag generieren.'
        }
      ]
    },
    
    {
      id: 'wechselrichter',
      title: 'Wechselrichter',
      description: 'Typen und Anwendungen',
      
      materialien: [],
      
      questions: [
        {
          question: 'Was ist die Hauptfunktion eines Wechselrichters?',
          options: ['Strom speichern', 'DC zu AC wandeln', 'Spannung erhöhen', 'Strom messen'],
          correct: 1,
          explanation: 'Der Wechselrichter wandelt den Gleichstrom (DC) der Module in netzkonformen Wechselstrom (AC).'
        },
        {
          question: 'Wann sind Moduloptimierer sinnvoll?',
          options: ['Immer', 'Bei Verschattung', 'Nie', 'Nur bei Grossanlagen'],
          correct: 1,
          explanation: 'Moduloptimierer sind besonders bei Verschattungsproblemen oder unterschiedlichen Ausrichtungen sinnvoll.'
        },
        {
          question: 'Wo wird ein Hybridwechselrichter eingesetzt?',
          options: ['Ohne Batterie', 'Mit Batterie', 'Nur gewerblich', 'Nur bei Inselbetrieb'],
          correct: 1,
          explanation: 'Hybridwechselrichter werden in Systemen mit Batteriespeicher eingesetzt und managen PV, Batterie und Netz.'
        },
        {
          question: 'Was bedeutet "MPP-Tracking"?',
          options: ['GPS-Ortung', 'Optimale Leistungspunktsuche', 'Fehlererkennung', 'Fernüberwachung'],
          correct: 1,
          explanation: 'MPP-Tracking (Maximum Power Point) findet kontinuierlich den optimalen Arbeitspunkt der Module.'
        }
      ]
    },
    
    {
      id: 'batteriespeicher',
      title: 'Batteriespeicher',
      description: 'Technologien und Dimensionierung',
      
      materialien: [],
      
      questions: [
        {
          question: 'Welche Batterietechnologie wird heute hauptsächlich verwendet?',
          options: ['Blei-Säure', 'Lithium-Ionen', 'Salzwasser', 'Nickel-Cadmium'],
          correct: 1,
          explanation: 'Lithium-Ionen-Batterien (meist LiFePO4) dominieren den Markt wegen hoher Effizienz und Lebensdauer.'
        },
        {
          question: 'Was ist eine sinnvolle Speichergrösse für ein EFH?',
          options: ['1-2 kWh', '5-10 kWh', '20-30 kWh', '50+ kWh'],
          correct: 1,
          explanation: 'Für ein Einfamilienhaus sind 5-10 kWh meist ausreichend, um den Abend- und Nachtverbrauch zu decken.'
        },
        {
          question: 'Was bedeutet "Notstromfähigkeit"?',
          options: ['Schnelles Laden', 'Stromversorgung bei Netzausfall', 'Doppelte Kapazität', 'Outdoor-tauglich'],
          correct: 1,
          explanation: 'Notstromfähige Systeme können bei Netzausfall wichtige Verbraucher weiter mit Strom versorgen.'
        }
      ]
    },
    
    {
      id: 'wallbox',
      title: 'Ladestationen',
      description: 'E-Mobilität und PV',
      
      materialien: [],
      
      questions: [
        {
          question: 'Welche Ladeleistung hat eine typische Heim-Wallbox?',
          options: ['3.7 kW', '11 kW', '22 kW', '50 kW'],
          correct: 1,
          explanation: '11 kW ist der Standard für Heim-Wallboxen (3-phasig, 16A). Meldepflichtig, aber nicht bewilligungspflichtig.'
        },
        {
          question: 'Was ist "PV-Überschussladen"?',
          options: ['Schnellladen', 'Laden nur mit Solarstrom-Überschuss', 'Laden in der Nacht', 'Laden am Arbeitsplatz'],
          correct: 1,
          explanation: 'Beim PV-Überschussladen wird das E-Auto nur mit dem überschüssigen Solarstrom geladen, der sonst eingespeist würde.'
        }
      ]
    }
  ]
};

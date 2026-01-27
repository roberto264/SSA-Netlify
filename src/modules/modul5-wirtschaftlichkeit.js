// ============================================
// MODUL 5: WIRTSCHAFTLICHKEIT
// ============================================

export const modul5 = {
  id: 5,
  title: 'Wirtschaftlichkeit',
  description: 'Förderung, Steuern, Amortisation',
  icon: '💰',
  color: 'from-emerald-500 to-emerald-600',
  
  topics: [
    {
      id: 'foerderung',
      title: 'Förderprogramme',
      description: 'Einmalvergütung und kantonale Förderung',
      
      materialien: [
        // { type: 'link', title: 'Pronovo EIV-Rechner', url: 'https://pronovo.ch' },
        // { type: 'pdf', title: 'Förderübersicht Kantone', url: '/docs/foerderung-kantone.pdf' },
      ],
      
      questions: [
        {
          question: 'Wie heisst die Bundesförderung für PV-Anlagen?',
          options: ['KEV', 'Einmalvergütung (EIV)', 'Solarprämie', 'PV-Bonus'],
          correct: 1,
          explanation: 'Die Einmalvergütung (EIV) ist die aktuelle Bundesförderung für PV-Anlagen.'
        },
        {
          question: 'Ab welcher Grösse gibt es die "grosse" Einmalvergütung?',
          options: ['Ab 2 kWp', 'Ab 10 kWp', 'Ab 30 kWp', 'Ab 100 kWp'],
          correct: 3,
          explanation: 'Ab 100 kWp gibt es die grosse Einmalvergütung mit höheren Fördersätzen.'
        },
        {
          question: 'Wer verwaltet die Einmalvergütung?',
          options: ['Die Gemeinde', 'Der Kanton', 'Pronovo AG', 'Das BFE'],
          correct: 2,
          explanation: 'Pronovo AG ist die akkreditierte Zertifizierungsstelle für die Einmalvergütung.'
        },
        {
          question: 'Wie lange dauert die Auszahlung der EIV typischerweise?',
          options: ['1 Monat', '3-6 Monate', '1-2 Jahre', '5 Jahre'],
          correct: 1,
          explanation: 'Die Auszahlung dauert typischerweise 3-6 Monate nach vollständiger Anmeldung.'
        }
      ]
    },
    
    {
      id: 'steuern',
      title: 'Steuerliche Aspekte',
      description: 'Abzüge und Einnahmen',
      
      materialien: [],
      
      questions: [
        {
          question: 'Sind PV-Anlagen steuerlich absetzbar?',
          options: ['Nein', 'Ja, als Unterhaltskosten', 'Nur gewerblich', 'Nur im Neubau'],
          correct: 1,
          explanation: 'PV-Anlagen können als energetische Sanierung von den Einkommenssteuern abgezogen werden.'
        },
        {
          question: 'Wie werden Stromverkäufe (Einspeisevergütung) besteuert?',
          options: ['Gar nicht', 'Als Einkommen', 'Als Vermögen', 'Pauschal 10%'],
          correct: 1,
          explanation: 'Einnahmen aus Stromverkäufen müssen als Einkommen versteuert werden.'
        },
        {
          question: 'Kann man die Steuerabzüge auf mehrere Jahre verteilen?',
          options: ['Nein', 'Ja, in den meisten Kantonen', 'Nur bei Grossanlagen', 'Nur bei Neubauten'],
          correct: 1,
          explanation: 'In den meisten Kantonen können die Abzüge auf 2-3 Jahre verteilt werden (Progression brechen).'
        }
      ]
    },
    
    {
      id: 'stromrechnung',
      title: 'Stromrechnung verstehen',
      description: 'Tarife und Vergütungen',
      
      materialien: [],
      
      questions: [
        {
          question: 'Was ist der Unterschied zwischen Hoch- und Niedertarif?',
          options: ['Spannung', 'Tageszeit', 'Stromstärke', 'Anbieter'],
          correct: 1,
          explanation: 'Hochtarif gilt tagsüber (ca. 7-20 Uhr), Niedertarif nachts und am Wochenende.'
        },
        {
          question: 'Was beeinflusst die Einspeisevergütung?',
          options: ['Nur die Anlagengrösse', 'Nur der Standort', 'Der lokale Netzbetreiber', 'Das Wetter'],
          correct: 2,
          explanation: 'Die Einspeisevergütung wird vom lokalen Netzbetreiber festgelegt und variiert stark.'
        },
        {
          question: 'Was ist die "Netznutzung"?',
          options: ['Stromverbrauch', 'Gebühr für Netzinfrastruktur', 'Einspeisevergütung', 'Zählermiete'],
          correct: 1,
          explanation: 'Die Netznutzung ist die Gebühr für die Nutzung der Strominfrastruktur.'
        }
      ]
    },
    
    {
      id: 'amortisation',
      title: 'Wirtschaftlichkeitsrechnung',
      description: 'Amortisation und Rendite',
      
      materialien: [],
      
      questions: [
        {
          question: 'Wie lange dauert die Amortisation einer typischen PV-Anlage?',
          options: ['3-5 Jahre', '8-12 Jahre', '20-25 Jahre', '30+ Jahre'],
          correct: 1,
          explanation: 'Typische Amortisationszeiten liegen bei 8-12 Jahren, je nach Eigenverbrauch und Strompreisen.'
        },
        {
          question: 'Was erhöht die Wirtschaftlichkeit am meisten?',
          options: ['Grössere Anlage', 'Hoher Eigenverbrauch', 'Billigere Module', 'Mehr Schatten'],
          correct: 1,
          explanation: 'Hoher Eigenverbrauch ist der wichtigste Faktor, da selbst genutzter Strom mehr wert ist als eingespeister.'
        },
        {
          question: 'Welche Rendite kann man bei einer PV-Anlage erwarten?',
          options: ['0-2%', '3-6%', '10-15%', '20%+'],
          correct: 1,
          explanation: 'Typische Renditen liegen bei 3-6% pro Jahr über 25 Jahre Lebensdauer.'
        },
        {
          question: 'Was sollte in einer Wirtschaftlichkeitsrechnung enthalten sein?',
          options: ['Nur Investitionskosten', 'Nur Ertrag', 'Investition, Ertrag, Förderung, Steuern, Wartung', 'Nur Förderung'],
          correct: 2,
          explanation: 'Eine vollständige Berechnung berücksichtigt alle Kosten, Erträge, Förderungen und Steuereffekte.'
        }
      ]
    }
  ]
};

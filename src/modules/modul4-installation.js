// ============================================
// MODUL 4: INSTALLATION UND WARTUNG
// ============================================

export const modul4 = {
  id: 4,
  title: 'Installation',
  description: 'Montage, Sicherheit, Wartung',
  icon: '🏗️',
  color: 'from-cyan-500 to-cyan-600',
  
  topics: [
    {
      id: 'dachtypen',
      title: 'Dachtypen',
      description: 'Verschiedene Dacheindeckungen',
      
      materialien: [],
      
      questions: [
        {
          question: 'Welches ist der häufigste Dachtyp in der Schweiz?',
          options: ['Flachdach', 'Schrägdach mit Ziegeln', 'Metalldach', 'Gründach'],
          correct: 1,
          explanation: 'Schrägdächer mit Ziegeln sind in der Schweiz am häufigsten verbreitet.'
        },
        {
          question: 'Bei welchem Dachtyp ist die Statik besonders zu prüfen?',
          options: ['Neubau', 'Ziegeldach', 'Flachdach mit Auflast', 'Alle gleich'],
          correct: 2,
          explanation: 'Bei Flachdächern mit aufgeständerten Modulen muss die zusätzliche Dachlast geprüft werden.'
        }
      ]
    },
    
    {
      id: 'montagesysteme',
      title: 'Montagesysteme',
      description: 'Aufdach, Indach, Flachdach',
      
      materialien: [],
      
      questions: [
        {
          question: 'Welches System wird bei Ziegeldächern meist verwendet?',
          options: ['Aufdach-System', 'Indach-System', 'Flachdach-System', 'Fassadensystem'],
          correct: 0,
          explanation: 'Bei Ziegeldächern wird meist ein Aufdach-System mit Dachhaken verwendet.'
        },
        {
          question: 'Was ist ein Vorteil von Indach-Systemen?',
          options: ['Günstiger', 'Bessere Ästhetik', 'Höherer Ertrag', 'Einfachere Montage'],
          correct: 1,
          explanation: 'Indach-Systeme sind optisch ansprechender, da die Module bündig ins Dach integriert werden.'
        },
        {
          question: 'Was ist bei Flachdächern zu beachten?',
          options: ['Nichts Besonderes', 'Neigungswinkel und Dachlast', 'Nur die Farbe', 'Nur die Grösse'],
          correct: 1,
          explanation: 'Bei Flachdächern müssen Aufständerungswinkel, Reihenabstand und zusätzliche Dachlast berücksichtigt werden.'
        }
      ]
    },
    
    {
      id: 'sicherheit',
      title: 'Sicherheit',
      description: 'Absturzsicherung und Blitzschutz',
      
      materialien: [],
      
      questions: [
        {
          question: 'Ab welcher Höhe ist eine Absturzsicherung Pflicht?',
          options: ['Ab 1m', 'Ab 2m', 'Ab 3m', 'Ab 5m'],
          correct: 2,
          explanation: 'Ab 3m Absturzhöhe ist eine Absturzsicherung gemäss SUVA-Vorschriften obligatorisch.'
        },
        {
          question: 'Wann muss der bestehende Blitzschutz angepasst werden?',
          options: ['Nie', 'Immer', 'Wenn ein Blitzschutz vorhanden ist', 'Nur bei Grossanlagen'],
          correct: 2,
          explanation: 'Bei bestehendem Blitzschutz muss dieser an die PV-Anlage angepasst werden (Potentialausgleich).'
        },
        {
          question: 'Was ist ein DC-Freischalter?',
          options: ['Wechselrichter', 'Sicherheitsschalter für Gleichstrom', 'Zähler', 'Batterie'],
          correct: 1,
          explanation: 'Der DC-Freischalter ermöglicht das sichere Abschalten der Gleichstromseite (Module) für Wartung oder Notfall.'
        }
      ]
    },
    
    {
      id: 'wartung',
      title: 'Wartung',
      description: 'Reinigung und Kontrolle',
      
      materialien: [],
      
      questions: [
        {
          question: 'Wie oft sollte eine PV-Anlage gewartet werden?',
          options: ['Nie', 'Jährlich', 'Alle 5 Jahre', 'Monatlich'],
          correct: 1,
          explanation: 'Eine jährliche Sichtkontrolle und Monitoring-Check wird empfohlen.'
        },
        {
          question: 'Müssen Solarmodule gereinigt werden?',
          options: ['Nie, der Regen reicht', 'Nur bei starker Verschmutzung', 'Wöchentlich', 'Täglich'],
          correct: 1,
          explanation: 'Normalerweise reicht der Regen. Bei starker Verschmutzung (Laub, Vogelkot, Pollen) kann eine Reinigung sinnvoll sein.'
        },
        {
          question: 'Wie erkennt man Defekte an der Anlage?',
          options: ['Gar nicht', 'Durch Monitoring und Ertragskontrolle', 'Nur bei Totalausfall', 'Am Geruch'],
          correct: 1,
          explanation: 'Regelmässiges Monitoring zeigt Ertragsabweichungen, die auf Defekte hinweisen können.'
        }
      ]
    }
  ]
};

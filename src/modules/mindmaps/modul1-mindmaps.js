export const modul1Mindmaps = {
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
};

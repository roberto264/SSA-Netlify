// ============================================
// LERNHILFEN FÜR ALLE MODULE
// ============================================
// Audio-Daten hier definiert
// Karteikarten und Mindmaps werden aus separaten Dateien importiert

import { getFlashcards } from './flashcards';
import { getMindmaps } from './mindmaps';

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

    // Mindmap wird aus separater Datei geladen
    get mindmap() {
      return getMindmaps(1);
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

    get mindmap() {
      return getMindmaps(2);
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

    get mindmap() {
      return getMindmaps(3);
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

    get mindmap() {
      return getMindmaps(4);
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

    get mindmap() {
      return getMindmaps(5);
    }
  }
};

// Helper-Funktion zum Abrufen der Lernhilfen für ein Modul
export const getLernhilfen = (modulId) => {
  return lernhilfen[modulId] || null;
};

// ============================================
// KARTEIKARTEN INDEX
// ============================================
// Alle Karteikarten-Dateien werden hier zusammengeführt

import { modul1Flashcards } from './modul1-flashcards';
// import { modul2Flashcards } from './modul2-flashcards';
// import { modul3Flashcards } from './modul3-flashcards';
// import { modul4Flashcards } from './modul4-flashcards';
// import { modul5Flashcards } from './modul5-flashcards';

export const flashcards = {
  1: modul1Flashcards,
  // 2: modul2Flashcards,
  // 3: modul3Flashcards,
  // 4: modul4Flashcards,
  // 5: modul5Flashcards,
};

export const getFlashcards = (modulId) => {
  return flashcards[modulId] || [];
};

// ============================================
// PERSONAS INDEX
// ============================================
// Diese Datei sammelt alle Personas und exportiert sie.
// 
// NEUE PERSONA HINZUFÜGEN:
// 1. Erstelle eine neue Datei im personas-Ordner (z.B. neukunde.js)
// 2. Kopiere die Struktur von einer bestehenden Persona
// 3. Importiere sie hier unten und füge sie zum Array hinzu
// ============================================

import { mueller } from './mueller';
import { techag } from './techag';
import { baumann } from './baumann';
import { gruenfeld } from './gruenfeld';

// Alle Personas als Array exportieren
export const personas = [
  mueller,
  techag,
  baumann,
  gruenfeld
];

// Einzelne Personas auch direkt exportieren (falls benötigt)
export { mueller, techag, baumann, gruenfeld };

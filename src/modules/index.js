// ============================================
// MODUL-INDEX
// ============================================
// Diese Datei exportiert alle Module.
// Um ein neues Modul hinzuzufügen:
// 1. Erstelle eine neue Datei (z.B. modul6-verkauf.js)
// 2. Importiere sie hier
// 3. Füge sie zum modules-Array hinzu

import { modul1 } from './modul1-grundlagen';
import { modul2 } from './modul2-komponenten';
import { modul3 } from './modul3-planung';
import { modul4 } from './modul4-installation';
import { modul5 } from './modul5-wirtschaftlichkeit';

// Alle Module als Array exportieren
export const modules = [
  modul1,
  modul2,
  modul3,
  modul4,
  modul5
];

// Einzelne Module auch separat exportieren (falls benötigt)
export { modul1, modul2, modul3, modul4, modul5 };

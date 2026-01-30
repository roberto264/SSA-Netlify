// ============================================
// MINDMAPS AGGREGATION
// ============================================
// Import all mindmap modules
import { modul1Mindmaps } from './modul1-mindmaps';
import { modul2Mindmaps } from './modul2-mindmaps';
import { modul3Mindmaps } from './modul3-mindmaps';
import { modul4Mindmaps } from './modul4-mindmaps';
import { modul5Mindmaps } from './modul5-mindmaps';

// Create mapping object by module ID
export const mindmaps = {
  1: modul1Mindmaps,
  2: modul2Mindmaps,
  3: modul3Mindmaps,
  4: modul4Mindmaps,
  5: modul5Mindmaps,
};

// Utility function for retrieval
export const getMindmaps = (modulId) => {
  return mindmaps[modulId] || null;
};

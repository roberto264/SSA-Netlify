// Import all PDF modules
import { modul1Pdfs } from './modul1-pdfs';

// Create mapping object by module ID
export const pdfs = {
  1: modul1Pdfs,
  // Add more modules as they become available
  // 2: modul2Pdfs,
  // 3: modul3Pdfs,
  // 4: modul4Pdfs,
  // 5: modul5Pdfs,
};

// Utility function for retrieval
export const getPdfs = (modulId) => {
  return pdfs[modulId] || null;
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./content/**/*.json",
  ],
  safelist: [
    // Module colors - needed for dynamic gradient classes
    'from-blue-500', 'to-blue-600',
    'from-purple-500', 'to-purple-600',
    'from-amber-500', 'to-orange-500',
    'from-cyan-500', 'to-cyan-600',
    'from-emerald-500', 'to-emerald-600',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

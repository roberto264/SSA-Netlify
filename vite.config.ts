import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@content': path.resolve(__dirname, './content'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-pdf': ['pdfjs-dist', 'react-pdf'],
          'vendor-charts': ['d3'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-avatar', '@radix-ui/react-progress', '@radix-ui/react-label', '@radix-ui/react-slot'],
        },
      },
    },
  },
})

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  integrations: [
    react(),
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    ssr: {
      noExternal: ['markmap-lib', 'markmap-view', 'markmap-common'],
    },
    optimizeDeps: {
      include: ['markmap-lib', 'markmap-view', 'markmap-common'],
    },
  },
});

// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()],
      server: {
          proxy: {
              '/media': {
                  target: 'http://localhost:8000',
                  changeOrigin: true,
              },
          },
      },
  },

  integrations: [react()],
});
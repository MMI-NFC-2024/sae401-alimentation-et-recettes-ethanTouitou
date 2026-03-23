// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://nutriguide.ethantouitou.fr',

  adapter: node({
    mode: 'standalone'
  }),

  security: {
    checkOrigin: false
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
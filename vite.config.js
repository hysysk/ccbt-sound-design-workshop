import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/ccbt-sound-design-workshop/' : '/',
  build: {
    assetsInlineLimit: 0,
  },
}));

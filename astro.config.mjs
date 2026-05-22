import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.eastcoastdesigners.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});

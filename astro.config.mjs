// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { normalizeSitemap } from './scripts/ensure-sitemap.mjs';

const singleSitemapIntegration = {
  name: 'single-sitemap-output',
  hooks: {
    'astro:build:done': ({ dir }) => {
      normalizeSitemap(fileURLToPath(dir));
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://mullawaysmedicalcannabis.com.au',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) =>
        !['/cart', '/checkout', '/order-confirmation', '/account'].some((path) =>
          page.includes(path)
        ),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    singleSitemapIntegration,
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'esbuild',
    },
  },
  compressHTML: true,
});

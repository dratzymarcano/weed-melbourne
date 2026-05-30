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
        !['/cart', '/checkout', '/order-confirmation', '/account', '/pay-with-paysafecard'].some((path) =>
          page.includes(path)
        ),
      changefreq: 'weekly',
      // priority/changefreq are ignored by Google; we keep the field for older crawlers
      // but don't try to differentiate per-page tiers (they were silently dropped by
      // the integration anyway). lastmod is the signal Google actually uses.
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

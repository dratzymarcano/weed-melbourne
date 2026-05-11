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
      // Per-page priority tiers: homepage highest, then shop/products, then blog/info, then support pages
      serialize(item) {
        const url = item.url;
        // Homepage
        if (url === 'https://mullawaysmedicalcannabis.com.au/') {
          return { ...item, priority: 1.0, changefreq: 'daily' };
        }
        // Core shop + product pages
        if (url.includes('/shop/')) {
          return { ...item, priority: 0.9, changefreq: 'weekly' };
        }
        // City landing pages
        if (url.match(/mullawaysmedicalcannabis\.com\.au\/[a-z-]+\/$/) &&
            !url.includes('/blog/') && !url.includes('/shop/') && !url.includes('/guide')) {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }
        // Blog articles
        if (url.includes('/blog/')) {
          return { ...item, priority: 0.7, changefreq: 'monthly' };
        }
        // Support / info pages
        if (['/faq/', '/how-it-works/', '/about-us/', '/contact/', '/locations/'].some(p => url.includes(p))) {
          return { ...item, priority: 0.6, changefreq: 'monthly' };
        }
        // Policy / legal pages — low priority, rarely change
        return { ...item, priority: 0.3, changefreq: 'yearly' };
      },
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

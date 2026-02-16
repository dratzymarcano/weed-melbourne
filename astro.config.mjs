// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mullawaysmedicalcannabis.com.au',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) =>
        !['/cart', '/checkout', '/order-confirmation'].some((path) =>
          page.includes(path)
        ),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
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

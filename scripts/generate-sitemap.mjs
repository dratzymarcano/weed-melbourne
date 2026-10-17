#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://mullawaysmedicalcannabis.store';
const pagesDir = path.join(process.cwd(), 'src', 'pages');
const productsFile = path.join(process.cwd(), 'src', 'data', 'products.ts');
const cityFile = path.join(process.cwd(), 'src', 'pages', '[city].astro');
const guidesFile = path.join(process.cwd(), 'src', 'data', 'seo-guides.ts');
const outFile = path.join(process.cwd(), 'public', 'sitemap.xml');

const EXCLUDED_PATHS = [
  '/cart/',
  '/checkout/',
  '/order-confirmation/',
  '/pay-with-paysafecard/',
  '/404/',
  '/account/'
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function pagePathFromFile(file) {
  const rel = path.relative(path.join(process.cwd(), 'src', 'pages'), file);
  if (!rel.endsWith('.astro')) return null;
  // Skip API and dynamic bracketed routes
  if (rel.includes('functions') || rel.includes('api')) return null;
  if (rel.includes('[')) return null;

  let url = '/' + rel.replace(/\.astro$/g, '');
  // index.astro -> /
  url = url.replace(/\/index$/, '/').replace(/^index$/, '');
  // ensure leading and trailing slash
  if (!url.startsWith('/')) url = '/' + url;
  if (!url.endsWith('/')) url += '/';
  return url;
}

function extractProductSlugs(file) {
  if (!fs.existsSync(file)) return [];
  const txt = fs.readFileSync(file, 'utf8');
  const re = /slug:\s*['"]([a-z0-9-]+)['"]/gmi;
  const slugs = new Set();
  let m;
  while ((m = re.exec(txt)) !== null) slugs.add(m[1]);
  return Array.from(slugs);
}

function extractCitySlugs(file) {
  if (!fs.existsSync(file)) return [];
  const txt = fs.readFileSync(file, 'utf8');
  const re = /params:\s*{\s*city:\s*['"]([a-z0-9-]+)['"]/gmi;
  const slugs = new Set();
  let m;
  while ((m = re.exec(txt)) !== null) slugs.add(m[1]);
  return Array.from(slugs);
}

function extractGuideSlugs(file) {
  if (!fs.existsSync(file)) return [];
  const txt = fs.readFileSync(file, 'utf8');
  const re = /slug:\s*['"]([a-z0-9-]+)['"]/gmi;
  const slugs = new Set();
  let m;
  while ((m = re.exec(txt)) !== null) slugs.add(m[1]);
  return Array.from(slugs);
}

function buildSitemap(urls) {
  const now = new Date().toISOString();
  const items = urls.map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
}

function main() {
  const files = walk(pagesDir);
  const urls = new Set();

  for (const f of files) {
    const p = pagePathFromFile(f);
    if (p && !EXCLUDED_PATHS.includes(p)) {
      urls.add(`${SITE_URL}${p}`);
    }
  }

  // Add product pages from products.ts (dynamic route)
  const productSlugs = extractProductSlugs(productsFile);
  for (const s of productSlugs) {
    urls.add(`${SITE_URL}/shop/product/${s}/`);
  }

  // Add city pages from [city].astro
  const citySlugs = extractCitySlugs(cityFile);
  for (const s of citySlugs) {
    urls.add(`${SITE_URL}/${s}/`);
  }

  // Add guide pages from seo-guides.ts
  const guideSlugs = extractGuideSlugs(guidesFile);
  for (const s of guideSlugs) {
    urls.add(`${SITE_URL}/guides/${s}/`);
  }

  // Ensure guides index and homepage present
  urls.add(`${SITE_URL}/guides/`);
  urls.add(`${SITE_URL}/`);

  const sortedUrls = Array.from(urls).sort();
  const xml = buildSitemap(sortedUrls);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, xml, 'utf8');
  console.log('Wrote', outFile, 'with', sortedUrls.length, 'entries');
}

main();

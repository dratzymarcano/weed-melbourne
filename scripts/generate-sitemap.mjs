#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://mullawaysmedicalcannabis.com.au';
const pagesDir = path.join(process.cwd(), 'src', 'pages');
const productsFile = path.join(process.cwd(), 'src', 'data', 'products.ts');
const outFile = path.join(process.cwd(), 'public', 'sitemap.xml');

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
  // Skip API and dynamic routes
  if (rel.includes('functions') || rel.includes('api')) return null;
  if (rel.includes('[')) return null;

    let url = '/' + rel.replace(/\.astro/g, '');
  // index.astro -> /
  url = url.replace(/index$/, '');
  // ensure trailing slash
  if (!url.endsWith('/')) url += '/';
  return url;
}

function extractProductSlugs(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const re = /slug:\s*"([a-z0-9-]+)"/gmi;
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
    if (p) urls.add(`${SITE_URL}${p}`);
  }

  // Add product pages from products.ts (dynamic route)
  if (fs.existsSync(productsFile)) {
    const slugs = extractProductSlugs(productsFile);
    for (const s of slugs) {
      urls.add(`${SITE_URL}/shop/product/${s}/`);
    }
  }

  // Ensure homepage present
  urls.add(`${SITE_URL}/`);

  const xml = buildSitemap(Array.from(urls).sort());
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, xml, 'utf8');
  console.log('Wrote', outFile, 'with', urls.size, 'entries');
}

main();

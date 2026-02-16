import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');

const candidates = [
  'sitemap-0.xml',
  'sitemap-index.xml',
];

const source = candidates.find((file) => existsSync(join(distDir, file)));

if (!source) {
  console.warn('[sitemap] No sitemap file found in dist.');
  process.exit(0);
}

copyFileSync(join(distDir, source), join(distDir, 'sitemap.xml'));
console.log(`[sitemap] Created sitemap.xml from ${source}`);

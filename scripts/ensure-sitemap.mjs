import { copyFileSync, existsSync, rmSync } from 'node:fs';
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

['sitemap-0.xml', 'sitemap-index.xml']
  .filter((file) => file !== source)
  .forEach((file) => {
    const filePath = join(distDir, file);
    if (existsSync(filePath)) {
      rmSync(filePath);
      console.log(`[sitemap] Removed ${file}`);
    }
  });

if (source !== 'sitemap.xml') {
  const sourcePath = join(distDir, source);
  if (existsSync(sourcePath)) {
    rmSync(sourcePath);
    console.log(`[sitemap] Removed ${source}`);
  }
}

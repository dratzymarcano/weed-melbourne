import { copyFileSync, existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
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

// Inject XSL stylesheet reference so browsers render clickable URLs
const sitemapPath = join(distDir, 'sitemap.xml');
let xml = readFileSync(sitemapPath, 'utf-8');
const xslPI = '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';
if (!xml.includes('xml-stylesheet')) {
  xml = xml.replace('<?xml version="1.0" encoding="UTF-8"?>', `<?xml version="1.0" encoding="UTF-8"?>\n${xslPI}`);
  writeFileSync(sitemapPath, xml);
  console.log('[sitemap] Injected XSL stylesheet reference');
}

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

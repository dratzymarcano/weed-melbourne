import { copyFileSync, existsSync, rmSync, readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://mullawaysmedicalcannabis.com.au';

// Walk dist/ to find each generated index.html, then derive the URL it
// represents so we can attach a real <lastmod> (file mtime) to its sitemap entry.
function buildLastmodMap(distDir) {
  const map = new Map();
  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        walk(p);
      } else if (e.isFile() && e.name === 'index.html') {
        // Build the URL path from the file location relative to distDir.
        // path.relative gives us 'about-us/index.html' or 'index.html' for root.
        const rel = relative(distDir, p).split(sep).join('/');
        let urlPath = '/' + rel.replace(/\/index\.html$/, '/').replace(/^index\.html$/, '');
        const url = `${SITE_ORIGIN}${urlPath}`;
        const mtime = statSync(p).mtime.toISOString();
        map.set(url, mtime);
      }
    }
  }
  walk(distDir);
  return map;
}

// Walk dist/images/ + dist/og-default.png to build a lookup of images to attach
// as <image:image> entries on the homepage and a few obvious URLs.
function findProductImages(distDir) {
  const imagesDir = join(distDir, 'images', 'products');
  if (!existsSync(imagesDir)) return [];
  return readdirSync(imagesDir)
    .filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f))
    .map((f) => `${SITE_ORIGIN}/images/products/${f}`);
}

export function normalizeSitemap(distDir) {
  const candidates = ['sitemap-0.xml', 'sitemap-index.xml'];
  const source = candidates.find((file) => existsSync(join(distDir, file)));

  if (!source) {
    console.warn('[sitemap] No sitemap file found in dist.');
    return;
  }

  const finalPath = join(distDir, 'sitemap.xml');
  copyFileSync(join(distDir, source), finalPath);
  console.log(`[sitemap] Created sitemap.xml from ${source}`);

  let xml = readFileSync(finalPath, 'utf-8');

  // 1. Inject <lastmod> based on real file mtimes.
  const lastmodMap = buildLastmodMap(distDir);
  let lastmodAdded = 0;
  xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (match, inner) => {
    const locMatch = inner.match(/<loc>([^<]+)<\/loc>/);
    if (!locMatch) return match;
    const url = locMatch[1];
    const mtime = lastmodMap.get(url);
    if (!mtime) return match;
    if (/<lastmod>/.test(inner)) return match;
    const next = inner.replace(/(<\/loc>)/, `$1<lastmod>${mtime}</lastmod>`);
    lastmodAdded++;
    return `<url>${next}</url>`;
  });
  console.log(`[sitemap] Added <lastmod> to ${lastmodAdded} URLs`);

  // 2. Add a small image:image hint on the homepage URL (up to 40 sample images).
  const productImages = findProductImages(distDir).slice(0, 40);
  if (productImages.length) {
    const imageBlock = productImages
      .map((u) => `<image:image><image:loc>${u}</image:loc></image:image>`)
      .join('');
    const homepageRe = new RegExp(`(<url><loc>${SITE_ORIGIN}/</loc>[^<]*(?:<[^>]+>[^<]*)*?)(</url>)`);
    if (homepageRe.test(xml)) {
      xml = xml.replace(homepageRe, `$1${imageBlock}$2`);
      console.log(`[sitemap] Added ${productImages.length} <image:image> entries to homepage URL`);
    }
  }

  // 2b. Attach each product page's primary product image to its own URL by
  // reading the first <img src="..."> from the page's product-image area.
  let productImgAdded = 0;
  xml = xml.replace(/<url>(<loc>([^<]+)<\/loc>(?:(?!<\/url>).)*)<\/url>/gs, (match, inner, url) => {
    if (!url.includes('/shop/product/')) return match;
    if (/<image:image>/.test(inner)) return match;
    try {
      // Map URL back to dist file: /shop/product/blue-dream/ -> dist/shop/product/blue-dream/index.html
      const rel = url.replace(SITE_ORIGIN, '');
      const file = join(distDir, rel.endsWith('/') ? rel + 'index.html' : rel);
      if (!existsSync(file)) return match;
      const html = readFileSync(file, 'utf-8');
      // Pick the first /images/products/... reference in the product page.
      const m = html.match(/\/images\/products\/[A-Za-z0-9._-]+\.(?:webp|png|jpg|jpeg)/);
      if (!m) return match;
      const imgUrl = `${SITE_ORIGIN}${m[0]}`;
      const newInner = inner + `<image:image><image:loc>${imgUrl}</image:loc></image:image>`;
      productImgAdded++;
      return `<url>${newInner}</url>`;
    } catch {
      return match;
    }
  });
  console.log(`[sitemap] Added <image:image> to ${productImgAdded} product URLs`);

  // 3. Inject XSL stylesheet processing instruction if missing.
  const xslPI = '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl?v=20260216"?>';
  if (!xml.includes('xml-stylesheet')) {
    xml = xml.replace('<?xml version="1.0" encoding="UTF-8"?>', `<?xml version="1.0" encoding="UTF-8"?>\n${xslPI}`);
    console.log('[sitemap] Injected XSL stylesheet reference');
  }

  writeFileSync(finalPath, xml);

  // 4. Clean up the integration's leftover files.
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
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  normalizeSitemap(join(process.cwd(), 'dist'));
}

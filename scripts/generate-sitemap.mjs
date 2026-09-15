#!/usr/bin/env node
/**
 * Writes public/sitemap.xml before each build: the static pages plus every visible product and
 * category, read from Firestore's public REST API. If Firestore can't be reached (offline), the
 * sitemap still lists the static pages and the build continues.
 */
import { existsSync, writeFileSync } from 'node:fs';

if (existsSync('.env')) process.loadEnvFile('.env');

const SITE = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');
const PROJECT = process.env.VITE_FIREBASE_PROJECT_ID;
const API_KEY = process.env.VITE_FIREBASE_API_KEY;

if (!SITE) {
  console.warn('sitemap: VITE_SITE_URL not set — skipping sitemap.xml');
  process.exit(0);
}

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/shop', priority: '0.9', changefreq: 'daily' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
  { path: '/faq', priority: '0.4', changefreq: 'monthly' },
  { path: '/track-order', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.2', changefreq: 'yearly' },
];

async function listCollection(name) {
  const docs = [];
  let pageToken = '';
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/${name}?pageSize=300&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    const json = await res.json();
    docs.push(...(json.documents || []));
    pageToken = json.nextPageToken || '';
  } while (pageToken);
  return docs;
}

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const urls = STATIC_PAGES.map((p) => ({ loc: `${SITE}${p.path}`, priority: p.priority, changefreq: p.changefreq }));

if (PROJECT && API_KEY) {
  try {
    const [products, categories] = await Promise.all([listCollection('products'), listCollection('categories')]);
    for (const c of categories) {
      const slug = c.name.split('/').pop();
      urls.push({ loc: `${SITE}/shop?category=${encodeURIComponent(slug)}`, priority: '0.7', changefreq: 'weekly' });
    }
    for (const p of products) {
      if (p.fields?.active?.booleanValue === false) continue;
      const id = p.name.split('/').pop();
      urls.push({ loc: `${SITE}/product/${encodeURIComponent(id)}`, priority: '0.8', changefreq: 'weekly', lastmod: p.updateTime?.slice(0, 10) });
    }
    console.log(`sitemap: ${products.length} products, ${categories.length} categories`);
  } catch (err) {
    console.warn(`sitemap: could not read Firestore (${err.message}) — static pages only`);
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync('public/sitemap.xml', xml);
writeFileSync(
  'public/robots.txt',
  `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin-login
Disallow: /account
Disallow: /cart
Disallow: /checkout
Disallow: /order-confirmation
Disallow: /wishlist
Disallow: /api/

Sitemap: ${SITE}/sitemap.xml
`
);
console.log(`sitemap: wrote ${urls.length} URLs to public/sitemap.xml`);

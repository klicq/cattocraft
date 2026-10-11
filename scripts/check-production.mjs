import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
import { gunzipSync, brotliDecompressSync } from 'node:zlib';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Run against `next start` or a preview URL; this checks HTTP delivery, not browser Web Vitals.
const base = new URL(process.argv[2] || 'http://localhost:3000');
const reportPath = process.argv[3];
const catalog = JSON.parse(await readFile(new URL('../data/products.json', import.meta.url), 'utf8'));
function request(route, extraHeaders = {}) {
  const url = new URL(route, base);
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const transport = url.protocol === 'https:' ? https : http;
    const req = transport.get(url, { headers: { 'Accept-Encoding': 'gzip', Accept: 'text/html,image/webp,*/*', ...extraHeaders } }, response => {
      const headersMs = performance.now() - start;
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const bytes = Buffer.concat(chunks);
        const encoding = response.headers['content-encoding'];
        const decoded = encoding === 'gzip' ? gunzipSync(bytes) : encoding === 'br' ? brotliDecompressSync(bytes) : bytes;
        resolve({ status: response.statusCode, headers: response.headers, headersMs, totalMs: performance.now() - start, transferBytes: bytes.length, decodedBytes: decoded.length, body: decoded.toString('utf8') });
      });
      response.on('error', reject);
    });
    req.setTimeout(30000, () => req.destroy(new Error(`Timeout: ${url}`)));
    req.on('error', reject);
  });
}
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const routes = ['/', '/it', '/shop', '/it/shop', '/products/' + catalog[0].slug, '/it/products/' + catalog[0].slug, '/enquiry', '/it/enquiry', '/how-to-order', '/it/how-to-order', '/contact', '/it/contact'];
const pages = [];
for (const route of routes) {
  const first = await request(route);
  assert.equal(first.status, 200, route);
  const locale = route === '/it' || route.startsWith('/it/') ? 'it' : 'en';
  assert.ok(first.body.includes(`<html lang="${locale}"`), `${route}: document language`);
  assert.ok(first.body.includes('rel="canonical"'), `${route}: canonical`);
  assert.ok(first.body.includes('hrefLang="it"') || first.body.includes('hreflang="it"'), `${route}: Italian alternate`);
  if (route.includes('/products/')) {
    assert.ok(first.body.includes(locale === 'en' ? 'Tell us about the spot you have in mind.' : 'Raccontaci dell’angolo che hai in mente.'), `${route}: customization prompt`);
    assert.ok(first.body.includes(locale === 'en' ? 'Approx.' : 'Circa '), `${route}: approximate size`);
    assert.ok(first.body.includes(locale === 'en' ? 'Solvent-free' : 'senza solventi'), `${route}: material note`);
    const imageSources = [...first.body.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
    assert.ok(!imageSources.includes(catalog[0].images[0].src), 'Closed zoom must not mount a raw full-resolution image');
  }
  const samples = [];
  for (let index = 0; index < 5; index++) samples.push(await request(route));
  const scriptTags = [...first.body.matchAll(/<script\b[^>]*>/g)].map(match => match[0]);
  const modernScripts = scriptTags.filter(tag => !/\bnomodule\b/i.test(tag));
  pages.push({ route, locale, status: first.status, firstHeadersMs: +first.headersMs.toFixed(2), medianHeadersMs: +median(samples.map(sample => sample.headersMs)).toFixed(2), medianTotalMs: +median(samples.map(sample => sample.totalMs)).toFixed(2), transferBytes: first.transferBytes, decodedBytes: first.decodedBytes, contentEncoding: first.headers['content-encoding'] || 'identity', initialScripts: [...new Set(modernScripts.flatMap(tag => [...tag.matchAll(/\bsrc="([^"]+)"/g)].map(match => match[1])))] });
}
let verifiedProductRoutes = 0;
for (const product of catalog) for (const prefix of ['', '/it']) {
  const response = await request(prefix + '/products/' + product.slug);
  assert.equal(response.status, 200, product.id + prefix);
  assert.ok(response.body.includes(`<html lang="${prefix ? 'it' : 'en'}"`), product.id + ': language');
  verifiedProductRoutes++;
}
const pagination = [];
for (const locale of ['', '/it']) for (const number of [1, 2, 3]) {
  const response = await request(locale + '/shop?page=' + number);
  const cards = [...response.body.matchAll(/aria-labelledby="piece-\d+-name"/g)].length;
  const expected = Math.max(0, Math.min(24, catalog.length - (number - 1) * 24));
  assert.equal(cards, expected, `${locale}/shop page ${number}`);
  pagination.push({ locale: locale ? 'it' : 'en', page: number, cards });
}
const collections = [];
for (const [id, tag] of [['paintbox-purrs', 'Paintbox Purrs'], ['purr-in-one-hue', 'Purr in One Hue']]) {
  const expected = catalog.filter(product => product.tags[0] === tag).length;
  for (const prefix of ['', '/it']) {
    const response = await request(prefix + '/shop?collection=' + id);
    const cards = [...response.body.matchAll(/aria-labelledby="piece-\d+-name"/g)].length;
    assert.equal(cards, Math.min(24, expected), `${prefix}: ${id}`);
    collections.push({ locale: prefix ? 'it' : 'en', id, matchingProducts: expected, firstPageCards: cards });
  }
}
const redirect = await request('/en/shop?collection=purr-in-one-hue');
assert.equal(redirect.status, 308);
assert.equal(redirect.headers.location, '/shop?collection=purr-in-one-hue');
assert.equal((await request('/products/unknown-piece')).status, 404);
assert.equal((await request('/fr')).status, 404);
const robots = await request('/robots.txt');
const sitemap = await request('/sitemap.xml');
assert.equal(sitemap.status, 200);
assert.ok(sitemap.body.includes('/it/products/' + catalog[0].slug));
// A document GET can succeed while a client-side link fails. Check the actual
// App Router response contract for logo and navigation transitions as well.
const englishShopTree = ['', { children: ['(english)', { children: ['shop', { children: ['__PAGE__', {}] }] }] }, null, null, true];
const italianShopTree = ['', { children: [['locale', 'it', 'd'], { children: ['shop', { children: ['__PAGE__', {}] }] }] }, null, null, true];
const navigation = [];
for (const [from, to, tree] of [
  ['/shop', '/', englishShopTree],
  ['/shop', '/contact', englishShopTree],
  ['/shop', '/products/' + catalog[0].slug, englishShopTree],
  ['/it/shop', '/it', italianShopTree],
  ['/it/shop', '/it/contact', italianShopTree],
  ['/it/shop', '/it/products/' + catalog[0].slug, italianShopTree],
]) {
  const headers = {
    RSC: '1', Accept: 'text/x-component',
    'Next-Router-State-Tree': encodeURIComponent(JSON.stringify(tree)),
    'Next-Url': from,
  };
  let response = await request(to + '?_rsc=studio-navigation-check', headers);
  let redirects = 0;
  // Next.js may normalize the RSC cache key before returning the payload.
  while (response.status === 307 && response.headers.location && redirects < 3) {
    const destination = new URL(response.headers.location, base);
    assert.equal(destination.origin, base.origin, 'Navigation must stay on this site');
    response = await request(destination.pathname + destination.search, headers);
    redirects++;
  }
  assert.equal(response.status, 200, `${from} → ${to}: navigation status`);
  assert.ok(response.headers['content-type']?.includes('text/x-component'), `${from} → ${to}: expected an App Router payload, received ${response.headers['content-type']}`);
  assert.ok(!response.body.includes('NEXT_HTTP_ERROR_FALLBACK;404'), `${from} → ${to}: unexpected not-found result`);
  navigation.push({ from, to, status: response.status, redirects, contentType: response.headers['content-type'] });
}
const image = catalog[0].images[0];
const images = [];
for (const [label, source, width] of [['card-384', image.card.src, 384], ['card-640', image.card.src, 640], ['gallery-640', image.src, 640], ['gallery-1080', image.src, 1080]]) {
  const route = '/_next/image?url=' + encodeURIComponent(source) + '&w=' + width + '&q=85';
  const first = await request(route);
  const second = await request(route);
  assert.equal(first.status, 200, label);
  assert.ok(first.headers['content-type']?.startsWith('image/'), label);
  images.push({ label, transferBytes: first.transferBytes, firstTotalMs: +first.totalMs.toFixed(2), secondTotalMs: +second.totalMs.toFixed(2), firstCache: first.headers['x-nextjs-cache'], secondCache: second.headers['x-nextjs-cache'], cacheControl: first.headers['cache-control'] });
}
const raw = await request(image.src);
assert.ok(raw.headers['cache-control']?.includes('immutable'));
const bundles = [];
for (const source of new Set(pages.flatMap(page => page.initialScripts))) {
  const response = await request(source);
  assert.equal(response.status, 200, source);
  bundles.push({ source, transferBytes: response.transferBytes, decodedBytes: response.decodedBytes });
}
for (const page of pages) page.scriptTransferBytes = page.initialScripts.reduce((sum, source) => sum + bundles.find(bundle => bundle.source === source).transferBytes, 0);
const report = { date: new Date().toISOString(), base: base.href, node: process.version, activeProducts: catalog.length, sampleMethod: 'one observed first request plus five sequential warmed GETs per page; compressed body bytes, headers latency and full response time from this machine; no browser rendering or network throttling', pages, verifiedProductRoutes, pagination, collections, navigation, images, rawZoom: { transferBytes: raw.transferBytes, cacheControl: raw.headers['cache-control'] }, robots: robots.body.trim(), sitemapEntries: [...sitemap.body.matchAll(/<loc>/g)].length, bundles };
if (reportPath) { await mkdir(path.dirname(path.resolve(reportPath)), { recursive: true }); await writeFile(reportPath, JSON.stringify(report, null, 2)); }
console.log(JSON.stringify({ ...report, pages: pages.map(page => ({ ...page, initialScripts: undefined })), bundles: undefined }, null, 2));

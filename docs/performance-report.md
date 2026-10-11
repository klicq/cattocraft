# Performance checks and launch test plan

Checked on **11 October 2026** with **67 active products**, Next.js **16.3.8**, Node.js **22.17.1**, and a local production build served through `next start`.

The measured page payloads are small, pagination limits the rendered catalog, and image optimization/caching works. **Online browser performance is still unverified.** Chrome and Edge could not start reliably in this restricted Windows execution environment: their GPU processes failed and browser startup timed out, including with GPU acceleration disabled. No valid Lighthouse score, screenshot review, LCP, INP, CLS, or interactive browser result was produced. This is a testing limitation, not evidence of a site rendering failure.

## Completed checks

- All **41 automated tests** pass, covering cart actions/persistence, form validation, actual catalog assets, and Italian coverage and stable cart identity.
- Type checking, ESLint, and the production build pass. The build generates both language versions of all 67 product pages.
- HTTP checks verify **134 product URLs**, document languages, representative canonical/language alternates, approximate sizes, material notes, and customization copy.
- Both language shops return **24 / 24 / 19** cards across their three pages. The collection filters match **20** colorful and **47** single-color pieces.
- The English `/en/shop` alias redirects to `/shop`, preserving query parameters. Invalid products and unsupported locales return 404.
- The closed product gallery's HTML contains optimized image URLs and no mounted raw zoom image. The client code mounts the original only when inspection opens; this interaction still needs a browser check.
- The sitemap has **142 entries**: 67 products and four public pages in each language. Review-mode indexing is disabled, and the personal enquiry page remains non-indexable.
- Production dependency audit reports **zero vulnerabilities** after compatible Next.js, Sharp, and source-map-js patches. This is a dependency audit, not a penetration test.

## Measured delivery

One observed first request followed by five sequential warmed requests per representative page. Times below are median latency to receive response headers over loopback. HTML and script sizes are compressed HTTP body bytes; **kB means 1,000 bytes**. Modern script sums exclude the `noModule` legacy polyfill. Scripts are shared and can be reused between pages.

| Page | English HTML | Italian HTML | English / Italian header latency | Modern initial JavaScript |
| --- | ---: | ---: | ---: | ---: |
| Home | 18.8 kB | 19.7 kB | 6.3 / 6.7 ms | 151.1 kB |
| Shop | 27.4 kB | 28.9 kB | 35.5 / 26.7 ms | 151.1 kB |
| Representative product | 18.8 kB | 19.9 kB | 6.5 / 6.9 ms | 156.8 kB |
| Enquiry, initial empty state | 12.5 kB | 13.2 kB | 4.8 / 4.1 ms | 157.5 kB |
| How to order | 19.3 kB | 20.2 kB | 6.2 / 5.7 ms | 151.1 kB |
| Contact | 14.5 kB | 15.3 kB | 5.1 / 5.0 ms | 155.9 kB |

These figures exclude image/CSS transfer, JavaScript execution, hydration, layout, paint, and interactions. They do not simulate a phone or worldwide internet latency. The enquiry figures describe initial server HTML, not a hydrated basket containing many pieces. Small byte differences are expected after rebuilding metadata and stylesheet hashes.

### Image inventory and caching

| Active prepared assets | Median per file | P95 per file | Largest | Total for 67 |
| --- | ---: | ---: | ---: | ---: |
| Full 2508px WebP | 211.4 kB | 316.6 kB | 346.0 kB | 14.52 MB |
| 640px card derivative | 12.9 kB | 23.5 kB | 28.5 kB | 0.92 MB |

P95 uses nearest rank. All active full images, card derivatives, and tiny blur previews decode at their declared dimensions. Catalog storage totals are **not** per-visit downloads. Archived files for removed pieces are retained and do not load unless referenced.

The current ProductCard uses responsive Next.js transformations of the full source, which preserves sharpness at larger/high-density card sizes; the browser receives a resized image, not the raw 2508px file. Cart thumbnails use the prepared card derivative. Product gallery images also use responsive transformations; zoom uses the prepared original.

For the first piece, HTTP requests measured:

| Variant requested | Compressed image body |
| --- | ---: |
| 384px transformation of its prepared card | 7.3 kB |
| 640px transformation of its prepared card | 16.4 kB |
| 640px gallery transformation of its full source | 17.9 kB |
| 1080px gallery transformation of its full source | 44.4 kB |
| Raw zoom original | 248.3 kB |

The initial uncached transformations returned `MISS`, followed by `HIT`; observed uncached response times were about **71–393 ms**, compared with about **4–5 ms** for immediate cache hits. This is one local sample, not a CDN timing guarantee. Versioned `/art/products/` originals now use a **one-year immutable browser cache**; their optimized derivatives also returned one-year cache lifetimes. Always publish a changed image under a new versioned filename. [Next.js Image caching](https://nextjs.org/docs/app/api-reference/components/image#caching-behavior)

## Repeat the completed HTTP check

Start the production server in one terminal:

```powershell
npm.cmd run build
npm.cmd run start
```

In another terminal:

```powershell
npm.cmd run check:production -- http://localhost:3000 docs/performance-artifacts/http-check.json
```

The script also accepts a hosted preview origin. It requests pages and assets without submitting forms. Reports in `docs/performance-artifacts/` are excluded from Git and deployments. Browser test tools are not application dependencies.

## Browser and hosted-preview checks still required

1. Use a normal Chrome session to review English and Italian at 320px, 390px, tablet, and desktop widths. Check longer Italian labels, mobile navigation, language controls, image frames, and zoom sharpness.
2. Add two different pieces and a maker note, change quantities, reload, switch languages, open/close the drawer with keyboard and touch, and follow its enquiry action. Confirm selections survive and displayed titles change language. Verify the mock enquiry confirmation receives focus after submission, and reduced-motion settings are respected.
3. Run Lighthouse against the **production server**, then the hosted preview. Use the same tool version/configuration and three sequential mobile runs per home/shop/product page; record medians. Test Italian equivalents, a populated enquiry page, and one desktop shop run. Disable browser extensions and avoid concurrent builds or other benchmark runs. [Lighthouse instructions](https://developer.chrome.com/docs/lighthouse/overview)
4. For a populated basket, use Chrome DevTools Lighthouse with **Clear storage disabled**, record this setting, and use fictional test details. Keep cold-cache and warmed-cache results separate. A fresh Lighthouse profile normally starts with an empty cart.
5. Inspect image requests: no original zoom WebP before inspection, appropriately sized optimized images, lazy off-screen cards, and cache reuse on repeat visits. Check hero/product LCP media, actual transferred bytes, hydration errors, layout shifts, and add-to-cart responsiveness.
6. Repeat on the real HTTPS domain after the live forms are connected. Test from a representative mobile network and the countries the business expects to serve. Monitor field experience after launch; local server timings cannot predict CDN, device, or regional performance.

A reproducible CLI starting point for the Node version used here:

```powershell
npx.cmd lighthouse@12.8.2 http://localhost:3000/shop --only-categories=performance,accessibility,best-practices --output=html --output-path=docs/performance-artifacts/shop-mobile.html
```

Use `--preset=desktop` for a separate desktop run. Lighthouse was deliberately not added to the site's dependency tree. Its Total Blocking Time is a lab diagnostic; it is **not** field INP. Target good Core Web Vitals at the 75th percentile: **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1**. [Core Web Vitals](https://web.dev/articles/vitals)

## Preparing for 100–300 pieces

Keep server-rendered pagination at 24 cards, responsive images, deferred zoom, and disabled product-link prefetch. Preserve stable IDs and complete Italian records. At the current average asset sizes, 300 single-image products would occupy roughly **69 MB** for full/card prepared assets; this is a storage estimate, not a browser transfer prediction.

Recheck with the real larger catalog. The global cart catalog is serialized into each page for restoration, so HTML can grow even when only 24 cards render. Monitor this payload before introducing a backend. If it becomes material, slim the cart's shared lookup data while preserving validation and persistence. Keep any future 3D viewer and models out of the initial gallery bundle and benchmark them separately when added.

Proposed regression budgets for preview review: representative compressed HTML **≤ 60 kB**, modern initial JavaScript **≤ 220 kB**, prepared 640px card P95 **≤ 50 kB**, and single zoom originals **≤ 500 kB**. These are project targets, not universal rules or guarantees. Browser LCP/INP/CLS remain separate acceptance checks.

Follow [github-vercel-first-deployment.md](github-vercel-first-deployment.md) to make the review site publicly viewable, then [deployment-and-go-live.md](deployment-and-go-live.md) for the full launch sequence. **Contact/enquiry confirmations are mock interactions; real inbox delivery is required before accepting customer requests.** The measurements above predate the CattoCraft rebrand and dropdown update; remeasure the final hosted build.

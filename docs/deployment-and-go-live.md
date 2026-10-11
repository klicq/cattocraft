# Deployment and go-live plan

This is a plan for review. No hosting account, production deployment, domain change, form provider, submission endpoint, or delivery secret has been configured by this work.

For the first publicly viewable review deployment, use [GitHub → Vercel: get CattoCraft online](github-vercel-first-deployment.md). That can happen before the full business launch described below.

The site can remain a lightweight Next.js application. The main business-launch blocker is **real delivery of enquiry and contact messages**: both forms currently show production-style mock confirmations, keep payloads in browser memory, and log them only in development. A mock success screen is not evidence that a message reached the studio.

## Proposed production setup

| Part | Recommendation |
| --- | --- |
| Hosting | Vercel on a plan that permits commercial use, with Pro as the proposed starting point |
| Application | Next.js 16 App Router with server rendering, responsive Image optimization, TypeScript, and CSS Modules |
| Catalog | The existing JSON files: **67 active products**, with English and Italian copy |
| Public images | Prepared WebP assets in `public/art/products`; CDN/object storage can be introduced later |
| Cart | Existing browser-local selections; the server validates them again on submission |
| Message delivery | A managed form inbox reached through small server-validated endpoints |
| Database | No catalog or customer database required for this launch |
| Runtime | Node.js 22 on the latest supported patch, consistent in development, CI, and hosting |

Vercel Hobby is restricted to personal, non-commercial use, so it is unsuitable for this business catalog. Review the current commercial plan terms, pricing, usage, and spending controls before choosing the account; this guide makes no fixed cost or quota promise. [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)

Keep Next.js rendering and image optimization enabled rather than converting this project to a static export. Image sizing, lazy loading, and blur placeholders belong to the existing delivery pipeline. [Next.js image optimization](https://nextjs.org/docs/app/getting-started/images)

English public URLs stay unprefixed, such as `/shop`; Italian uses `/it/shop`. Both are served from `app/[locale]`, with internal rewrites for English. Keep locale-aware navigation, document language, canonical URLs, and language alternates together. [Next.js internationalization](https://nextjs.org/docs/app/guides/internationalization)

## Phase 1 — Confirm the launch facts

- [ ] Choose the public domain, commercial hosting account, studio recipient inbox, and the person responsible for replying.
- [ ] Confirm public business/contact details and realistic response expectations. Publish only approved details.
- [ ] Confirm the actual size of every piece. Current approximate dimensions are indicative miniature guides, not measurements taken from finished products.
- [ ] Confirm the actual supplier material mixture, paints, finishes, and care instructions before presenting specific claims.
- [ ] Confirm appropriate use and any safety information from the maker/supplier. Cat-shaped pieces, cup-shaped sculptures, trays, and school/hospital orders do not by themselves establish toy, food-contact, heat-resistant, or clinical suitability.
- [ ] Review Italian copy with a fluent Italian reader, including product stories, dimensions, form errors, and success messages.
- [ ] Confirm a privacy notice for the real form-delivery workflow, provider, retention, and contact rights. These policies still need business review; this plan does not claim they already exist.
- [ ] Preserve the current 67 active records and stable IDs. Do not restore removed products `piece-002` through `piece-010` from an older asset map or backup.

## Phase 2 — Make messages reach the studio

Choose a managed form-inbox provider after reviewing its delivery reliability, access controls, retention settings, region, and pricing. The proposed flow is:

**Browser form → Next.js server endpoint → managed studio inbox → personal reply.**

Two small endpoints can cover the enquiry and contact forms. They are proposed work, not existing endpoints. The provider credentials must remain server-side; no secret should use a `NEXT_PUBLIC_` environment variable.

The server must:

- Validate name, email, optional phone, delivery location, notes, and field-length/body-size limits independently of browser validation.
- Validate `locale` against `en` and `it` so the team can reply in the visitor's chosen language.
- For an enquiry, accept stable product IDs, quantities, and selected options, then look up each active product in the trusted catalog.
- Reject removed/unknown IDs, invalid quantities, unsupported options, empty enquiries, and unreasonable payload sizes. Basket quantity limits are request limits, not stock levels.
- Build item titles and quote context from the server catalog. Client-supplied titles, images, prices, availability, and totals are not authoritative.
- Send a readable itemized message with product IDs, trusted names, quantities/options, language, contact details, and delivery destination. Pricing remains a personal quote unless confirmed data says otherwise.
- Add spam protection and rate limits using provider/platform enforcement suitable for multiple server instances. A process-local counter alone is not a dependable global serverless rate limit.
- Escape user content in generated messages and keep recipients, sender headers, and subject structure under server control.
- Use timeouts and duplicate-submission protection. Handle a delayed response without encouraging repeated sends that could create multiple enquiries.

Only show the delivered/request-accepted confirmation after the server has received the provider's successful acknowledgement. Preserve entered details and selected items if delivery fails, show a helpful error in the selected language, and allow a deliberate retry. Acknowledgement means the service accepted the message; inbox arrival must also be tested.

Remove personal payloads from production console/server logs. Log only a non-personal submission reference, result category, timing, and delivery status where available. No application database is needed; the managed inbox's necessary retention still needs an agreed privacy policy and access rules.

Before continuing, test real receipt of both forms in English and Italian, including spam-folder checks, reply addressing, provider rejection, timeout, network failure, blocked spam, and duplicate clicks. Use designated test recipients and clearly identifiable test messages.

## Phase 3 — Build and review a preview

After the hosting choice is approved, connect the repository and use a preview branch for review. Vercel's Git workflow supports separate preview and production deployments. [Vercel Git deployments](https://vercel.com/docs/git)

Use the package lock and standard checks from a clean checkout:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Set the framework preset to Next.js, use `npm ci` for installation and `npm run build` for the build, and keep the framework's default output handling. Ensure the selected Node.js 22 runtime uses a current supported patch. Do not upload `node_modules`, local build output, credentials, or personal test submissions.

Raw/upscaled originals must stay out of both Git and Vercel uploads. Keep `raw_assets/**` excluded by `.gitignore` and `.vercelignore`; verify they were not already tracked. Publish only approved prepared images. Retain originals and filename maps in the studio's separate backup.

Preview configuration and review:

- [ ] `SITE_INDEXING_ENABLED=false`; preview deployments remain `noindex` regardless of the production setting.
- [ ] Protect review access where appropriate. `noindex` controls search indexing; it does not make a URL private.
- [ ] Route test submissions to the approved test destination, with credentials scoped appropriately.
- [ ] Review `/`, `/shop`, `/how-to-order`, `/contact`, `/enquiry`, product pages, and their `/it` counterparts on desktop and mobile.
- [ ] Exercise collection/mood filters, pagination, direct product links, required options, quantities, cart persistence, and language changes.
- [ ] Check that cards use responsive images and zoom sources load on interaction, with sharp text, stable frames, and no broken assets.
- [ ] Check keyboard navigation, visible focus, drawer/dialog dismissal, labels, validation, and reduced-motion behavior.
- [ ] Review missing/removed product URLs and malformed filter/page queries.
- [ ] Read [the performance report](performance-report.md) for actual measurements and their limits. Repeat relevant checks on the hosted preview; local measurements are not a promise of worldwide performance.

## Phase 4 — Domain, HTTPS, and production review

After the preview is approved, add the chosen domain to the project and apply the exact DNS values shown by Vercel. Preserve existing email-related DNS records. Decide whether the apex or `www` host is canonical and redirect the other consistently. [Vercel custom-domain setup](https://vercel.com/docs/domains/working-with-domains/add-a-domain)

Vercel attempts certificate provisioning after the domain is added and DNS validation succeeds. Verify HTTPS on the actual domain, including redirects and mixed-content checks, before announcing the site. [Vercel SSL guidance](https://vercel.com/docs/domains/working-with-ssl)

| Variable | Production review value | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Actual canonical `https://` domain | Absolute metadata, social links, and sitemap URLs; public, not a secret |
| `SITE_INDEXING_ENABLED` | `false` during review | Keeps search indexing disabled until the live flow is approved |
| Provider credentials | To be defined during delivery integration | Server-only delivery; no credentials are presently implemented |

Redeploy after changing build-time settings, especially `NEXT_PUBLIC_SITE_URL`. Verify the generated output, not just the dashboard value.

Production review checklist:

- [ ] Real-domain English and Italian pages load with the correct `lang`, title, description, canonical URL, and language alternates.
- [ ] Social previews and images resolve to the real HTTPS domain.
- [ ] `/robots.txt` and `/sitemap.xml` reflect the intended domain and current 67 active products in both languages.
- [ ] Review pages remain non-indexable; preview URLs remain non-indexable throughout.
- [ ] Submit both real-domain forms with designated test details and confirm that the studio receives complete messages and can reply.
- [ ] Test a failure path on production without exposing secrets or personal data in logs.
- [ ] Confirm approved business facts, contact details, privacy wording, and Italian proofreading.
- [ ] Record the production deployment ID and a known-good recovery path.

## Phase 5 — Go live and monitor

After delivery and the production review are approved, set production `SITE_INDEXING_ENABLED=true`, redeploy, and verify the rendered robots directives, robots file, sitemap, canonical URLs, and language alternates. Preview deployments must remain `noindex`. Submit the sitemap to the chosen search-console account only after this check.

During the first days, the studio should monitor both inbox receipt and provider delivery/error records, answer test enquiries, check mobile journeys, and review hosting/image-optimization usage. Enable spending notifications appropriate to the selected account. Avoid analytics configurations that capture form content or contact details.

Treat the performance report's HTTP checks as a starting point. Complete the browser measurements on a hosted preview, then monitor real-user experience when enough visits are available, separating mobile and desktop. Good Core Web Vitals target the 75th percentile: LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1. These are monitoring goals, not guaranteed outcomes. [Core Web Vitals guidance](https://web.dev/articles/vitals)

## Recovery checklist

- [ ] Keep a previously approved production deployment available once one exists. On the first launch, prepare a reviewed holding-page build or other recovery deployment because there is no earlier live release.
- [ ] If a release breaks navigation, images, or submissions, stop announcing the site and restore the known-good deployment or holding page.
- [ ] Re-test the domain, both languages, cart, and real form delivery after recovery.
- [ ] Check provider settings and credentials separately: restoring a website build does not undo external inbox/provider changes.
- [ ] Fix and validate the problem in preview before promoting the corrected release.

Vercel Instant Rollback can restore an eligible earlier production deployment without rebuilding it; its original environment/configuration remains part of that release. Check compatibility before restoring it and follow the documented promotion steps when returning to normal deployment. [Vercel Instant Rollback](https://vercel.com/docs/instant-rollback)

**Launch approval should be based on a working real-domain enquiry journey, confirmed business information, reviewed bilingual copy, and a recoverable deployment—not only a passing build.**

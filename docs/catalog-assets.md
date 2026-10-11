# Catalog content and images

The catalog lives in data/products.json. Each product has a stable piece-### ID, a human-readable slug, creative copy, a plain category, and an images array that can accept additional views later. Asset IDs cat-### retain the prepared file mapping, but are intentionally different from the old demo product IDs to prevent old carts selecting different products.

The current catalog contains 67 active designs, with one front image each: 20 in Paintbox Purrs and 47 in Purr in One Hue. The current selection omits piece-002 through piece-010; their archived assets have been retained. Stable IDs must never be renumbered. Availability on-enquiry permits an enquiry selection; maxQuantity is a basket request limit, not inventory.

Each record identifies Artisan Casting Plaster / Gypsum Composite and carries a deliberately approximate miniature-size guide around 5 × 3 × 3 inches (length × width × height). These are indicative guides, not measurements taken from the photographs. The product page labels them approximate and invites customers to describe their intended space and discuss customization. Confirm actual sizes before using any value as a production specification. Italian pages show approximate centimeters, with inches beneath.

The making notes describe the casting mix as solvent-free and non-toxic, room-temperature casting as a low-energy studio process, and practical reuse of offcuts as zero-waste potential. This wording concerns the mix and studio casting stage; it does not certify paints, protective finishes, food contact, or the full supply chain. Supplier and finish details, included accessories, pricing, and preparation times remain launch-review items.

## Delivery

- public/art/products contains only the optimized prepared WebPs: 2508px sources at quality 90 and 640px card derivatives at quality 85. Raw originals and upscaled PNGs stay in raw_assets outside public.
- Product cards and the main gallery use Next.js Image with responsive sizes, quality 85, and a tiny blurDataURL. The optimizer generates appropriate widths; browsers do not fetch the raw zoom source for each card.
- Cart snapshots reference the prepared640px image and Next.js serves smaller thumbnails.
- The zoom image is mounted on interaction and uses the precompressed2508px WebP directly, preserving its prepared quality. Closed viewers should request no full-resolution zoom image.
- The shop is paginated at24 items with collection, mood, category, and page in the URL. Filters reset the page while preserving other selections.
- Asset paths can later move to public object storage/CDN by updating URLs and configuring an exact remotePatterns host/path. No external storage account is configured by this change.
- Use a new versioned filename whenever a published image changes. Keep originals backed up; avoid repeatedly re-encoding prepared files.
- Versioned `/art/products/` assets have a one-year immutable browser cache. Replace a published image under a new versioned filename; never overwrite an existing version. Next.js also caches its optimized derivatives. The unversioned hero does not receive this immutable rule.

## Editing

Use raw_assets/multi-prep/filename-map.csv for cat-001 through cat-029 and raw_assets/mono-prep/filename-map.csv for cat-030 through cat-076 to match assets to their source filenames. Add new technical facts only after studio confirmation. Update the images entry with actual pixel dimensions, alt text, focal point and a tiny generated blur placeholder. Keep the images array even for one photo.

The shop renders category and page from the request URL before sending its images, so a direct page-2 link does not first download page-1 pictures.

At deployment, set NEXT_PUBLIC_SITE_URL to the real public domain for product social-preview images. On Vercel, the production project URL is used automatically if this variable is absent. Locally, the default is http://localhost:3000. See .env.example.

Run npm test, npm run typecheck, npm run lint and npm run build after catalog changes. tests/catalog.test.mjs validates the current image mapping and exercises real products through cart and enquiry logic.

## Personality tags

The first tag identifies the collection: Paintbox Purrs or Purr in One Hue. The second is a shared mood from lib/catalog-tags.ts. Further tags are short, playful details specific to the artwork. Plain categories remain separate metadata for clarity. Cards show the collection and mood; product pages show all tags, with collection and mood links back to the shop.

Append new records with new stable IDs rather than renumbering existing items. Existing product IDs, asset IDs, slugs, and images remain unchanged when adding new collections.

## English and Italian

English URLs remain `/`, `/shop`, `/products/[slug]`, `/how-to-order`, `/contact`, and `/enquiry`. Their Italian equivalents use `/it`. The locale root layout is in `app/[locale]`; English addresses rewrite internally to `/en`, and direct `/en` addresses redirect to the original public URLs.

`data/products.it.json` holds Italian editorial copy keyed by the same stable product IDs. Images, quantities, pricing, stock state, and canonical filter IDs are shared. Update the Italian record whenever you add or change a product; the locale tests check full coverage. The EN / IT control preserves the current product or gallery filters. Saved cart selections carry across languages and refresh their display labels from the active catalog.

See [performance-report.md](performance-report.md) for the production benchmark and [deployment-and-go-live.md](deployment-and-go-live.md) for the launch sequence. The current contact and enquiry forms show mock confirmations; inbox delivery must be connected before accepting customer enquiries.

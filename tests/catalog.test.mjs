import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { CATALOG_COLLECTIONS, CATALOG_MOODS } from "../lib/catalog-tags.ts";
import { cartReducer, initialCartState, restoreCart, serializeCart } from "../lib/cart.ts";
import { buildEnquiryPayload } from "../lib/enquiry.ts";

const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const expectedAssetIds = ["cat-001", ...Array.from({ length: 66 }, (_, index) => `cat-${String(index + 11).padStart(3, "0")}`)];

function cartCatalog() {
  return products.map((product) => ({
    ...product,
    image: { ...product.images[0].card, alt: product.images[0].alt },
  }));
}

function addCollection() {
  let state = cartReducer(initialCartState, { type: "hydrate", items: [] });
  for (const product of cartCatalog()) {
    state = cartReducer(state, {
      type: "add_item",
      product,
      item: { productId: product.id, selections: {}, quantity: 1, notes: "Please include this piece in my quote." },
    });
  }
  return state.items;
}

test("the catalog covers all 67 active pieces with distinct identities and routes", () => {
  assert.equal(products.length, 67);
  assert.deepEqual(products.map(({ assetId }) => assetId).sort(), expectedAssetIds);
  for (const field of ["id", "slug", "name"]) {
    assert.equal(new Set(products.map((product) => product[field])).size, products.length, `${field} must be unique`);
  }
  for (const product of products) {
    assert.equal(product.id, product.assetId.replace("cat-", "piece-"));
    assert.match(product.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(product.name.trim() && product.shortDescription.trim() && product.description.trim(), product.id);
    assert.ok(product.category.id && product.category.name, product.id);
    assert.ok(product.tags.length > 0, product.id);
    assert.equal(product.images.length, 1, `${product.id} currently has one front view`);
    assert.equal(product.images[0].src, `/art/products/${product.assetId}-front-v1.webp`);
    assert.equal(product.images[0].card.src, `/art/products/${product.assetId}-front-card-640-v1.webp`);
    assert.ok(product.images[0].alt.trim(), `${product.id} needs a useful image description`);
  }
});

test("both collections carry creative and consistent personality tags", () => {
  const collectionNames = new Set(CATALOG_COLLECTIONS.map(entry => entry.tag));
  const moodNames = new Set(CATALOG_MOODS.map(entry => entry.name));
  assert.equal(products.filter(product => product.tags[0] === "Paintbox Purrs").length, 20);
  assert.equal(products.filter(product => product.tags[0] === "Purr in One Hue").length, 47);
  for (const product of products) {
    assert.ok(collectionNames.has(product.tags[0]), product.id);
    assert.ok(moodNames.has(product.tags[1]), product.id);
    assert.equal(new Set(product.tags).size, product.tags.length, product.id);
    assert.ok(product.tags.length >= 3, product.id);
    assert.equal(product.tags[0], Number(product.assetId.slice(4)) <= 29 ? "Paintbox Purrs" : "Purr in One Hue", product.id);
    assert.ok(!product.tags.some(tag => ["tray", "trays", "figurine", "figurines", "holder", "holders"].includes(tag.toLowerCase())), product.id);
  }
});

test("studio material and approximate size guides stay separate from unconfirmed prices", () => {
  for (const product of products) {
    assert.deepEqual(product.price, { status: "on-enquiry", amount: null, currency: null }, product.id);
    assert.equal(product.availability, "on-enquiry", product.id);
    assert.equal(product.dimensions.approximate, true, product.id);
    assert.equal(product.dimensions.unit, "in", product.id);
    assert.ok(product.dimensions.length >= 4.5 && product.dimensions.length <= 5.5, product.id);
    assert.ok(product.dimensions.width >= 2.5 && product.dimensions.width <= 3.5, product.id);
    assert.ok(product.dimensions.height >= 2.5 && product.dimensions.height <= 3.5, product.id);
    assert.deepEqual(product.materials, ["Artisan Casting Plaster / Gypsum Composite"], product.id);
    assert.ok(product.sustainability.scope.includes("casting mix"), product.id);
    assert.ok(product.sustainability.waste.includes("where practical"), product.id);
    assert.deepEqual(product.options, [], `${product.id} must not offer unconfirmed variants`);
    assert.ok(Number.isSafeInteger(product.maxQuantity) && product.maxQuantity > 0, product.id);
  }
});

test("every product's full image, card image, and blur preview decode at their declared dimensions", async () => {
  for (const product of products) {
    const image = product.images[0];
    for (const [variant, expectedSize] of [[image, 2508], [image.card, 640]]) {
      const file = new URL(`../public${variant.src}`, import.meta.url);
      const bytes = await readFile(file);
      const metadata = await sharp(bytes).metadata();
      assert.equal(metadata.format, "webp", variant.src);
      assert.equal(metadata.width, expectedSize, variant.src);
      assert.equal(metadata.height, expectedSize, variant.src);
      assert.equal(metadata.width, variant.width, `${variant.src} metadata width`);
      assert.equal(metadata.height, variant.height, `${variant.src} metadata height`);
      await sharp(bytes).stats();
    }
    assert.match(image.blurDataURL, /^data:image\/(?:webp|png|jpeg);base64,/, product.id);
    const preview = Buffer.from(image.blurDataURL.split(",")[1], "base64");
    const previewMetadata = await sharp(preview).metadata();
    assert.ok(previewMetadata.width > 0 && previewMetadata.width <= 32, product.id);
    assert.ok(previewMetadata.height > 0 && previewMetadata.height <= 32, product.id);
    await sharp(preview).stats();
  }
});

test("every real piece can be added, persisted, and restored without requiring invented options", () => {
  const items = addCollection();
  assert.equal(items.length, products.length);
  const restored = restoreCart(serializeCart(items), cartCatalog());
  assert.deepEqual(restored, items);
  for (const product of products) {
    const item = restored.find(({ productId }) => productId === product.id);
    assert.ok(item, product.id);
    assert.equal(item.title, product.name);
    assert.equal(item.slug, product.slug);
    assert.equal(item.image.src, product.images[0].card.src);
    assert.equal(item.quantity, 1);
    assert.deepEqual(item.selectedOptions, []);
    assert.deepEqual(item.price, product.price);
  }
});

test("persisted demo IDs are discarded rather than reassigned to real artwork", () => {
  const items = addCollection();
  const legacyItems = items.slice(0, 4).map((item, index) => ({
    ...item,
    productId: `cat-${String(index + 1).padStart(3, "0")}`,
    title: "Old sample piece",
    selections: { finish: "ivory" },
  }));
  assert.deepEqual(restoreCart(serializeCart(legacyItems), cartCatalog()), []);
  assert.deepEqual(restoreCart(serializeCart([...legacyItems, items[0]]), cartCatalog()), [items[0]]);
});

test("the complete real collection produces an itemized quote request with no invented subtotal", () => {
  const payload = buildEnquiryPayload({
    name: "A Studio Visitor", email: "visitor@example.com", phone: "", country: "India",
    cityRegion: "Pune", postalCode: "", desiredArrivalDate: "", notes: "A collection for our reading room.",
  }, addCollection(), "PREVIEW-CATALOG", "2026-10-11T12:00:00.000Z");
  assert.equal(payload.mode, "console-preview");
  assert.equal(payload.items.length, products.length);
  assert.deepEqual(payload.summary, { quantity: products.length, unquotedQuantity: products.length, totals: [] });
  assert.deepEqual(payload.items.map(({ productId }) => productId), products.map(({ id }) => id));
});

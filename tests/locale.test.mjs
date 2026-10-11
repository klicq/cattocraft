import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { localePath, pageAlternates, text, translateError } from "../lib/locale.ts";
import { cartReducer, initialCartState, restoreCart, serializeCart } from "../lib/cart.ts";

const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const italian = JSON.parse(await readFile(new URL("../data/products.it.json", import.meta.url), "utf8"));

test("Italian copy covers every active product while preserving shared IDs, slugs and image references", () => {
  assert.deepEqual(Object.keys(italian).sort(), products.map(product => product.id).sort());
  for (const product of products) {
    const translated = italian[product.id];
    for (const key of ["name", "shortDescription", "description", "categoryName", "alt", "displayNote"]) {
      assert.ok(typeof translated[key] === "string" && translated[key].trim().length > 0, product.id + ": " + key);
      assert.ok(!/[A-Za-z]\?[A-Za-z]|\uFFFD/.test(translated[key]), product.id + ": damaged UTF-8");
    }
    assert.equal(translated.tagLabels.length, product.tags.length, product.id);
  }
});

test("locale links preserve query strings, anchors and old English addresses", () => {
  assert.equal(localePath("/shop?collection=purr-in-one-hue&page=2#collection", "it"), "/it/shop?collection=purr-in-one-hue&page=2#collection");
  assert.equal(localePath("/it/products/marmalade-siesta", "en"), "/products/marmalade-siesta");
  assert.equal(localePath("/en/shop", "it"), "/it/shop");
  assert.equal(localePath("/it?from=hello", "en"), "/?from=hello");
  assert.equal(localePath("/", "it"), "/it");
  assert.equal(localePath("#details", "it"), "#details");
  assert.equal(localePath("https://example.com", "it"), "https://example.com");
  assert.equal(localePath("//example.com", "it"), "//example.com");
  assert.deepEqual(pageAlternates("/shop", "it"), { canonical: "/it/shop", languages: { en: "/shop", it: "/it/shop", "x-default": "/shop" } });
});

test("language changes refresh cart labels without losing quantities, notes or stable identity", () => {
  const source = products[0];
  const item = { ...source, image: { ...source.images[0].card, alt: source.images[0].alt } };
  let state = cartReducer(initialCartState, { type: "hydrate", items: [] });
  state = cartReducer(state, { type: "add_item", product: item, item: { productId: item.id, selections: {}, quantity: 2, notes: "A gift for a friend" } });
  const localized = { ...item, name: italian[item.id].name, image: { ...item.image, alt: italian[item.id].alt } };
  const restored = restoreCart(serializeCart(state.items), [localized]);
  assert.equal(restored[0].productId, item.id);
  assert.equal(restored[0].title, localized.name);
  assert.equal(restored[0].quantity, 2);
  assert.equal(restored[0].notes, "A gift for a friend");
  assert.equal(restored[0].slug, item.slug);
});

test("shared validation and storage feedback has Italian copy", () => {
  const error = "Add a complete email address, like you@example.com.";
  assert.notEqual(translateError(error, "it"), error);
  assert.equal(translateError(error, "en"), error);
  assert.equal(text("it", "Price on enquiry", "Prezzo su richiesta"), "Prezzo su richiesta");
});

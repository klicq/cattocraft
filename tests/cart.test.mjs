import test from "node:test";
import assert from "node:assert/strict";
import { addCartLine, cartReducer, initialCartState, lineKey, restoreCart, serializeCart, persistCart, loadCart, formatCartPrice, CART_STORAGE_KEY, LEGACY_CART_STORAGE_KEY, STORAGE_WARNING } from "../lib/cart.ts";

const product = {
  id: "cat-001", name: "The Sunday Loaf", slug: "the-sunday-loaf",
  image: { src: "/art/sampleart1.png", alt: "Ivory cat sculpture", width: 307, height: 215 },
  price: { status: "on-enquiry", amount: null, currency: null },
  availability: "ready-to-ship", oneOfAKind: false, maxQuantity: 10,
  options: [{ id: "finish", label: "Finish", required: true, values: [{ id: "ivory", label: "Matte ivory" }, { id: "sage", label: "Soft sage" }] }],
};
const input = { productId: product.id, selections: { finish: "ivory" }, quantity: 1, notes: "" };
const empty = () => cartReducer(initialCartState, { type: "hydrate", items: [] });
const add = (state, item = input, catalogProduct = product) => cartReducer(state, { type: "add_item", item, product: catalogProduct });
const line = add(empty()).items[0];

function memoryStorage(entries = []) {
  const data = new Map(entries);
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
}

test("adds a complete product snapshot and increments the animation event once", () => {
  const state = add(empty());
  assert.equal(state.additionCount, 1);
  assert.deepEqual(state.items[0], {
    ...input, title: product.name, slug: product.slug, image: product.image, price: product.price,
    selectedOptions: [{ id: "finish", label: "Finish", valueId: "ivory", valueLabel: "Matte ivory" }],
  });
});

test("cannot mutate before hydration, so existing storage is not overwritten by an early action", () => {
  assert.equal(add(initialCartState), initialCartState);
  assert.equal(cartReducer(initialCartState, { type: "clear_cart" }), initialCartState);
});

test("repeat additions merge quantities without mutating earlier state", () => {
  const first = add(empty(), { ...input, quantity: 2 });
  const next = add(first, { ...input, quantity: 3 });
  assert.equal(next.items.length, 1);
  assert.equal(next.items[0].quantity, 5);
  assert.equal(first.items[0].quantity, 2);
});

test("different finishes and maker notes remain separate lines", () => {
  let state = add(empty());
  state = add(state, { ...input, selections: { finish: "sage" } });
  state = add(state, { ...input, notes: "  Birthday gift  " });
  assert.equal(state.items.length, 3);
  assert.equal(state.items[2].notes, "Birthday gift");
  assert.equal(state.items[1].selectedOptions[0].valueLabel, "Soft sage");
});

test("normalized note whitespace and option ordering do not create duplicate identities", () => {
  assert.equal(lineKey({ ...input, notes: " hello ", selections: { size: "s", finish: "ivory" } }), lineKey({ ...input, notes: "hello", selections: { finish: "ivory", size: "s" } }));
});

test("updates quantity without changing the selected options, notes, or animation event", () => {
  const state = add(empty(), { ...input, notes: "Gift" });
  const next = cartReducer(state, { type: "update_quantity", key: lineKey(state.items[0]), quantity: 4, product });
  assert.equal(next.items[0].quantity, 4);
  assert.equal(next.items[0].notes, "Gift");
  assert.deepEqual(next.items[0].selections, input.selections);
  assert.equal(next.additionCount, state.additionCount);
});

test("quantity limits apply across finishes, both for add and update", () => {
  const first = add(empty(), { ...input, quantity: 8 });
  const full = add(first, { ...input, selections: { finish: "sage" }, quantity: 2 });
  assert.equal(add(full), full);
  assert.equal(cartReducer(full, { type: "update_quantity", key: lineKey(full.items[1]), quantity: 3, product }), full);
  const reduced = cartReducer(full, { type: "update_quantity", key: lineKey(full.items[0]), quantity: 7, product });
  assert.equal(add(reduced).items[0].quantity, 8);
});

test("invalid quantities are rejected instead of rounded or treated as removal", () => {
  const state = add(empty());
  for (const quantity of [0, -1, 1.5, NaN, Infinity, 999]) {
    assert.equal(cartReducer(state, { type: "update_quantity", key: lineKey(line), quantity, product }), state);
    assert.equal(add(state, { ...input, quantity }), state);
  }
});

test("one-of-a-kind limits cannot be bypassed with alternate notes", () => {
  const unique = { ...product, oneOfAKind: true };
  const state = add(empty(), input, unique);
  assert.equal(add(state, { ...input, notes: "A second one" }, unique), state);
});

test("removes by stable identity after another item has already been removed", () => {
  let state = add(add(empty()), { ...input, selections: { finish: "sage" } });
  const secondKey = lineKey(state.items[1]);
  state = cartReducer(state, { type: "remove_item", key: lineKey(state.items[0]) });
  assert.equal(state.items[0].selections.finish, "sage");
  state = cartReducer(state, { type: "remove_item", key: secondKey });
  assert.deepEqual(state.items, []);
});

test("cleared baskets stay empty after a reload", () => {
  const storage = memoryStorage();
  const cleared = cartReducer(add(empty()), { type: "clear_cart" });
  assert.equal(persistCart(storage, cleared.items), "");
  assert.deepEqual(loadCart(storage, [product]).items, []);
});

test("serialized storage includes the required fields and survives reload", () => {
  const state = add(empty(), { ...input, quantity: 3, notes: "Gift" });
  const raw = serializeCart(state.items);
  const saved = JSON.parse(raw);
  assert.equal(saved.version, 2);
  for (const key of ["productId", "title", "price", "image", "selections", "selectedOptions", "quantity"]) assert.ok(key in saved.items[0]);
  assert.deepEqual(restoreCart(raw, [product]), state.items);
});

test("migrates legacy selections before writing the new snapshot", () => {
  const storage = memoryStorage([[LEGACY_CART_STORAGE_KEY, JSON.stringify([{ ...input, quantity: 4 }])]]);
  const loaded = loadCart(storage, [product]);
  assert.equal(loaded.items[0].quantity, 4);
  assert.equal(loaded.items[0].title, product.name);
  assert.equal(JSON.parse(storage.getItem(CART_STORAGE_KEY)).items[0].quantity, 4);
  assert.equal(storage.getItem(LEGACY_CART_STORAGE_KEY), null);
});

test("a v2 empty basket takes precedence over an old nonempty basket", () => {
  const storage = memoryStorage([[CART_STORAGE_KEY, serializeCart([])], [LEGACY_CART_STORAGE_KEY, JSON.stringify([input])]]);
  assert.deepEqual(loadCart(storage, [product]).items, []);
});

test("blocked writes retain the loaded basket and legacy source with a warning", () => {
  const storage = memoryStorage([[LEGACY_CART_STORAGE_KEY, JSON.stringify([input])]]);
  storage.setItem = () => { throw new Error("Storage unavailable"); };
  const loaded = loadCart(storage, [product]);
  assert.equal(loaded.items.length, 1);
  assert.equal(loaded.warning, STORAGE_WARNING);
  assert.notEqual(storage.getItem(LEGACY_CART_STORAGE_KEY), null);
});

test("blocked reads produce a usable empty in-memory basket with a warning", () => {
  const storage = memoryStorage();
  storage.getItem = () => { throw new Error("Storage unavailable"); };
  assert.deepEqual(loadCart(storage, [product]), { items: [], warning: STORAGE_WARNING });
});

test("corrupt records and missing required options cannot enter the basket", () => {
  for (const raw of ["not json", "{}", "null", '{"version":2,"items":null}']) assert.deepEqual(restoreCart(raw, [product]), []);
  const raw = JSON.stringify([{ ...input, productId: "missing" }, { ...input, selections: {} }, { ...input, selections: { finish: "invented" } }, { ...input, quantity: -1 }, { ...input, quantity: 1.5 }, null]);
  assert.deepEqual(restoreCart(raw, [product]), []);
});

test("stored titles, prices, and image URLs are refreshed from the catalog", () => {
  const raw = serializeCart([{ ...line, title: "Fake", price: { status: "fixed", amount: 0, currency: "USD" }, image: { ...line.image, src: "https://untrusted.example/image.png" } }]);
  assert.deepEqual(restoreCart(raw, [product])[0], line);
});

test("sold products are removed and excessive stored quantities are safely capped", () => {
  assert.deepEqual(restoreCart(JSON.stringify([input]), [{ ...product, availability: "sold" }]), []);
  assert.equal(restoreCart(JSON.stringify([{ ...input, quantity: 500 }]), [product])[0].quantity, 10);
  assert.equal(addCartLine([line], { ...line, quantity: 500 }, 10)[0].quantity, 10);
});

test("unknown prices stay null and fixed prices retain their currency", () => {
  assert.equal(line.price.amount, null);
  assert.equal(formatCartPrice(line.price), "Price on enquiry");
  const priced = add(empty(), input, { ...product, price: { status: "fixed", amount: 25, currency: "USD" } });
  assert.deepEqual(priced.items[0].price, { status: "fixed", amount: 25, currency: "USD" });
  assert.equal(formatCartPrice(priced.items[0].price), "$25.00");
});

test("rapid actions persist the latest complete state rather than stale quantities", () => {
  const storage = memoryStorage();
  let latest = empty();
  for (let index = 0; index < 10; index++) {
    latest = add(latest);
    persistCart(storage, latest.items);
  }
  assert.equal(loadCart(storage, [product]).items[0].quantity, 10);
  assert.equal(latest.additionCount, 10);
  assert.equal(add(latest), latest);
});

test("restoring another tab's state does not replay the add animation", () => {
  const state = add(empty());
  const hydrated = cartReducer(state, { type: "hydrate", items: [{ ...line, quantity: 4 }] });
  assert.equal(hydrated.items[0].quantity, 4);
  assert.equal(hydrated.additionCount, 1);
});

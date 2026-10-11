export const CART_STORAGE_KEY = "cat-art-cart-v2";
export const LEGACY_CART_STORAGE_KEY = "cat-art-cart-v1";
export const STORAGE_WARNING = "Your browser couldn’t save this basket. Keep this tab open to retain your selections.";

export type CartInput = { productId: string; selections: Record<string, string>; quantity: number; notes: string };
export type CartPrice = { status: "on-enquiry" | "fixed" | "from"; amount: number | null; currency: string | null };
export type CartImage = { src: string; alt: string; width: number; height: number };
export type CartLine = CartInput & {
  title: string; slug: string; price: CartPrice; image: CartImage;
  selectedOptions: { id: string; label: string; valueId: string; valueLabel: string }[];
};
export type CartCatalogItem = {
  id: string; name: string; slug: string; image: CartImage;
  price: { status: string; amount: number | null; currency: string | null };
  availability: string; oneOfAKind: boolean; maxQuantity: number;
  options: { id: string; label: string; required: boolean; values: { id: string; label: string }[] }[];
};
export type CartState = { items: CartLine[]; ready: boolean; storageWarning: string; additionCount: number };
export type CartAction =
  | { type: "hydrate"; items: CartLine[]; warning?: string }
  | { type: "add_item"; item: CartInput; product: CartCatalogItem }
  | { type: "update_quantity"; key: string; quantity: number; product: CartCatalogItem }
  | { type: "remove_item"; key: string }
  | { type: "clear_cart" }
  | { type: "storage_status"; warning: string };
export const initialCartState: CartState = { items: [], ready: false, storageWarning: "", additionCount: 0 };

export function lineKey(line: Pick<CartInput, "productId" | "selections" | "notes">) {
  return JSON.stringify([line.productId, Object.entries(line.selections).sort(([a], [b]) => a.localeCompare(b)), line.notes.trim().slice(0, 500)]);
}
export function productLimit(product: CartCatalogItem) { return product.oneOfAKind ? 1 : product.maxQuantity; }

function snapshotPrice(price: CartCatalogItem["price"]): CartPrice {
  if ((price.status === "fixed" || price.status === "from") && typeof price.amount === "number" && Number.isFinite(price.amount) && price.amount >= 0 && price.currency && /^[A-Z]{3}$/.test(price.currency)) {
    return { status: price.status, amount: price.amount, currency: price.currency };
  }
  return { status: "on-enquiry", amount: null, currency: null };
}
export function formatCartPrice(price: CartPrice, locale: "en" | "it" = "en") {
  if (price.status === "on-enquiry" || price.amount === null || !price.currency) return locale === "it" ? "Prezzo su richiesta" : "Price on enquiry";
  const formatted = new Intl.NumberFormat(locale === "it" ? "it-IT" : "en", { style: "currency", currency: price.currency }).format(price.amount);
  return `${price.status === "from" ? (locale === "it" ? "Da " : "From ") : ""}${formatted}`;
}

// Refresh display snapshots from the catalog; stored prices and media are never authoritative.
function createLine(input: CartInput, product: CartCatalogItem): CartLine | null {
  if (input.productId !== product.id || product.availability === "sold" || !Number.isSafeInteger(input.quantity) || input.quantity < 1) return null;
  if (typeof input.notes !== "string" || !input.selections || typeof input.selections !== "object" || Array.isArray(input.selections)) return null;
  const selections: Record<string, string> = {};
  const selectedOptions: CartLine["selectedOptions"] = [];
  for (const option of product.options) {
    const selected = input.selections[option.id];
    if (selected === undefined && !option.required) continue;
    const value = option.values.find(({ id }) => id === selected);
    if (!value) return null;
    selections[option.id] = value.id;
    selectedOptions.push({ id: option.id, label: option.label, valueId: value.id, valueLabel: value.label });
  }
  return {
    productId: product.id, slug: product.slug, title: product.name,
    price: snapshotPrice(product.price), image: { ...product.image }, selections, selectedOptions,
    quantity: input.quantity, notes: input.notes.trim().slice(0, 500),
  };
}

export function addCartLine(lines: CartLine[], incoming: CartLine, limit: number): CartLine[] {
  if (!Number.isSafeInteger(incoming.quantity) || incoming.quantity < 1) return lines;
  const alreadyAdded = lines.filter((line) => line.productId === incoming.productId).reduce((sum, line) => sum + line.quantity, 0);
  const quantity = Math.max(0, Math.min(incoming.quantity, limit - alreadyAdded));
  if (quantity === 0) return lines;
  const clean = { ...incoming, quantity, notes: incoming.notes.trim().slice(0, 500) };
  const key = lineKey(clean);
  if (!lines.some((line) => lineKey(line) === key)) return [...lines, clean];
  return lines.map((line) => lineKey(line) === key ? { ...clean, quantity: line.quantity + quantity } : line);
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  if (action.type === "hydrate") return { ...state, ready: true, items: action.items, storageWarning: action.warning ?? "" };
  if (action.type === "storage_status") return state.storageWarning === action.warning ? state : { ...state, storageWarning: action.warning };
  if (!state.ready) return state;
  switch (action.type) {
    case "add_item": {
      const incoming = createLine(action.item, action.product);
      if (!incoming) return state;
      const current = state.items.filter((line) => line.productId === incoming.productId).reduce((sum, line) => sum + line.quantity, 0);
      if (current + incoming.quantity > productLimit(action.product)) return state;
      return { ...state, items: addCartLine(state.items, incoming, productLimit(action.product)), additionCount: state.additionCount + 1 };
    }
    case "update_quantity": {
      const line = state.items.find((item) => lineKey(item) === action.key);
      if (!line || line.productId !== action.product.id || action.product.availability === "sold" || !Number.isSafeInteger(action.quantity) || action.quantity < 1) return state;
      const others = state.items.filter((item) => item.productId === line.productId && lineKey(item) !== action.key).reduce((sum, item) => sum + item.quantity, 0);
      if (others + action.quantity > productLimit(action.product) || line.quantity === action.quantity) return state;
      return { ...state, items: state.items.map((item) => lineKey(item) === action.key ? { ...item, quantity: action.quantity } : item) };
    }
    case "remove_item": {
      const items = state.items.filter((item) => lineKey(item) !== action.key);
      return items.length === state.items.length ? state : { ...state, items };
    }
    case "clear_cart": return state.items.length ? { ...state, items: [] } : state;
  }
}

export function serializeCart(items: CartLine[]) { return JSON.stringify({ version: 2, items }); }

export function restoreCart(raw: string | null, catalog: CartCatalogItem[]): CartLine[] {
  if (!raw) return [];
  let saved;
  try { saved = JSON.parse(raw); } catch { return []; }
  const values: unknown = Array.isArray(saved) ? saved : saved?.version === 2 ? saved.items : null;
  if (!Array.isArray(values)) return [];
  let restored: CartLine[] = [];
  for (const value of values.slice(0, 1000)) {
    if (!value || typeof value !== "object") continue;
    const product = catalog.find((item) => item.id === value.productId);
    if (!product) continue;
    const line = createLine(value, product);
    if (line) restored = addCartLine(restored, line, productLimit(product));
  }
  return restored;
}

type CartStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function persistCart(storage: CartStorage, items: CartLine[]): string {
  try { storage.setItem(CART_STORAGE_KEY, serializeCart(items)); return ""; }
  catch { return STORAGE_WARNING; }
}
export function loadCart(storage: CartStorage, catalog: CartCatalogItem[]) {
  let raw: string | null;
  let legacy = false;
  try {
    raw = storage.getItem(CART_STORAGE_KEY);
    if (raw === null) { raw = storage.getItem(LEGACY_CART_STORAGE_KEY); legacy = raw !== null; }
  } catch { return { items: [], warning: STORAGE_WARNING }; }
  const items = restoreCart(raw, catalog);
  const warning = persistCart(storage, items);
  if (legacy && !warning) {
    try { storage.removeItem(LEGACY_CART_STORAGE_KEY); } catch { /* The v2 snapshot remains authoritative. */ }
  }
  return { items, warning };
}

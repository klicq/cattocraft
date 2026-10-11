import type { CartLine } from "./cart";

export type EnquiryFields = {
  name: string; email: string; phone: string; country: string; cityRegion: string;
  postalCode: string; desiredArrivalDate: string; notes: string;
};
export type EnquiryErrors = Partial<Record<keyof EnquiryFields, string>>;
export const emptyEnquiryFields: EnquiryFields = { name: "", email: "", phone: "", country: "", cityRegion: "", postalCode: "", desiredArrivalDate: "", notes: "" };

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validateEnquiry(fields: EnquiryFields, today = localDate()): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (!fields.name.trim()) errors.name = "Let us know what to call you.";
  else if (fields.name.trim().length > 100) errors.name = "Please keep your name under 100 characters.";
  if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) || fields.email.trim().length > 254) errors.email = "Add a complete email address, like you@example.com.";
  const phone = fields.phone.trim();
  if (phone && (phone.length > 40 || !/^\+?[\d\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 7 || phone.replace(/\D/g, "").length > 15)) errors.phone = "Add a phone number with 7–15 digits, including your country code.";
  if (!fields.country.trim()) errors.country = "Tell us which country your pieces would travel to.";
  else if (fields.country.trim().length > 100) errors.country = "Please use a country name under 100 characters.";
  if (!fields.cityRegion.trim()) errors.cityRegion = "Add your city or region so we can estimate delivery.";
  else if (fields.cityRegion.trim().length > 120) errors.cityRegion = "Please keep the city or region under 120 characters.";
  if (fields.postalCode.trim().length > 32) errors.postalCode = "Please keep the postal code under 32 characters.";
  if (fields.notes.trim().length > 2000) errors.notes = "Please keep your note under 2,000 characters.";
  if (fields.desiredArrivalDate) {
    const date = new Date(`${fields.desiredArrivalDate}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.desiredArrivalDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== fields.desiredArrivalDate) errors.desiredArrivalDate = "Choose a valid calendar date.";
    else if (fields.desiredArrivalDate < today) errors.desiredArrivalDate = "Choose today or a future date. We’ll confirm what is possible.";
  }
  return errors;
}

export function summarizeEnquiry(items: CartLine[]) {
  const totals = new Map<string, { currency: string; amount: number; startingFrom: boolean }>();
  let unquotedQuantity = 0;
  for (const item of items) {
    const { price, quantity } = item;
    if (price.status === "on-enquiry" || price.amount === null || !price.currency) { unquotedQuantity += quantity; continue; }
    const total = totals.get(price.currency) ?? { currency: price.currency, amount: 0, startingFrom: false };
    total.amount = Math.round((total.amount + price.amount * quantity) * 1e6) / 1e6;
    total.startingFrom ||= price.status === "from";
    totals.set(price.currency, total);
  }
  return { quantity: items.reduce((sum, item) => sum + item.quantity, 0), unquotedQuantity, totals: Array.from(totals.values()) };
}

export function buildEnquiryPayload(fields: EnquiryFields, items: CartLine[], reference: string, createdAt: string) {
  if (!items.length) throw new Error("Choose at least one piece before preparing an enquiry.");
  if (Object.keys(validateEnquiry(fields)).length) throw new Error("Please check your contact and delivery details.");
  // Take a snapshot so later basket edits cannot change the logged preview.
  const selectedItems = items.map((item) => ({ ...item, selections: { ...item.selections }, selectedOptions: item.selectedOptions.map((option) => ({ ...option })), image: { ...item.image }, price: { ...item.price } }));
  return {
    schemaVersion: 1,
    mode: "console-preview" as const,
    reference,
    createdAt,
    customer: { name: fields.name.trim(), email: fields.email.trim(), phone: phoneOrNull(fields.phone) },
    shipping: { country: fields.country.trim(), cityRegion: fields.cityRegion.trim(), postalCode: fields.postalCode.trim() || null },
    desiredArrivalDate: fields.desiredArrivalDate || null,
    notes: fields.notes.trim() || null,
    items: selectedItems,
    summary: summarizeEnquiry(selectedItems),
  };
}
export type EnquiryPayload = ReturnType<typeof buildEnquiryPayload>;

function phoneOrNull(phone: string) { return phone.trim() || null; }

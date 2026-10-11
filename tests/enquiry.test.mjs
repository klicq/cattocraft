import test from "node:test";
import assert from "node:assert/strict";
import { buildEnquiryPayload, summarizeEnquiry, validateEnquiry } from "../lib/enquiry.ts";

const fields = {
  name: "  Ada Artist  ", email: "  ada@example.com  ", phone: "", country: "  India  ",
  cityRegion: "  Pune  ", postalCode: "  411001  ", desiredArrivalDate: "", notes: "  A birthday present  ",
};
const item = {
  productId: "cat-001", slug: "sunday-loaf", title: "The Sunday Loaf", quantity: 2, notes: "Matte please",
  selections: { finish: "ivory" }, selectedOptions: [{ id: "finish", label: "Finish", valueId: "ivory", valueLabel: "Matte ivory" }],
  image: { src: "/art/sample.png", alt: "Cat sculpture", width: 500, height: 500 },
  price: { status: "on-enquiry", amount: null, currency: null },
};

test("requires usable contact and location details and keeps an optional date in the future", () => {
  const errors = validateEnquiry({ ...fields, name: " ", email: "broken", country: "", cityRegion: "", desiredArrivalDate: "2026-02-30" }, "2026-09-23");
  assert.deepEqual(Object.keys(errors).sort(), ["name", "email", "country", "cityRegion", "desiredArrivalDate"].sort());
  assert.deepEqual(validateEnquiry({ ...fields, desiredArrivalDate: "2026-09-22" }, "2026-09-23"), { desiredArrivalDate: "Choose today or a future date. We’ll confirm what is possible." });
  assert.deepEqual(validateEnquiry({ ...fields, desiredArrivalDate: "2026-09-23" }, "2026-09-23"), {});
});

test("tracks known totals separately from pieces awaiting a quote", () => {
  const summary = summarizeEnquiry([
    item,
    { ...item, productId: "cat-002", quantity: 3, price: { status: "fixed", amount: 25, currency: "USD" } },
    { ...item, productId: "cat-003", quantity: 1, price: { status: "from", amount: 12, currency: "USD" } },
  ]);
  assert.equal(summary.quantity, 6);
  assert.equal(summary.unquotedQuantity, 2);
  assert.deepEqual(summary.totals, [{ currency: "USD", amount: 87, startingFrom: true }]);
});

test("builds an itemized preview snapshot without changing the cart", () => {
  const cart = [{ ...item }];
  const payload = buildEnquiryPayload(fields, cart, "PREVIEW-123", "2026-09-23T00:00:00.000Z");
  assert.equal(payload.mode, "console-preview");
  assert.deepEqual(payload.customer, { name: "Ada Artist", email: "ada@example.com", phone: null });
  assert.deepEqual(payload.shipping, { country: "India", cityRegion: "Pune", postalCode: "411001" });
  assert.equal(payload.notes, "A birthday present");
  assert.equal(payload.summary.unquotedQuantity, 2);
  cart[0].selections.finish = "sage";
  assert.equal(payload.items[0].selections.finish, "ivory");
  assert.throws(() => buildEnquiryPayload(fields, [], "PREVIEW-123", "2026-09-23T00:00:00.000Z"));
});

test("an optional international phone number is validated and included in the enquiry", () => {
  assert.deepEqual(validateEnquiry({ ...fields, phone: "   " }), {});
  const contact = { ...fields, phone: "  +91 98765 43210  " };
  assert.deepEqual(validateEnquiry(contact), {});
  const payload = buildEnquiryPayload(contact, [item], "PREVIEW-PHONE", "2026-09-24T00:00:00.000Z");
  assert.equal(payload.customer.phone, "+91 98765 43210");
  for (const phone of ["call me", "123", "+1234567890123456", "+1 <script>"]) {
    assert.ok(validateEnquiry({ ...fields, phone }).phone);
    assert.throws(() => buildEnquiryPayload({ ...fields, phone }, [item], "PREVIEW-PHONE", "2026-09-24T00:00:00.000Z"));
  }
});

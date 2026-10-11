import test from "node:test";
import assert from "node:assert/strict";
import { buildContactPayload, emptyContactFields, validateContact } from "../lib/contact.ts";

const valid = { ...emptyContactFields, name: "  Ada Artist  ", email: "  ada@example.com  ", message: "  I’d love to ask about a sage finish.  " };

test("a general message needs no cart, phone, or organization", () => {
  assert.deepEqual(validateContact(valid), {});
  const payload = buildContactPayload(valid, "HELLO-PREVIEW-TEST", "2026-09-24T00:00:00.000Z");
  assert.equal(payload.mode, "console-preview");
  assert.equal(payload.kind, "studio-contact");
  assert.equal(payload.topic, "question");
  assert.deepEqual(payload.customer, { name: "Ada Artist", email: "ada@example.com", phone: null, organization: null });
  assert.equal(payload.message, "I’d love to ask about a sage finish.");
});

test("incomplete or invalid contact requests cannot produce a payload", () => {
  assert.deepEqual(Object.keys(validateContact(emptyContactFields)).sort(), ["email", "message", "name"]);
  for (const change of [
    { email: "missing-domain" }, { message: "   " }, { topic: "unknown-topic" },
    { message: "a".repeat(3001) }, { name: "a".repeat(101) },
  ]) {
    assert.ok(Object.keys(validateContact({ ...valid, ...change })).length);
    assert.throws(() => buildContactPayload({ ...valid, ...change }, "HELLO-PREVIEW-TEST", "2026-09-24T00:00:00.000Z"));
  }
});

test("optional phone numbers support international formatting and reject unusable values", () => {
  for (const phone of ["", " ", "+91 98765 43210", "+1 (212) 555-0198"]) {
    assert.deepEqual(validateContact({ ...valid, phone }), {});
  }
  for (const phone of ["123", "phone please", "+1234567890123456", "++123456789"]) {
    assert.ok(validateContact({ ...valid, phone }).phone);
  }
});

test("project previews include the organization only for the relevant conversation", () => {
  const fields = { ...valid, topic: "organization", organization: "  Willow School  ", phone: " +91 98765 43210 " };
  const project = buildContactPayload(fields, "HELLO-PREVIEW-TEST", "2026-09-24T00:00:00.000Z");
  assert.equal(project.customer.organization, "Willow School");
  assert.equal(project.customer.phone, "+91 98765 43210");
  fields.message = "A later edit";
  assert.equal(project.message, valid.message.trim());
  assert.equal(buildContactPayload({ ...fields, topic: "hello" }, "HELLO-PREVIEW-EDIT", "2026-09-24T00:00:00.000Z").customer.organization, null);
  assert.ok(validateContact({ ...fields, organization: "a".repeat(151) }).organization);
});

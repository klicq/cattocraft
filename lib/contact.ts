export const contactTopics = [
  { id: "question", label: "A little question", hint: "Ask us about a piece, a finish, or anything you’re curious about." },
  { id: "custom", label: "Something personal", hint: "Tell us about your idea, preferred colours, and the occasion or space you have in mind." },
  { id: "organization", label: "A bigger project", hint: "Share your organization, the pieces and quantities you need, your destination, timing, and budget." },
  { id: "hello", label: "Just saying hello", hint: "A thought, an introduction, or a little story. We’d love to hear it." },
] as const;

export type ContactTopic = typeof contactTopics[number]["id"];
export type ContactFields = {
  name: string;
  email: string;
  phone: string;
  topic: ContactTopic;
  organization: string;
  message: string;
};
export type ContactErrors = Partial<Record<keyof ContactFields, string>>;
export const emptyContactFields: ContactFields = { name: "", email: "", phone: "", topic: "question", organization: "", message: "" };

export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  if (!fields.name.trim()) errors.name = "Let us know what to call you.";
  else if (fields.name.trim().length > 100) errors.name = "Please keep your name to 100 characters.";
  const email = fields.email.trim();
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Add a complete email address, like you@example.com.";
  const phone = fields.phone.trim();
  const digits = phone.replace(/\D/g, "").length;
  if (phone && (phone.length > 40 || !/^\+?[\d\s().-]+$/.test(phone) || digits < 7 || digits > 15)) errors.phone = "Add a phone number with 7–15 digits, including your country code.";
  if (!contactTopics.some(({ id }) => id === fields.topic)) errors.topic = "Choose what you’d like to chat about.";
  if (fields.topic === "organization" && fields.organization.trim().length > 150) errors.organization = "Please keep the organization name to 150 characters.";
  if (!fields.message.trim()) errors.message = "Add a little note so we know how to help.";
  else if (fields.message.trim().length > 3000) errors.message = "Please keep your note to 3,000 characters.";
  return errors;
}

export function buildContactPayload(fields: ContactFields, reference: string, createdAt: string) {
  if (Object.keys(validateContact(fields)).length) throw new Error("Please check your contact details and note.");
  return {
    schemaVersion: 1,
    kind: "studio-contact" as const,
    mode: "console-preview" as const,
    reference,
    createdAt,
    topic: fields.topic,
    customer: {
      name: fields.name.trim(),
      email: fields.email.trim(),
      phone: fields.phone.trim() || null,
      organization: fields.topic === "organization" ? fields.organization.trim() || null : null,
    },
    message: fields.message.trim(),
  };
}

export type ContactPayload = ReturnType<typeof buildContactPayload>;

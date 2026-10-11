import ContactPage, { generateMetadata as contactMetadata } from "../../[locale]/contact/page";

const params = Promise.resolve({ locale: "en" });

export function generateMetadata() {
  return contactMetadata({ params });
}

export default function EnglishContactPage() {
  return ContactPage({ params });
}

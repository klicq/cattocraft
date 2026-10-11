import EnquiryPage, { generateMetadata as enquiryMetadata } from "../../[locale]/enquiry/page";

const params = Promise.resolve({ locale: "en" });

export function generateMetadata() {
  return enquiryMetadata({ params });
}

export default function EnglishEnquiryPage() {
  return EnquiryPage({ params });
}

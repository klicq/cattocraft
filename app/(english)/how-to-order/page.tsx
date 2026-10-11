import HowToOrderPage, { generateMetadata as orderMetadata } from "../../[locale]/how-to-order/page";

const params = Promise.resolve({ locale: "en" });

export function generateMetadata() {
  return orderMetadata({ params });
}

export default function EnglishHowToOrderPage() {
  return HowToOrderPage({ params });
}

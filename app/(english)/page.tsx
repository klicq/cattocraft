import HomePage, { generateMetadata as homeMetadata } from "../[locale]/page";

const params = Promise.resolve({ locale: "en" });

export function generateMetadata() {
  return homeMetadata({ params });
}

export default function EnglishHomePage() {
  return HomePage({ params });
}

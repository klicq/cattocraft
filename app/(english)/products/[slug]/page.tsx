import ProductPage, {
  generateMetadata as productMetadata,
  generateStaticParams as productParams,
} from "../../../[locale]/products/[slug]/page";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return productParams();
}

async function localizedParams(params: Props["params"]) {
  return { ...(await params), locale: "en" };
}

export function generateMetadata({ params }: Props) {
  return productMetadata({ params: localizedParams(params) });
}

export default function EnglishProductPage({ params }: Props) {
  return ProductPage({ params: localizedParams(params) });
}

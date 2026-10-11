import ShopPage, { generateMetadata as shopMetadata } from "../../[locale]/shop/page";

const params = Promise.resolve({ locale: "en" });
type Props = Pick<Parameters<typeof ShopPage>[0], "searchParams">;

export function generateMetadata({ searchParams }: Props) {
  return shopMetadata({ params, searchParams });
}

export default function EnglishShopPage({ searchParams }: Props) {
  return ShopPage({ params, searchParams });
}

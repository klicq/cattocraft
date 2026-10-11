import productData from "@/data/products.json";
import italianData from "@/data/products.it.json";
import { text, type Locale } from "./locale";
import type { CartImage, CartPrice } from "./cart";

export type ProductImage = {
  src: string; alt: string; width: number; height: number; order: number;
  focalPoint: { x: number; y: number };
  blurDataURL?: string;
  card?: { src: string; width: number; height: number };
};
export type Product = {
  id: string; assetId: string; slug: string; name: string;
  category: { id: string; name: string }; tags: string[];
  shortDescription: string; description: string; materials: string[];
  dimensions: { length: number; width: number; height: number; unit: string; approximate: boolean } | null;
  sustainability: { formulation: string; process: string; waste: string; scope: string };
  tagLabels?: string[];
  care: string; price: CartPrice;
  availability: "on-enquiry" | "ready-to-ship" | "made-to-order" | "sold";
  leadTime: string;
  options: { id: string; label: string; required: boolean; values: { id: string; label: string; color?: string }[] }[];
  customization: { available: boolean; notes: string };
  images: ProductImage[]; model3d: { src: string } | null;
  display: { frame: "arch" | "rounded"; tone: "peach" | "sage" | "sand"; note: string };
  isSample: boolean; oneOfAKind: boolean; maxQuantity: number; included: string[];
};

// Catalog and asset invariants are validated in tests/catalog.test.mjs.
const products = productData as Product[];
export type CartProduct = Pick<Product, "id" | "slug" | "name" | "price" | "options" | "availability" | "oneOfAKind" | "maxQuantity"> & { image: CartImage };

function cover(product: Product): ProductImage {
  const image = [...product.images].sort((a, b) => a.order - b.order)[0];
  if (!image) throw new Error('Product ' + product.id + ' needs a cover image.');
  return image;
}
type ItalianProduct = { name: string; shortDescription: string; description: string; categoryName: string; alt: string; displayNote: string; tagLabels: string[] };
const italianProducts = italianData as Record<string, ItalianProduct>;
const localizedProducts: Product[] = products.map(product => {
  const translation = italianProducts[product.id];
  if (!translation) throw new Error('Missing Italian product translation: ' + product.id);
  return {
    ...product, name: translation.name, shortDescription: translation.shortDescription,
    description: translation.description, category: { ...product.category, name: translation.categoryName },
    tagLabels: translation.tagLabels, display: { ...product.display, note: translation.displayNote },
    images: product.images.map(image => ({ ...image, alt: translation.alt })),
    materials: ['Composito artigianale di gesso da colata'],
    sustainability: {
      formulation: 'Miscela da colata senza solventi e non tossica',
      process: 'La colata a temperatura ambiente limita l’energia impiegata in laboratorio, senza una fase di cottura in forno.',
      waste: 'Ritagli e residui di colata possono essere riutilizzati, quando possibile, per ridurre gli scarti.',
      scope: 'Queste informazioni riguardano la miscela e il processo di colata. Vernici e finiture protettive sono confermate per la creazione scelta.',
    },
    care: 'Spolvera con un panno morbido e asciutto e maneggia con delicatezza. Conserva al chiuso, lontano dall’umidità prolungata; ti confermeremo le indicazioni per la finitura scelta.',
    leadTime: 'Disponibilità e tempi di preparazione vengono confermati personalmente con la tua richiesta.',
    customization: { ...product.customization, notes: 'Hai in mente una misura, un colore o un dettaglio personale? Raccontaci del tuo spazio ed esploreremo le possibilità.' },
    included: ['Ti confermeremo la creazione e gli eventuali accessori inclusi nel tuo preventivo personale.'],
  };
});
export function getProducts(locale: Locale = "en") { return locale === "it" ? localizedProducts : products; }
export function getProduct(slug: string, locale: Locale = "en") { return getProducts(locale).find(product => product.slug === slug); }
export function getCartProducts(locale: Locale = "en"): CartProduct[] {
  return getProducts(locale).map(product => {
    const { id, slug, name, price, options, availability, oneOfAKind, maxQuantity } = product;
    const image = cover(product);
    const small = image.card ?? image;
    return { id, slug, name, price, options, availability, oneOfAKind, maxQuantity, image: { src: small.src, alt: image.alt, width: small.width, height: small.height } };
  });
}
export type ProductCardData = Pick<Product, "id" | "slug" | "name" | "category" | "tags" | "shortDescription" | "availability" | "display"> & {
  image: ProductImage; tagLabels: string[]; priceLabel: string; collectionNumber: string;
};
// Keep full stories and future galleries out of the shop's client payload.
export function getProductCards(selection: Product[] = products, locale: Locale = "en"): ProductCardData[] {
  const chosen = locale === "it" ? selection.map(product => getProduct(product.slug, locale) ?? product) : selection;
  return chosen.map((product) => ({
    id: product.id, slug: product.slug, name: product.name, category: product.category,
    tags: product.tags, shortDescription: product.shortDescription, availability: product.availability,
    display: product.display, image: cover(product), tagLabels: product.tagLabels ?? product.tags, priceLabel: text(locale, "Price on enquiry", "Prezzo su richiesta"),
    collectionNumber: String(products.findIndex(({ id }) => id === product.id) + 1).padStart(2, "0"),
  }));
}

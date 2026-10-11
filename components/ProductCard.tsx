import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/products";
import { localePath, text, type Locale } from "@/lib/locale";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, priority = false, headingLevel = 2, locale = "en" }: { product: ProductCardData; priority?: boolean; headingLevel?: 2 | 3; locale?: Locale }) {
  const { image } = product;
  const ready = product.availability === "ready-to-ship";
  const availability = ready ? text(locale, "Ready to ship", "Pronto per la spedizione") : product.availability === "made-to-order" ? text(locale, "Made to order", "Realizzato su richiesta") : text(locale, "Availability on enquiry", "Disponibilità su richiesta");
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <article className={styles.card} data-category={product.category.id}>
      <Link href={localePath(`/products/${product.slug}`, locale)} className={styles.link} prefetch={false} aria-labelledby={`${product.id}-name`}>
        <div className={styles.artwork} data-frame={product.display.frame} data-tone={product.display.tone}>
          <span className={styles.edition} aria-hidden="true">N° {product.collectionNumber}</span>
          <div className={styles.imageFrame}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 479px) 88vw, (max-width: 999px) 43vw, (max-width: 1399px) 21vw, 285px"
              quality={85}
              placeholder={image.blurDataURL ? "blur" : "empty"}
              blurDataURL={image.blurDataURL}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              className={styles.image}
              style={{ objectPosition: `${image.focalPoint.x * 100}% ${image.focalPoint.y * 100}%` }}
            />
          </div>
          <span className={styles.viewPiece} aria-hidden="true">{text(locale, "Meet this little one", "Conosci questa piccola meraviglia")} <span>↗</span></span>
        </div>

        <div className={styles.caption}>
          {product.tags[0] && <span className={styles.collectionTag} data-collection={product.tags[0]}>{product.tagLabels[0]}</span>}
          <div className={styles.meta}>
            <span>{product.tagLabels[1] ?? text(locale, "Little studio companion", "Piccola compagnia d’arte")}</span>
            <span className={styles.status} data-ready={ready}><span aria-hidden="true" />{availability}</span>
          </div>
          <Heading id={`${product.id}-name`}>{product.name}</Heading>
          <p className={styles.description}>{product.shortDescription}</p>
          <div className={styles.bottom}><span>{product.priceLabel}</span><span className={styles.arrow} aria-hidden="true">↗</span></div>
        </div>
      </Link>
      <p className={styles.handwritten} aria-hidden="true">{product.display.note}</p>
    </article>
  );
}

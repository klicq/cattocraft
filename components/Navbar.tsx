"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { localePath, text } from "@/lib/locale";
import { useLocale } from "./LocaleContext";
import LanguageSwitcher from "./LanguageSwitcher";
import LanguageFlag from "./LanguageFlag";
import { BasketIcon, CatSeal, Sparkle } from "./StudioMarks";
import { navigationLinks } from "./navigation";
import styles from "./Navbar.module.css";
import { useCart } from "./CartContext";

export default function Navbar() {
  const locale = useLocale();
  const { count: cartCount, openCart, additionCount } = useCart();
  const pathname = usePathname();
  const publicPath = localePath(pathname, "en");
  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const isOpen = openPath === pathname;

  return (
    <header
      className={styles.header}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          setOpenPath(null);
          menuButton.current?.focus();
        }
      }}
    >
      <div className={styles.announcement}>
        <span><Sparkle /> {text(locale, "Small batches. Big personality.", "Piccole serie. Grande personalità.")}</span>
        <span className={styles.studioNote}>{text(locale, "Made by hand. Supervised by a cat.", "Fatto a mano. Sorvegliato da un gatto.")}</span>
      </div>

      <div className={styles.navigation}>
        <Link href={localePath("/", locale)} className={styles.brand} aria-label={text(locale, "CattoCraft home", "Pagina iniziale di CattoCraft")} onClick={() => setOpenPath(null)}>
          <CatSeal className={styles.seal} />
          <span className={styles.wordmark}>CattoCraft<span>{text(locale, "THE LITTLE STUDIO", "IL PICCOLO LABORATORIO")}</span></span>
        </Link>

        <button ref={menuButton} type="button" className={styles.menuButton} aria-expanded={isOpen} aria-controls="primary-navigation" aria-label={isOpen ? text(locale, "Close navigation", "Chiudi il menu") : text(locale, "Open navigation", "Apri il menu")} onClick={() => setOpenPath(isOpen ? null : pathname)}>
          <span className={isOpen ? styles.menuIconOpen : styles.menuIcon} aria-hidden="true"><span /><span /></span>
        </button>

        <nav id="primary-navigation" className={`${styles.links} ${isOpen ? styles.linksOpen : ""}`} aria-label={text(locale, "Main navigation", "Navigazione principale")}>
          {navigationLinks.map(({ href, label }, index) => {
            const active = publicPath === href || publicPath.startsWith(`${href}/`) || (href === "/shop" && publicPath.startsWith("/products/"));
            return (
              <Link key={href} href={localePath(href, locale)} className={styles.navLink} aria-current={active ? "page" : undefined} onClick={() => setOpenPath(null)}>
                <span className={styles.linkNumber} aria-hidden="true">0{index + 1}</span>
                {text(locale, label, href === "/shop" ? "Collezione" : href === "/how-to-order" ? "Come ordinare" : "Scrivici")}
                <span className={styles.mobileArrow} aria-hidden="true">↗</span>
              </Link>
            );
          })}
          <p className={styles.menuNote}>{text(locale, "A few lovely things, waiting to find a home.", "Piccole meraviglie in attesa di una casa.")}</p>
        </nav>

        <div className={styles.actions}>
          <Suspense fallback={<span className={styles.languagePlaceholder} aria-hidden="true"><LanguageFlag locale={locale} className={styles.languageFlag} /><span className={styles.languageName}>{locale === "it" ? "Italiano" : "English"}</span></span>}><LanguageSwitcher /></Suspense>
          <button type="button" className={styles.cart} aria-haspopup="dialog" aria-label={text(locale, `Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`, `Selezione, ${cartCount} ${cartCount === 1 ? "creazione" : "creazioni"}`)} onClick={() => { setOpenPath(null); openCart(); }}>
            <BasketIcon />
            <span>{text(locale, "Cart", "Selezione")}</span>
            <span key={additionCount} className={`${styles.cartCount} ${additionCount > 0 ? styles.cartCountAdded : ""}`}>{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { localePath, text, type Locale } from "@/lib/locale";
import { useLocale } from "./LocaleContext";
import LanguageFlag from "./LanguageFlag";
import styles from "./Navbar.module.css";

const languages: { locale: Locale; label: string }[] = [
  { locale: "en", label: "English" },
  { locale: "it", label: "Italiano" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [open, setOpen] = useState(false);
  const control = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuId = useId();
  const label = locale === "it" ? "Italiano" : "English";

  useEffect(() => {
    if (!open) return;
    options.current[locale === "it" ? 1 : 0]?.focus({ preventScroll: true });
    function dismiss(event: Event) {
      if (event.target instanceof Node && !control.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
    };
  }, [open, locale]);

  function close() { setOpen(false); trigger.current?.focus({ preventScroll: true }); }

  return <div ref={control} className={styles.languageControl}>
    <button ref={trigger} type="button" className={styles.languageButton}
      aria-label={text(locale, `Website language: ${label}`, `Lingua del sito: ${label}`)}
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
      onClick={() => setOpen(value => !value)}
      onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); }
        if (event.key === "Escape" && open) { event.preventDefault(); close(); }
      }}>
      <LanguageFlag locale={locale} className={styles.languageFlag} />
      <span className={styles.languageName}>{label}</span>
      <svg className={styles.languageChevron} viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
    </button>
    {open && <ul id={menuId} role="menu" className={styles.languageMenu} aria-label={text(locale, "Choose a language", "Scegli una lingua")}
      onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); return; }
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const current = options.current.findIndex(option => option === document.activeElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : (Math.max(0, current) + (event.key === "ArrowDown" ? 1 : -1) + 2) % 2;
        options.current[next]?.focus({ preventScroll: true });
      }}>
      {languages.map(({ locale: language, label: optionLabel }, index) => {
        const href = localePath(pathname, language) + (search ? `?${search}` : "");
        return <li key={language} role="none"><a ref={element => { options.current[index] = element; }}
          href={href} lang={language} hrefLang={language} role="menuitemradio" aria-checked={language === locale} tabIndex={-1}
          onClick={event => {
            setOpen(false);
            // Resolve English rewrites with a document request instead of
            // reusing the previous locale's client-side route tree.
            event.currentTarget.href = href + window.location.hash;
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            if (language === locale) { event.preventDefault(); trigger.current?.focus(); return; }
          }}>
          <LanguageFlag locale={language} className={styles.languageFlag} /><span>{optionLabel}</span>
          {language === locale && <span className={styles.languageCheck} aria-hidden="true">✓</span>}
        </a></li>;
      })}
    </ul>}
  </div>;
}

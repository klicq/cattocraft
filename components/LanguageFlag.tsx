import type { Locale } from "@/lib/locale";

export default function LanguageFlag({ locale, className }: { locale: Locale; className?: string }) {
  return <svg viewBox="0 0 24 16" className={className} aria-hidden="true" focusable="false">
    {locale === "it" ? <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="8" height="16" fill="#009246" />
      <rect x="16" width="8" height="16" fill="#ce2b37" />
    </> : <>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 24 16M24 0 0 16" stroke="#c8102e" strokeWidth="1.5" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="6" />
      <path d="M12 0v16M0 8h24" stroke="#c8102e" strokeWidth="3" />
    </>}
  </svg>;
}

import type { SVGProps } from "react";

type MarkProps = SVGProps<SVGSVGElement>;

export function PawPrint(props: MarkProps) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" {...props}>
      <ellipse cx="7" cy="12" rx="3.1" ry="4.2" transform="rotate(-28 7 12)" />
      <ellipse cx="13" cy="7" rx="3" ry="4.2" transform="rotate(-8 13 7)" />
      <ellipse cx="21" cy="8" rx="3" ry="4.2" transform="rotate(14 21 8)" />
      <ellipse cx="26" cy="14" rx="3" ry="4" transform="rotate(32 26 14)" />
      <path d="M8 24c-1-4 3-5 5-9 2-3 5-3 7 1 2 3 6 5 4 9-2 4-5 1-8 1s-6 3-8-2Z" />
    </svg>
  );
}

export function CatSeal(props: MarkProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <path d="M52 35c0 13-8 22-21 22S10 48 10 35l2-22 14 10c4-1 8-1 12 0l13-11 1 23Z" fill="currentColor" />
      <g stroke="var(--color-warm-ivory)" strokeWidth="1.8" strokeLinecap="round">
        <path d="m20 34 4 2 4-2m8 0 4 2 4-2M30 41l2 2 2-2m-2 2v3m0 0c-2 2-4 2-6 0m6 0c2 2 4 2 6 0M8 39l10 2M7 45l11-1m29-3 10-2m-10 5 11 1" />
      </g>
    </svg>
  );
}

export function BasketIcon(props: MarkProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m8 11 6-7 6 7M3 11h22l-3 13H6L3 11Zm7 4 1 5m7-5-1 5m-3-5v5" />
    </svg>
  );
}

export function Sparkle(props: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" {...props}>
      <path d="M12 2c0 7-3 10-10 10 7 0 10 3 10 10 0-7 3-10 10-10-7 0-10-3-10-10Z" />
    </svg>
  );
}

export function SleepingCat(props: MarkProps) {
  return (
    <svg viewBox="0 0 300 155" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M24 131c68-3 157 2 252-1M82 119c-9-29 12-65 52-67 37-2 71 22 68 56m-82 9c16 3 23-3 27-13" />
      <path d="M89 78 80 57 64 74c-8-1-15 0-22 3L25 66l3 30c-2 21 11 30 33 29 21 0 38-11 33-29l-5-18Z" />
      <path d="m39 98 5 3 5-3m18-1 5 3 5-4m-20 11 3 2 3-2m-3 2v4m0 0c-3 3-6 2-8 1m8-1c3 3 6 2 8 0M19 103l15 3m-15 7 15-2m47-7 15-3m-14 11 15 2" />
      <path d="M141 118c23 8 59 12 81-4 26-20 13-50-5-40-13 7 6 22-7 32-11 9-29 9-43 4" strokeWidth="6" />
      <path d="m120 28 11-2-8 12 12-2m15-29 14-2-11 16 15-2M253 98l3-9 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" strokeWidth="1.5" />
    </svg>
  );
}

export function EnvelopeCat(props: MarkProps) {
  return (
    <svg viewBox="0 0 320 230" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M22 185c83 5 191 6 274 0" opacity=".45" />
      <path d="M96 88c-3-24 18-43 45-41l15-24 12 25c16 5 28 18 29 40" />
      <path d="M103 86 87 64l-4 38c-8 8-12 18-11 30 1 23 20 38 48 38 20 0 34-7 43-20" />
      <path d="m101 114 8 4 8-4m27 0 8 4 8-4m-38 14 4 3 4-3m-4 3v4m0 0c-3 3-7 3-10 1m10-1c3 2 7 2 10-1m-64-4 27 4m-25 8 24-2m56-7 24-4m-24 12 25 2" />
      <path d="M55 161c-12 3-17 18-4 22 12 4 20-12 16-18m113-49c9-13 27-19 34-7 7 12-6 22-18 27" />
      <rect x="157" y="92" width="121" height="82" rx="5" fill="var(--color-pale-peach)" />
      <path d="m160 97 55 43c4 3 7 3 11 0l49-43m-115 73 39-34m76 34-37-34" />
      <path d="M215 124c5-7 17-1 8 7l-6 5-6-5c-8-8 1-14 4-7Z" fill="var(--color-deep-terracotta)" stroke="none" />
      <path d="m44 72 2-8 2 8 8 2-8 2-2 8-2-8-8-2 8-2Zm215-35 2-8 2 8 8 2-8 2-2 8-2-8-8-2 8-2Z" />
    </svg>
  );
}

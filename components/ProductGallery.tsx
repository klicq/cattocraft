"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { ProductImage } from "@/lib/products";
import { Sparkle } from "./StudioMarks";
import { text } from "@/lib/locale";
import { useLocale } from "./LocaleContext";
import styles from "./ProductGallery.module.css";

// Mount only after inspection is requested, so the original stays out of the initial download.
function ZoomPhotograph({ image }: { image: ProductImage }) {
  const locale = useLocale();
  const t = (en: string, it: string) => text(locale, en, it);
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0, density: 1 });
  const [enlarged, setEnlarged] = useState(false);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () => setBounds({ width: element.clientWidth, height: element.clientHeight, density: window.devicePixelRatio || 1 });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fitScale = Math.min(bounds.width / image.width, bounds.height / image.height, 1);
  const fitWidth = Math.floor(image.width * fitScale);
  const fitHeight = Math.floor(image.height * fitScale);
  // Limit magnification to the pixels actually available on this screen.
  const detailScale = fitScale > 0 ? Math.max(1, Math.min(2, 1 / (fitScale * bounds.density))) : 2;
  const scale = enlarged ? detailScale : 1;
  const detailLabel = t(`${Number(detailScale.toFixed(1))}× detail`, `${Number(detailScale.toFixed(1)).toLocaleString("it")}× dettagli`);

  function changeZoom(value: boolean) {
    setEnlarged(value);
    const element = viewport.current;
    if (!element) return;
    const targetScale = value ? detailScale : 1;
    requestAnimationFrame(() => {
      element.scrollLeft = Math.max(0, (fitWidth * targetScale - element.clientWidth) / 2);
      element.scrollTop = Math.max(0, (fitHeight * targetScale - element.clientHeight) / 2);
    });
  }

  return <>
    <div className={styles.zoomToolbar} role="group" aria-label={t("Photograph magnification", "Ingrandimento della fotografia")}>
      <button type="button" aria-pressed={!enlarged} onClick={() => changeZoom(false)}>{t("Full piece", "Vista completa")}</button>
      <button type="button" aria-pressed={enlarged} onClick={() => changeZoom(true)} disabled={detailScale <= 1}>{t("Inspect", "Esplora")} · {detailLabel}</button>
    </div>
    <div ref={viewport} className={styles.zoomViewport} data-enlarged={enlarged} role="region" aria-label={t("Product photograph. Use arrow keys to scroll when enlarged.", "Fotografia dell’articolo. Usa i tasti freccia per spostarti nella vista ingrandita.")} tabIndex={0}
      onPointerDown={(event) => {
        if (!enlarged || event.pointerType !== "mouse" || event.button !== 0) return;
        drag.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        event.currentTarget.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
        event.currentTarget.scrollTop = drag.current.top - (event.clientY - drag.current.y);
      }}
      onPointerUp={() => { drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}>
      <div className={styles.zoomCanvas} style={{ width: Math.max(bounds.width, fitWidth * scale), height: Math.max(bounds.height, fitHeight * scale) }}>
        {fitWidth > 0 && <Image src={image.src} alt={image.alt} width={image.width} height={image.height} unoptimized loading="eager" draggable={false}
          placeholder={image.blurDataURL ? "blur" : "empty"} blurDataURL={image.blurDataURL}
          className={styles.fullImage} style={{ width: fitWidth * scale, height: fitHeight * scale }} />}
      </div>
    </div>
    <p className={styles.zoomHint} aria-live="polite">{enlarged ? t("Scroll or drag to explore the little details. On a touch screen, swipe across the photograph.", "Scorri o trascina per scoprire i piccoli dettagli. Su uno schermo touch, fai scorrere il dito sulla fotografia.") : t("The whole little personality. Choose Inspect for a closer look.", "Tutta la sua piccola personalità. Scegli Esplora per guardarla più da vicino.")}</p>
  </>;
}

export default function ProductGallery({ images, name, note, modelSlot }: {
  images: ProductImage[]; name: string; note: string;
  // Future dynamically imported 3D viewers use the same focal stage.
  modelSlot?: ReactNode;
}) {
  const locale = useLocale();
  const t = (en: string, it: string) => text(locale, en, it);
  const orderedImages = [...images].sort((a, b) => a.order - b.order);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<"photo" | "model">("photo");
  const [zoomOpen, setZoomOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialogTitle = useId();
  const active = orderedImages[activeIndex];

  useEffect(() => {
    const element = dialog.current;
    if (!zoomOpen || !element) return;
    if (!element.open) element.showModal();
    const previousOverflow = document.body.style.overflow;
    const opener = trigger.current;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (element.open) element.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [zoomOpen]);

  return (
    <section className={styles.gallery} aria-label={t(`${name} gallery`, `Galleria di ${name}`)}>
      <div className={styles.stage} data-media-stage>
        <div className={styles.stageHeader}><span>{t("THE STUDIO / UP CLOSE", "LO STUDIO / DA VICINO")}</span><Sparkle /></div>
        <div className={styles.media}>
          {mode === "model" && modelSlot ? modelSlot : active ? (
            <button ref={trigger} type="button" className={styles.photoButton} aria-label={t(`Inspect ${name} in a larger photograph`, `Guarda ${name} in una fotografia più grande`)} aria-haspopup="dialog" onClick={() => setZoomOpen(true)}>
              <Image key={active.src} src={active.src} alt={active.alt} width={active.width} height={active.height} quality={85}
                placeholder={active.blurDataURL ? "blur" : "empty"} blurDataURL={active.blurDataURL}
                sizes="(max-width: 760px) min(82vw, 260px), (max-width: 1400px) 40vw, 520px" loading="eager" fetchPriority="high" className={styles.photo} />
              <span className={styles.enlarge}><span aria-hidden="true">⌕</span> {t("A closer look", "Uno sguardo più vicino")}</span>
            </button>
          ) : <p>{t("Our studio photo is on its way.", "La fotografia dello studio sta arrivando.")}</p>}
        </div>
        <p className={styles.handwritten}>{note}<span aria-hidden="true"> ↗</span></p>
      </div>

      <div className={styles.galleryCaption}><span>{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")} · {t("Studio view", "Foto dello studio")}</span><span>{t("A little closer. A little lovelier.", "Più vicino. Ancora più delizioso.")}</span></div>
      {(orderedImages.length > 1 || modelSlot) && <div className={styles.thumbnails} aria-label={t("Choose a product view", "Scegli una vista dell’articolo")}>
        {orderedImages.map((image, index) => <button key={image.src} type="button" aria-label={t(`Show photo ${index + 1}`, `Mostra la foto ${index + 1}`)} aria-pressed={mode === "photo" && index === activeIndex} onClick={() => { setMode("photo"); setActiveIndex(index); }}>
          <Image src={image.card?.src ?? image.src} alt="" width={70} height={54} sizes="70px" />
        </button>)}
        {modelSlot && <button type="button" className={styles.modelTab} aria-pressed={mode === "model"} onClick={() => setMode("model")}>{t("Explore in 3D", "Esplora in 3D")}</button>}
      </div>}

      <dialog ref={dialog} className={styles.lightbox} aria-labelledby={dialogTitle}
        onCancel={(event) => { event.preventDefault(); setZoomOpen(false); }}
        onClick={(event) => { if (event.target === event.currentTarget) setZoomOpen(false); }}>
        <div className={styles.lightboxContent}>
          <header><div><span className={styles.lightboxEyebrow}>{t("A LITTLE CLOSER", "UN PO’ PIÙ VICINO")}</span><h2 id={dialogTitle}>{name}</h2></div><button type="button" aria-label={t("Close full image", "Chiudi l’immagine ingrandita")} onClick={() => setZoomOpen(false)}>×</button></header>
          {zoomOpen && active && <ZoomPhotograph key={active.src} image={active} />}
        </div>
      </dialog>
    </section>
  );
}

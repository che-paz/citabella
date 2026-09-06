"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  images: string[];
};

export function VitrinaPortfolioGallery({ images }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => setActive(null), []);

  const showPrev = useCallback(() => {
    setActive((i) =>
      i === null ? null : (i - 1 + images.length) % images.length
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    setActive((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (active === null) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }

    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, showPrev, showNext]);

  const lightbox =
    mounted && active !== null
      ? createPortal(
          <div
            className="vitrina-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Foto ampliada"
          >
            <button
              type="button"
              className="vitrina-lightbox-backdrop"
              aria-label="Cerrar foto"
              onClick={close}
            />

            <div className="vitrina-lightbox-sheet">
              <header className="vitrina-lightbox-toolbar">
                <p className="vitrina-lightbox-count">
                  {active + 1} / {images.length}
                </p>
                <button
                  type="button"
                  className="vitrina-lightbox-close"
                  onClick={close}
                  aria-label="Cerrar"
                >
                  Cerrar
                </button>
              </header>

              <div className="vitrina-lightbox-scroll">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[active]}
                  alt={`Trabajo ${active + 1}`}
                  className="vitrina-lightbox-img"
                />
              </div>

              {images.length > 1 ? (
                <footer className="vitrina-lightbox-footer">
                  <button
                    type="button"
                    className="vitrina-lightbox-nav"
                    onClick={showPrev}
                    aria-label="Anterior"
                  >
                    ‹ Anterior
                  </button>
                  <button
                    type="button"
                    className="vitrina-lightbox-nav"
                    onClick={showNext}
                    aria-label="Siguiente"
                  >
                    Siguiente ›
                  </button>
                </footer>
              ) : null}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="vitrina-portfolio" role="list">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            className="vitrina-portfolio-photo"
            role="listitem"
            onClick={() => setActive(index)}
            aria-label={`Ampliar trabajo ${index + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Trabajo ${index + 1}`} />
          </button>
        ))}
      </div>
      {lightbox}
    </>
  );
}

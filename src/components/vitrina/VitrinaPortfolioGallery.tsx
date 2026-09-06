"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  images: string[];
};

export function VitrinaPortfolioGallery({ images }: Props) {
  const [active, setActive] = useState<number | null>(null);

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

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, showPrev, showNext]);

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

      {active !== null ? (
        <div
          className="vitrina-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          onClick={close}
        >
          <button
            type="button"
            className="vitrina-lightbox-close"
            onClick={close}
            aria-label="Cerrar"
          >
            ×
          </button>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                className="vitrina-lightbox-nav vitrina-lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className="vitrina-lightbox-nav vitrina-lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Siguiente"
              >
                ›
              </button>
            </>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={`Trabajo ${active + 1}`}
            className="vitrina-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}

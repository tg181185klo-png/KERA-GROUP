"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PhotoGalleryProps {
  images: string[];
  title: string;
  closeLabel: string;
}

export function PhotoGallery({ images, title, closeLabel }: PhotoGalleryProps) {
  const [active, setActive] = useState<number | null>(null);
  const open = active != null;

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") {
        setActive((current) =>
          current == null ? 0 : (current + 1) % images.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setActive((current) =>
          current == null ? 0 : (current - 1 + images.length) % images.length,
        );
      }
    }

    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [images.length, open]);

  function show(index: number) {
    setActive((index + images.length) % images.length);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setActive(0)}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100"
      >
        <Image
          src={images[0]}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </button>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.slice(1).map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActive(index + 1)}
              className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"
            >
              <Image
                src={src}
                alt={`${title} ${index + 2}`}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white"
            aria-label={closeLabel}
          >
            <X className="h-5 w-5" />
          </button>
          <p className="absolute left-4 top-4 text-sm font-medium text-white">
            {active + 1} / {images.length}
          </p>

          {images.length > 1 && (
            <button
              type="button"
              onClick={() => show(active - 1)}
              className="absolute left-3 rounded-full bg-white/15 p-2 text-white sm:left-6"
              aria-label="წინა ფოტო"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={`${title} ${active + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={() => show(active + 1)}
              className="absolute right-3 rounded-full bg-white/15 p-2 text-white sm:right-6"
              aria-label="შემდეგი ფოტო"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}

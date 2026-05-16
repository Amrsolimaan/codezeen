'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { urlFor } from '@/sanity/lib/image';

interface GalleryImage {
  _key?: string | null;
  asset?: {
    _id: string;
    url?: string | null;
    metadata?: { lqip?: string | null } | null;
  } | null;
  alt?: string | null;
  caption?: string | null;
}

interface ProjectGalleryLightboxProps {
  images: GalleryImage[];
  galleryLabel: string;
  closeLabel: string;
}

export function ProjectGalleryLightbox({
  images,
  galleryLabel,
  closeLabel,
}: ProjectGalleryLightboxProps) {
  const [open, setOpen] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight')
        setOpen((p) => (p !== null && p < images.length - 1 ? p + 1 : p));
      if (e.key === 'ArrowLeft') setOpen((p) => (p !== null && p > 0 ? p - 1 : p));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, images.length]);

  // Lock scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = open !== null ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // GSAP clip-path reveal per item
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || images.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = container.querySelectorAll<HTMLDivElement>('[data-gallery-item]');

    const ctx = gsap.context(() => {
      items.forEach((item) => {
        if (prefersReducedMotion) {
          gsap.set(item, { clipPath: 'inset(0 0% 0 0)', opacity: 1 });
          return;
        }
        gsap.fromTo(
          item,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
          {
            clipPath: 'inset(0 0% 0 0)',
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 88%', once: true },
          },
        );
      });
    }, container);

    return () => ctx.revert();
  }, [images]);

  const activeImage = open !== null ? images[open] : null;

  if (images.length === 0) return null;

  return (
    <>
      <div
        ref={containerRef}
        className="columns-1 gap-3 sm:columns-2"
        role="list"
        aria-label={galleryLabel}
      >
        {images.map((img, i) => {
          if (!img.asset) return null;
          const src = urlFor(img).width(900).url();
          const blur = img.asset.metadata?.lqip ?? undefined;

          return (
            <div
              key={img._key ?? i}
              data-gallery-item=""
              role="listitem"
              className="mb-3 break-inside-avoid overflow-hidden rounded-xl"
            >
              <button
                type="button"
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl"
                onClick={() => setOpen(i)}
                aria-label={img.alt ?? `Gallery image ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={img.alt ?? `Gallery image ${i + 1}`}
                  width={900}
                  height={600}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  loading="lazy"
                  placeholder={blur ? 'blur' : 'empty'}
                  blurDataURL={blur}
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent px-4 py-4 transition-transform duration-300 group-hover:translate-y-0">
                    <p className="text-xs text-white/80">{img.caption}</p>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {open !== null && activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={galleryLabel}
          onClick={() => setOpen(null)}
        >
          {/* Close */}
          <button
            type="button"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            onClick={() => setOpen(null)}
            aria-label={closeLabel}
          >
            <X size={18} aria-hidden="true" />
          </button>

          {/* Prev */}
          {open > 0 && (
            <button
              type="button"
              className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(open - 1);
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
          )}

          {/* Next */}
          {open < images.length - 1 && (
            <button
              type="button"
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(open + 1);
              }}
              aria-label="Next image"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          )}

          {/* Image container */}
          <div
            className="relative mx-16 max-h-[85vh] max-w-[min(90vw,1400px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={urlFor(activeImage).width(1600).url()}
              alt={activeImage.alt ?? `Image ${open + 1}`}
              width={1600}
              height={1000}
              className="max-h-[85vh] w-auto object-contain"
              priority
            />
            {activeImage.caption && (
              <p className="mt-3 text-center text-sm text-white/60">{activeImage.caption}</p>
            )}
          </div>

          {/* Counter */}
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-xs tabular-nums text-white/40">
            {open + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}

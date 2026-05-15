'use client';

import { useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { urlFor } from '@/sanity/lib/image';

interface GalleryImage {
  _key?: string | null;
  asset: {
    _id: string;
    url?: string | null;
    metadata?: { lqip?: string | null } | null;
  };
  alt?: string | null;
  caption?: string | null;
  hotspot?: { x: number; y: number } | null;
}

interface GalleryRevealProps {
  images: GalleryImage[];
}

export function GalleryReveal({ images }: GalleryRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || images.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const items = container.querySelectorAll<HTMLDivElement>('[data-gallery-item]');

    const ctx = gsap.context(() => {
      items.forEach((item) => {
        if (prefersReducedMotion) {
          gsap.set(item, { clipPath: 'inset(0 0% 0 0)' });
          return;
        }

        gsap.fromTo(
          item,
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 88%',
              once: true,
            },
          },
        );
      });
    }, container);

    return () => ctx.revert();
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="columns-1 gap-4 sm:columns-2 lg:columns-3"
    >
      {images.map((image, index) => {
        const src = urlFor(image).width(900).url();
        const blur = image.asset?.metadata?.lqip ?? undefined;

        return (
          <div
            key={image._key ?? index}
            data-gallery-item=""
            className="mb-4 overflow-hidden break-inside-avoid"
          >
            <Image
              src={src}
              alt={image.alt ?? `Gallery image ${index + 1}`}
              width={900}
              height={600}
              className="w-full object-cover"
              loading="lazy"
              placeholder={blur ? 'blur' : 'empty'}
              blurDataURL={blur}
            />
            {image.caption && (
              <p className="mt-1.5 text-xs text-[var(--color-text-3)]">{image.caption}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

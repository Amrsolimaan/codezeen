'use client';

import { useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

interface ParallaxImageProps {
  /** Image src URL (already resolved from Sanity urlFor) */
  src: string;
  /** Accessible alt text */
  alt: string;
  /** Additional class on the outer overflow-hidden container */
  className?: string;
  /** next/image sizes hint */
  sizes?: string;
}

export function ParallaxImage({ src, alt, className, sizes }: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef     = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const inner     = innerRef.current;
    if (!container || !inner) return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        },
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    // overflow-hidden clips the image during parallax movement
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/*
        Inner wrapper maintains aspect ratio without extra height.
        Parallax effect is subtle to avoid cropping.
      */}
      <div
        ref={innerRef}
        className="relative h-full w-full"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes ?? '(max-width: 768px) 100vw, 42vw'}
          quality={90}
        />
      </div>
    </div>
  );
}

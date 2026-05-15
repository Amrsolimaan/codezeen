'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { gsap } from 'gsap';

interface ProjectPortalHoverProps {
  src: string;
  alt: string;
  children: ReactNode;
  className?: string;
}

export function ProjectPortalHover({
  src,
  alt,
  children,
  className,
}: ProjectPortalHoverProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    setIsPointerFine(fine);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isPointerFine) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const trigger = triggerRef.current;
    const portal = portalRef.current;
    if (!trigger || !portal) return;

    gsap.set(portal, {
      opacity: 0,
      scale: 0.92,
      clipPath: 'polygon(5% 0%, 96% 2%, 95% 96%, 4% 98%)',
    });

    const handleMouseMove = (e: MouseEvent) => {
      const x = Math.min(e.clientX + 24, window.innerWidth - 220);
      const y = Math.max(8, Math.min(e.clientY - 144, window.innerHeight - 296));
      gsap.set(portal, { x, y });
    };

    const handleMouseEnter = () => {
      gsap.to(portal, {
        opacity: 1,
        scale: 1,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 0.5,
        ease: 'power3.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(portal, {
        opacity: 0,
        scale: 0.92,
        clipPath: 'polygon(5% 0%, 96% 2%, 95% 96%, 4% 98%)',
        duration: 0.35,
        ease: 'power2.in',
      });
    };

    trigger.addEventListener('mouseenter', handleMouseEnter);
    trigger.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      trigger.removeEventListener('mouseenter', handleMouseEnter);
      trigger.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mounted, isPointerFine]);

  return (
    <div ref={triggerRef} className={className}>
      {children}
      {mounted &&
        isPointerFine &&
        createPortal(
          <div
            ref={portalRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-[9998] h-72 w-52 overflow-hidden"
          >
            <Image src={src} alt={alt} fill className="object-cover" sizes="208px" />
          </div>,
          document.body,
        )}
    </div>
  );
}

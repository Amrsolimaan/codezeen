# CODEZEEN — Animation System (2026 Edition)

> Every animation here is chosen because it is NOT commonly seen on agency websites.
> All must respect `prefers-reduced-motion`. All must be GPU-accelerated (transform/opacity only).

---

## Stack Decision (from research, May 2026)

| Library | Use For |
|---------|---------|
| **GSAP** | Scroll-driven, timelines, SVG morph, complex sequences (60fps even at 50+ elements) |
| **Motion (Framer Motion v12)** | Page transitions, React component animations, layout animations |
| **Lenis** | Smooth scroll — replaces all native scroll events |
| **CSS** | Simple hover states, loading spinners — no library needed |

---

## Animation 1: SplitText Kinetic Reveal

**File:** `components/animations/SplitText.tsx`
**Used in:** Hero headline, section titles

**What it does:**
Each word (not letter) has a different `y` offset and `velocity`. Words closer to the center arrive
faster. Creates an organic, editorial feeling — NOT the typical "each letter bounces in".

**How to build:**
```tsx
// Use GSAP SplitText plugin (Club GSAP free for local dev)
// OR manual split: wrap each word in a span, set initial transform
// Stagger: NOT uniform — use custom stagger array based on position

gsap.from(wordSpans, {
  y: (i) => 40 + (i % 3) * 20,     // different offsets per word
  opacity: 0,
  duration: 0.8,
  ease: "power3.out",
  stagger: {
    each: 0.05,
    from: "center",                  // center-out, not left-to-right
  },
  scrollTrigger: { ... }
})
```

**Reduced motion fallback:** `opacity: 0 → 1` only, no transform.

---

## Animation 2: LiquidCursor

**File:** `components/animations/LiquidCursor.tsx`
**Used in:** Global — wraps entire app

**What it does:**
A custom cursor that:
1. Follows mouse with spring lag (feels heavy/liquid)
2. When hovering a link/button: morphs shape (circle → pill) + shows text label
3. Leaves a short trail that fades (not a persistent trail — just 3 frames)

**Key technique — spring physics:**
```tsx
// NOT: cursor.style.left = e.clientX  ← teleports, robotic
// YES: lerp on every frame
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// On RAF:
cursorX = lerp(cursorX, mouseX, 0.12);  // 0.12 = spring tension
cursorY = lerp(cursorY, mouseY, 0.12);
```

**Hover state — morphing shape:**
```css
/* Default */
.cursor { width: 12px; height: 12px; border-radius: 50%; }

/* On hoverable element */
.cursor.is-hovering {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: rgba(55,138,221,0.15);
  border: 1px solid rgba(55,138,221,0.4);
  /* Show text inside: "View" / "Open" / "Read" */
}
```

**Hide on mobile/touch:** `@media (pointer: coarse) { .cursor { display: none } }`

---

## Animation 3: MagneticElement

**File:** `components/animations/MagneticElement.tsx`
**Used in:** CTA buttons, social icons in footer

**What it does:**
Element "pulls" toward the cursor when mouse is within 80px radius.
On leave: elastic snap-back.

**Core math:**
```tsx
const handleMouseMove = (e: MouseEvent) => {
  const rect = el.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const distX = e.clientX - centerX;
  const distY = e.clientY - centerY;
  const distance = Math.sqrt(distX ** 2 + distY ** 2);
  
  if (distance < 80) {
    const pull = 0.35;  // strength: 0=none, 1=full follow
    gsap.to(el, {
      x: distX * pull,
      y: distY * pull,
      duration: 0.4,
      ease: "power2.out",
    });
  }
};

const handleMouseLeave = () => {
  gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
};
```

---

## Animation 4: ScrollVelocityTilt

**File:** `components/animations/ScrollReveal.tsx`
**Used in:** Project cards in /work page

**What it does:**
Cards tilt on their X axis based on scroll VELOCITY, not scroll position.
Fast scroll = more tilt. Slow scroll = flat.
This is genuinely rare — most sites tilt based on position, not velocity.

**Core technique:**
```tsx
let lastScrollY = 0;
let velocity = 0;

const updateVelocity = () => {
  velocity = window.scrollY - lastScrollY;
  lastScrollY = window.scrollY;
  
  cards.forEach(card => {
    gsap.to(card, {
      rotateX: Math.max(-8, Math.min(8, velocity * 0.5)),
      duration: 0.3,
      ease: "power2.out",
    });
  });
};
```

---

## Animation 5: ProjectPortalHover

**File:** `components/animations/ProjectPortalHover.tsx`
**Used in:** Project list items on /work page

**What it does:**
When hovering a project title text, a preview window appears near the cursor.
The window has an organic, NON-rectangular border (SVG clip-path that morphs).
The preview shows the project image with a parallax offset.

**What makes it unique:**
- Border is NOT a rectangle or rounded rectangle
- It's an SVG path that morphs between two organic shapes
- The image inside has a subtle parallax as the cursor moves

**Implementation:**
```tsx
// The morphing border:
const shape1 = "M20,0 L280,5 L290,200 L10,195 Z";  // slight trapezoid
const shape2 = "M10,5 L285,0 L295,195 L5,200 Z";    // slightly different

// On hover-enter: morph to shape1
// While hovering: oscillate slowly between shape1 and shape2 (organic feel)
// On hover-leave: scale down and fade
```

---

## Animation 6: ParticleGrid (Hero Background)

**File:** `components/animations/ParticleGrid.tsx`
**Used in:** Hero section background only

**What it does:**
A grid of dots. Each dot:
1. Pulses slightly with a staggered timing (like breathing)
2. When cursor is within 120px: repels away
3. When cursor leaves: slowly returns (spring)
4. Color shifts between `--color-accent` and `--color-accent-2` based on proximity

**Performance notes:**
- Use `<canvas>` NOT DOM elements (100+ DOM nodes = death)
- requestAnimationFrame loop
- Only render if `!prefersReducedMotion` AND `window.innerWidth > 768`
- On mobile: static gradient background instead

**Canvas approach:**
```ts
// Grid of points
const points = [];
for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    points.push({
      baseX: x * spacing,
      baseY: y * spacing,
      x: x * spacing,
      y: y * spacing,
      vx: 0,
      vy: 0,
    });
  }
}

// Each frame:
// 1. Calculate mouse repulsion for nearby points
// 2. Apply spring force toward base position
// 3. Update position
// 4. Draw dot with color based on distance from cursor
```

---

## Page Transition System

**File:** `components/layout/PageTransitionWrapper.tsx`
**Library:** Motion (Framer Motion)

```tsx
// Pattern: Slide + Fade, direction based on navigation
// Going deeper (/work → /work/slug): slide LEFT
// Going back: slide RIGHT
// Different pages: fade only

const variants = {
  initial: { opacity: 0, y: 20 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.25 } },
};
```

---

## Scroll Reveal (Default — Used Everywhere)

**Pattern:** Every section that enters the viewport fades + slides up.
**NOT uniform:** stagger timing varies per section type.

```tsx
// Section enters: parent animates, children stagger
// Use Motion's `whileInView` for simple cases
// Use GSAP ScrollTrigger for complex/sequenced cases

// Simple case (Motion):
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>

// Complex case (GSAP):
gsap.from(elements, {
  y: 60,
  opacity: 0,
  stagger: 0.12,
  duration: 0.8,
  ease: "power3.out",
  scrollTrigger: {
    trigger: section,
    start: "top 80%",
    toggleActions: "play none none reverse",
  }
});
```

---

## Reduced Motion — Global Rule

```tsx
// In every animation component:
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
  // Skip all transforms — opacity transition only, max 0.3s
}
```

Also add to `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

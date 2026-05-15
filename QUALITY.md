# CODEZEEN — Production Quality Checklist

> A senior developer will audit this. Every item below must pass before going live.

---

## Performance

### Images
- [ ] ALL images use `<Image>` from `next/image`
- [ ] Every `<Image>` has `width`, `height`, and `alt`
- [ ] Above-fold images: `priority={true}` (no lazy load)
- [ ] Below-fold images: `loading="lazy"` (default in next/image)
- [ ] `placeholder="blur"` + `blurDataURL` on all Sanity images
- [ ] All images served as WebP (Sanity does this automatically)
- [ ] No image wider than its display container

### Fonts
- [ ] Loaded via `next/font/google` (no Google Fonts CDN link)
- [ ] `display: 'swap'` on all fonts
- [ ] Preload only fonts used above-fold

### JavaScript
- [ ] Heavy components lazy-loaded: `dynamic(() => import(...))`
- [ ] `{ ssr: false }` on: LiquidCursor, ParticleGrid, GSAP components
- [ ] GSAP plugins registered only inside `useEffect`
- [ ] Lenis initialized once in root layout, not per-page
- [ ] No unused imports (ESLint `no-unused-vars` must pass)

### Core Web Vitals Targets
- [ ] LCP < 2.5s (test with Lighthouse)
- [ ] CLS = 0 (no layout shifts — reserve space for images)
- [ ] FID < 100ms (no heavy JS on main thread at load)
- [ ] INP < 200ms

---

## SEO

### Metadata (every page)
- [ ] Unique `<title>` — not "Codezeen" on every page
- [ ] Unique `<meta name="description">` — 140-160 chars
- [ ] `og:title`, `og:description`, `og:image` on every page
- [ ] `og:image` is 1200x630px
- [ ] Canonical URL on every page

### Structured Data
- [ ] `Organization` JSON-LD on home page
- [ ] `WebSite` JSON-LD with `SearchAction` on home
- [ ] `Article` JSON-LD on blog posts
- [ ] `BreadcrumbList` on all inner pages

### Technical SEO
- [ ] `sitemap.xml` auto-generated from Next.js `sitemap.ts`
- [ ] `robots.txt` correct (allow all except /studio)
- [ ] `hreflang` tags for en/ar (next-intl handles this)
- [ ] All images have descriptive `alt` text
- [ ] Internal links use `<Link>` not `<a>`
- [ ] No broken links (test before launch)

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- [ ] Full tab order works logically
- [ ] Focus ring visible on all interactive elements
- [ ] Skip-to-content link at top of page
- [ ] Escape closes mobile menu and any modals

### Screen Reader
- [ ] All icons have `aria-hidden="true"` (decorative) or `aria-label`
- [ ] All buttons have descriptive text or `aria-label`
- [ ] Form inputs have associated `<label>`
- [ ] Error messages are `aria-live="polite"`
- [ ] `<nav>` has `aria-label="Main navigation"`
- [ ] Language switcher has `aria-label`

### Color & Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (body) / 3:1 (large text)
- [ ] No information conveyed by color alone
- [ ] Focus indicators not relying on color only

### Animations
- [ ] ALL animations respect `prefers-reduced-motion`
- [ ] No content flashes more than 3 times per second
- [ ] Animations can be paused

---

## Security

### Forms
- [ ] Contact form rate-limited (max 3 submissions per IP per hour)
- [ ] Zod schema validates ALL form inputs server-side too
- [ ] Honeypot field in contact form (anti-spam)
- [ ] CSRF protection (Next.js Server Actions handle this)

### Headers (add to `next.config.ts`)
```ts
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

### Environment Variables
- [ ] NO secrets in client-side code (`NEXT_PUBLIC_` prefix = public)
- [ ] Sanity write token NEVER exposed to client
- [ ] Resend API key server-side only

---

## Code Quality

### TypeScript
- [ ] `strict: true` in `tsconfig.json`
- [ ] No `any` types
- [ ] All Sanity query results have proper types (use `sanity-typed` or codegen)
- [ ] All props interfaces defined

### Component Rules
- [ ] UI components (`/components/ui/`) have no data fetching
- [ ] Section components can fetch but wrap in `<Suspense>`
- [ ] No business logic in page files — delegate to components
- [ ] Every client component has `"use client"` at top
- [ ] No `useEffect` for things that can be done in render

### File Naming
- [ ] Components: `PascalCase.tsx`
- [ ] Utilities: `camelCase.ts`
- [ ] Sanity schemas: `camelCase.ts`
- [ ] Pages: `page.tsx` (Next.js convention)

---

## Responsive Design

### Breakpoints (Tailwind defaults)
- [ ] `sm`: 640px — tablet portrait
- [ ] `md`: 768px — tablet landscape
- [ ] `lg`: 1024px — small desktop
- [ ] `xl`: 1280px — standard desktop
- [ ] `2xl`: 1536px — large desktop

### Test on:
- [ ] iPhone SE (375px) — smallest common mobile
- [ ] iPhone 14 Pro (393px) — most common mobile
- [ ] iPad (768px) — tablet
- [ ] MacBook 13" (1280px) — common laptop
- [ ] 1920px — desktop

### Mobile Specific
- [ ] Touch targets ≥ 44x44px (buttons, links)
- [ ] No horizontal scroll at any width
- [ ] Font sizes readable without zooming (min 16px body)
- [ ] ParticleGrid replaced with static gradient on mobile
- [ ] LiquidCursor hidden on touch devices

---

## i18n (Bilingual EN/AR)

- [ ] ALL user-visible text in `messages/en.json` and `messages/ar.json`
- [ ] NO hardcoded English or Arabic strings in components
- [ ] RTL layout correct: `dir="rtl"` when locale = `ar`
- [ ] Tailwind `rtl:` variants used for directional CSS
- [ ] Icons that imply direction (arrows) flip in RTL
- [ ] Form validation messages translated
- [ ] Number/date formatting uses `useFormatter` from next-intl

---

## Before Launch Checklist

- [ ] All `console.log` removed
- [ ] All `TODO` comments resolved
- [ ] Favicon set (all sizes: 16, 32, 180, 192, 512)
- [ ] `manifest.json` for PWA
- [ ] 404 page (`not-found.tsx`) designed and functional
- [ ] Error boundary (`error.tsx`) designed
- [ ] Vercel Analytics added
- [ ] Sanity webhooks configured for ISR revalidation
- [ ] Domain connected to Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` env var set to production URL
- [ ] Google Search Console verified

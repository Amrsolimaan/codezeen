# CODEZEEN — Build Order & Execution Plan

> Follow this order exactly. Each phase builds on the previous.
> Do NOT jump ahead. A broken foundation = broken everything on top.

---

## Phase 0: Project Setup (You do this manually in terminal)

```bash
cd D:\works\codezeen-web

# Install all dependencies at once:
npm install gsap @gsap/react motion lenis next-intl @sanity/client @sanity/image-url sanity next-sanity react-hook-form @hookform/resolvers zod resend lucide-react clsx tailwind-merge

# Dev dependencies:
npm install -D @sanity/eslint-config-studio
```

Then drop the 4 `.md` files from this folder into:
`D:\works\codezeen-web\` (project root)

These files = the instructions Claude Code will read.

---

## Phase 1: Foundation (Give to Claude Code as Task 1)

**Task prompt to give Claude Code/VS Code extension:**
```
Read CLAUDE.md. Set up the project foundation:
1. Configure tsconfig.json for strict mode
2. Create lib/utils.ts with cn() function
3. Create lib/fonts.ts with Instrument Serif + Inter + Geist Mono
4. Create styles/globals.css with all CSS variables from CLAUDE.md color system
5. Create middleware.ts for next-intl locale detection (en default, ar supported)
6. Create i18n.ts config for next-intl
7. Create messages/en.json and messages/ar.json with placeholder structure
8. Update app/layout.tsx to use fonts and wrap with locale
9. Restructure app/ to use [locale] folder pattern
10. Add security headers to next.config.ts
```

**What you get:** Working bilingual shell with correct TypeScript, fonts, colors.

---

## Phase 2: Sanity CMS Setup (Give to Claude Code as Task 2)

**Task prompt:**
```
Read CLAUDE.md. Set up Sanity CMS:
1. Initialize Sanity in the project (sanity init inside project)
2. Create sanity/schemaTypes/ for: project, service, teamMember, testimonial, blogPost
   - Every text field must have both `en` and `ar` sub-fields
3. Create sanity/lib/client.ts with ISR-ready fetch function using defineLive
4. Create sanity/lib/queries.ts with GROQ queries for all content types
5. Create sanity/lib/image.ts with urlFor helper
6. Create sanity.config.ts in root
7. Create app/studio/[[...tool]]/page.tsx for embedded Studio
8. Add SANITY_PROJECT_ID and SANITY_DATASET to .env.local
```

**What you get:** Full CMS with all content types. You can add real content.

---

## Phase 3: Layout Components (Give to Claude Code as Task 3)

**Task prompt:**
```
Read CLAUDE.md and PAGES.md. Build the layout components:
1. components/layout/Header.tsx
   - Logo placeholder (svg or img)
   - Navigation links (from messages/en.json)
   - Language switcher (EN/AR toggle)
   - "Start Project" CTA button
   - Sticky with scroll-based background change (use Motion scroll)
   - Mobile hamburger with full-screen overlay
   - RTL aware
2. components/layout/Footer.tsx
   - 4-column layout (from PAGES.md footer spec)
   - Collapses on mobile
   - RTL aware
3. Update app/[locale]/layout.tsx to include Header + Footer
```

**What you get:** Every page now has a proper header and footer.

---

## Phase 4: Animation System (Give to Claude Code as Task 4)

**Task prompt:**
```
Read CLAUDE.md and ANIMATIONS.md carefully.
Build these animation components in components/animations/:

1. SplitText.tsx — from ANIMATIONS.md spec, GSAP-based
2. ScrollReveal.tsx — wrapper using Motion whileInView
3. MagneticElement.tsx — from ANIMATIONS.md spec
4. LiquidCursor.tsx — from ANIMATIONS.md spec, "use client", hidden on touch
5. ParticleGrid.tsx — canvas-based, "use client", disabled on mobile + reduced motion
6. TextScramble.tsx — scrambles text characters then resolves to real text on scroll

Important:
- All components: check prefers-reduced-motion first
- LiquidCursor and ParticleGrid: dynamic import with ssr:false in layout
- All components: TypeScript props interface with JSDoc comments
```

**What you get:** The full animation toolkit. Most unique part of the site.

---

## Phase 5: Home Page (Give to Claude Code as Task 5)

**Task prompt:**
```
Read CLAUDE.md, PAGES.md (/ section), and ANIMATIONS.md.
Build the Home page sections in components/sections/:

1. HeroSection.tsx
   - Use ParticleGrid as background
   - SplitText for headline
   - MagneticElement on CTA buttons
   - Bilingual (en/ar) content from messages JSON
   
2. MarqueeStrip.tsx
   - CSS infinite scroll animation
   - Pause on hover
   - Tech names from messages JSON

3. FeaturedWork.tsx
   - Fetch 3 featured projects from Sanity (featured: true)
   - Full-width stacked layout (not grid)
   - Parallax image effect with GSAP ScrollTrigger
   
4. ServicesAccordion.tsx
   - Fetch services from Sanity
   - GSAP-animated accordion (clip-path, not height:auto)
   
5. StatsCounter.tsx
   - Animated number counter on scroll
   - Numbers from messages JSON (so you can update without code)

6. CTASection.tsx
   - Large CTA, surface-2 background

Wire up app/[locale]/page.tsx to use all sections.
Add proper metadata export.
```

**What you get:** Complete, animated home page.

---

## Phase 6: Work Pages (Give to Claude Code as Task 6)

**Task prompt:**
```
Read CLAUDE.md and PAGES.md (/work section).
Build:
1. components/sections/WorkGrid.tsx — Masonry grid with category filters
2. components/sections/WorkList.tsx — List view with ProjectPortalHover
   (build ProjectPortalHover in components/animations/ per ANIMATIONS.md)
3. app/[locale]/work/page.tsx — toggle between grid/list views
4. app/[locale]/work/[slug]/page.tsx — full case study layout
   - generateStaticParams for SSG
   - generateMetadata for dynamic SEO
   - Image gallery with clip-path scroll reveal
```

---

## Phase 7: Remaining Pages (Give to Claude Code as Task 7)

**Task prompt:**
```
Read CLAUDE.md and PAGES.md.
Build remaining pages:
1. app/[locale]/services/page.tsx + components/sections/ServicesDetail.tsx
2. app/[locale]/about/page.tsx + TeamGrid with 3D card flip
3. app/[locale]/blog/page.tsx + BlogGrid
4. app/[locale]/blog/[slug]/page.tsx + PortableText renderer + reading progress bar
5. app/[locale]/contact/page.tsx
   - React Hook Form + Zod validation (see QUALITY.md for field list)
   - API route: app/api/contact/route.ts using Resend
   - Success animation on submit
```

---

## Phase 8: Page Transitions (Give to Claude Code as Task 8)

**Task prompt:**
```
Read ANIMATIONS.md (Page Transition section).
1. Create components/layout/PageTransitionWrapper.tsx using Motion AnimatePresence
2. Wrap app/[locale]/layout.tsx content with it
3. Add Lenis smooth scroll initialization in layout
4. Test that transitions don't break scroll position
```

---

## Phase 9: Quality Pass (Give to Claude Code as Task 9)

**Task prompt:**
```
Read QUALITY.md completely.
Audit the entire project and fix:
1. All TypeScript errors (strict mode)
2. All missing aria-labels and accessibility issues
3. Add JSON-LD structured data to: home, work/[slug], blog/[slug]
4. Create app/sitemap.ts dynamic sitemap
5. Create app/robots.ts
6. Create app/not-found.tsx (styled, not default)
7. Verify all images use next/image with proper props
8. Check all animations have reduced-motion fallbacks
9. Run: npx tsc --noEmit (must be 0 errors)
10. Run: npm run lint (must be 0 errors)
```

---

## Phase 10: Responsive Audit (Give to Claude Code as Task 10)

**Task prompt:**
```
Read QUALITY.md (Responsive Design section).
Check every page and component at these widths: 375px, 768px, 1024px, 1280px.
Fix:
- Any horizontal overflow
- Touch targets smaller than 44x44px
- Font sizes smaller than 14px on mobile
- Any animation that causes jank on mobile
- ParticleGrid: confirm it's replaced by gradient on mobile
- LiquidCursor: confirm hidden on touch devices
```

---

## Deploy

```bash
# 1. Connect to Vercel
npx vercel

# 2. Set environment variables in Vercel dashboard:
SANITY_PROJECT_ID=xxx
SANITY_DATASET=production
SANITY_API_TOKEN=xxx (write token, server only)
RESEND_API_KEY=xxx
NEXT_PUBLIC_SITE_URL=https://codezeen.com

# 3. Configure Sanity webhook for ISR:
#    Sanity Dashboard → API → Webhooks → Add
#    URL: https://codezeen.com/api/revalidate
#    Secret: same as SANITY_REVALIDATE_SECRET env var
```

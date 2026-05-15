# CODEZEEN — Master Project Brief for AI Coding Assistant

> Read this file before touching ANY code. This is the single source of truth.

---

## What is Codezeen?

A full-service software agency website. Target: Arabic & Western clients.
Stack: Next.js 15 App Router + Tailwind CSS v4 + Sanity CMS + GSAP + Motion (Framer) + next-intl.

**North star:** When a senior developer audits this site, they find zero issues.
**Design north star:** When a non-technical person opens it, they say "what company is this?!" in awe.

---

## Strict Rules — Never Break These

1. **TypeScript strict mode** — no `any`, no `@ts-ignore`
2. **No hardcoded content** — all text/images come from Sanity or i18n JSON
3. **No inline styles** — use Tailwind classes only
4. **`"use client"` only when needed** — prefer Server Components
5. **Every animation must respect `prefers-reduced-motion`**
6. **All images through `next/image`** with blur placeholder
7. **RTL support** — `dir="rtl"` when locale is `ar`
8. **Mobile-first** — every component is responsive before being beautiful
9. **Accessibility** — every interactive element has `aria-label`, keyboard-navigable
10. **No magic numbers** — use CSS variables or Tailwind tokens

---

## Tech Stack (Exact Versions)

| Package | Purpose |
|---------|---------|
| `next` (v15) | App Router, SSR, ISR |
| `tailwindcss` (v4) | Styling |
| `gsap` + `@gsap/react` | Scroll animations, complex timelines |
| `motion` (framer-motion v12+) | React component animations, page transitions |
| `lenis` | Smooth scroll |
| `next-intl` | i18n (en + ar), RTL |
| `sanity` + `next-sanity` | CMS — ALL content lives here |
| `@sanity/image-url` | Optimized CMS images |
| `react-hook-form` + `zod` | Contact form |
| `resend` | Email sending from contact form |
| `lucide-react` | Icons |
| `clsx` + `tailwind-merge` | Conditional classes → use `cn()` util |

---

## Project Structure

```
codezeen-web/
├── app/
│   ├── [locale]/                    # i18n root
│   │   ├── layout.tsx               # Root layout with Lenis + Motion
│   │   ├── page.tsx                 # Home
│   │   ├── work/
│   │   │   ├── page.tsx             # All projects
│   │   │   └── [slug]/page.tsx      # Single project
│   │   ├── services/page.tsx
│   │   ├── about/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── contact/page.tsx
│   ├── studio/[[...tool]]/page.tsx  # Sanity Studio embedded
│   └── api/
│       ├── contact/route.ts         # Resend email
│       └── revalidate/route.ts      # Sanity webhook ISR
│
├── components/
│   ├── ui/                          # Dumb, reusable, no data fetching
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── sections/                    # Page sections, can fetch data
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedWork.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── TechStack.tsx
│   │   ├── Testimonials.tsx
│   │   └── CTASection.tsx
│   └── animations/                  # Animation wrappers (see animations.md)
│       ├── SplitText.tsx
│       ├── ScrollReveal.tsx
│       ├── MagneticElement.tsx
│       ├── LiquidCursor.tsx
│       ├── ParticleGrid.tsx
│       └── TextScramble.tsx
│
├── sanity/
│   ├── schemaTypes/                 # Content models
│   │   ├── project.ts
│   │   ├── service.ts
│   │   ├── teamMember.ts
│   │   ├── testimonial.ts
│   │   └── blogPost.ts
│   ├── lib/
│   │   ├── client.ts                # Sanity client with ISR
│   │   ├── queries.ts               # All GROQ queries
│   │   └── image.ts                 # urlFor helper
│   └── sanity.config.ts
│
├── messages/
│   ├── en.json                      # English translations
│   └── ar.json                      # Arabic translations
│
├── lib/
│   ├── utils.ts                     # cn() and helpers
│   └── fonts.ts                     # Instrument Serif + Inter
│
├── styles/
│   └── globals.css                  # CSS variables, base styles
│
├── middleware.ts                    # next-intl locale detection
├── i18n.ts                          # next-intl config
└── sanity.config.ts                 # Sanity project config
```

---

## Dark Mode Decision

- Site is **dark-first by design** — this is a brand decision, not a user preference
- NO light/dark toggle needed
- `color-scheme: dark` in `:root`
- Exception: `/studio` route uses Sanity's default light theme
- Respect `prefers-reduced-motion` always
- Do NOT flip background for `prefers-color-scheme: light` — bg stays dark
- All contrast ratios must pass WCAG AA in dark mode (≥ 4.5:1 for body text)

## Color System (CSS Variables in globals.css)

Colors extracted directly from Codezeen logo gradient (#0A1F6E → #5BA3F5).

```css
:root {
  color-scheme: dark;

  /* Backgrounds */
  --color-bg:          #050D1A;   /* deepest bg — matches logo navy family */
  --color-surface:     #0A1628;   /* card surfaces */
  --color-surface-2:   #0F2040;   /* elevated surfaces, hover states */

  /* Brand — from logo */
  --color-accent:      #3B7DD8;   /* primary blue — extracted from logo gradient */
  --color-logo-dark:   #0A1F6E;   /* logo dark end — footer, deep elements */
  --color-logo-mid:    #1A3FA8;   /* logo mid — hover states, borders */
  --color-accent-2:    #1D9E75;   /* teal — complements blue, NOT in logo */
  --color-accent-glow: rgba(59, 125, 216, 0.15);

  /* Text */
  --color-text-1:      #FFFFFF;   /* headings — pure white */
  --color-text-2:      #8BA8C4;   /* body, secondary */
  --color-text-3:      #4A6580;   /* muted, hints, placeholders */

  /* Borders */
  --color-border:      rgba(59, 125, 216, 0.12);
  --color-border-hover: rgba(59, 125, 216, 0.35);
}

/* Sanity Studio exception — light surface only */
.sanity-light {
  --color-bg:     #F8F9FA;
  --color-text-1: #0A1F6E;
  --color-text-2: #4A5568;
}

/* Respect reduced motion — always */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Typography

- **Display/Hero:** `Instrument Serif` — warm, human, editorial
- **Body/UI:** `Inter` — clean, technical, readable
- **Code:** `Geist Mono`

Load via `next/font/google` in `lib/fonts.ts`.

---

## i18n Structure

URL structure:
- `codezeen.com/en/` — English (default)
- `codezeen.com/ar/` — Arabic + RTL

When locale = `ar`:
- `<html dir="rtl" lang="ar">`
- Tailwind: use `rtl:` variant for mirrored layouts
- All Sanity schemas have `ar` + `en` fields

---

## Sanity Content Models

> Every schema field is editable from Sanity Studio — no code changes needed to add/update content.

### Project  ← الأهم، fully dynamic
```ts
{
  // ─── IDENTITY ───────────────────────────────────────
  title:       { en: string, ar: string },         // اسم المشروع
  slug:        string,                              // URL: /work/my-project
  client:      { en: string, ar: string },         // اسم العميل (اختياري)
  year:        number,                              // سنة التسليم

  // ─── CLASSIFICATION ──────────────────────────────────
  category:    'mobile' | 'web' | 'saas' | 'design' | 'other',
  tags:        string[],                            // حر — أضف أي tag مستقبلاً
  status:      'live' | 'in-progress' | 'case-study',

  // ─── TECH STACK ──────────────────────────────────────
  // كل تقنية كـ object مستقل — تقدر تضيف أي تقنية جديدة من Studio
  techStack: Array<{
    name:     string,   // "Flutter", "Next.js", "Supabase", أي حاجة
    category: 'frontend' | 'backend' | 'mobile' | 'database' | 'devops' | 'design' | 'other',
    icon:     string,   // slug من Simple Icons (simpleicons.org) — اختياري
  }>,

  // ─── MEDIA ───────────────────────────────────────────
  heroImage:   SanityImage,                         // الصورة الرئيسية
  thumbnail:   SanityImage,                         // للـ grid cards (أصغر)
  gallery:     SanityImage[],                       // معرض صور المشروع
  videoUrl?:   string,                              // YouTube/Vimeo embed اختياري

  // ─── CONTENT ─────────────────────────────────────────
  shortDesc:   { en: string, ar: string },          // جملة واحدة — للـ cards
  challenge:   { en: BlockContent, ar: BlockContent }, // المشكلة اللي حلناها
  solution:    { en: BlockContent, ar: BlockContent }, // الحل اللي قدمناه
  results:     { en: BlockContent, ar: BlockContent }, // النتائج والأثر

  // ─── METRICS ─────────────────────────────────────────
  // أرقام تُعرض في صفحة المشروع — اختيارية
  metrics?: Array<{
    label: { en: string, ar: string },  // "App Store Rating"
    value: string,                       // "4.9★"
  }>,

  // ─── LINKS ───────────────────────────────────────────
  liveUrl?:    string,
  githubUrl?:  string,
  appStoreUrl?: string,
  playStoreUrl?: string,

  // ─── DISPLAY CONTROL ─────────────────────────────────
  featured:    boolean,   // يظهر في Home page
  publishedAt: datetime,  // تاريخ النشر على الموقع
  order:       number,    // ترتيب الظهور (الأصغر = الأول)
  hidden:      boolean,   // إخفاء بدون حذف
}
```

**السيناريوهات المستقبلية المغطاة:**
- أضفت مشروع Flutter جديد → أضف `techStack: [{name: "Flutter", category: "mobile"}]`
- مشروع SaaS بـ Supabase + Next → أضف تقنيتين بدون لمس كود
- عميل طلب إخفاء مشروعه مؤقتاً → `hidden: true` من Studio
- عايز تضيف فيديو demo → `videoUrl` جاهز
- عايز تضيف App Store rating كـ metric → `metrics` array جاهز

---

### Service
```ts
{
  title:      { en: string, ar: string },
  slug:       string,
  icon:       string,           // lucide icon name
  shortDesc:  { en: string, ar: string },
  fullDesc:   { en: BlockContent, ar: BlockContent },
  features:   Array<{ en: string, ar: string }>,  // كل feature كـ object مترجم
  techStack:  string[],         // تقنيات هذه الخدمة
  startingPrice?: string,       // "Starting from $X" — اختياري
  featured:   boolean,
  order:      number,
}
```

---

### BlogPost
```ts
{
  title:       { en: string, ar: string },
  slug:        string,
  coverImage:  SanityImage,
  author:      reference → TeamMember,
  publishedAt: datetime,
  category:    string,
  tags:        string[],
  body:        { en: BlockContent, ar: BlockContent },
  readingTime: number,           // بيتحسب أوتوماتيك من word count
  featured:    boolean,
  seo: {
    metaTitle:       { en: string, ar: string },
    metaDescription: { en: string, ar: string },
    ogImage:         SanityImage,
  },
}
```

---

### TeamMember
```ts
{
  name:    string,
  role:    { en: string, ar: string },
  bio:     { en: string, ar: string },
  photo:   SanityImage,
  socials: { linkedin?: string, github?: string, twitter?: string },
  order:   number,
  active:  boolean,
}
```

---

### Testimonial
```ts
{
  author:    string,
  company:   string,
  role:      string,
  content:   { en: string, ar: string },
  avatar?:   SanityImage,
  project?:  reference → Project,    // لو مرتبط بمشروع
  featured:  boolean,
  order:     number,
}
```

---

### SiteSettings  ← singleton — إعدادات عامة بدون كود
```ts
{
  // Hero section
  heroHeadline:    { en: string, ar: string },
  heroSubline:     { en: string, ar: string },

  // Stats counter (Home page)
  stats: Array<{
    label: { en: string, ar: string },
    value: string,   // "50+", "30+", "4"
  }>,

  // Tech stack marquee
  marqueeItems: string[],   // ["Flutter", "React", "Next.js", ...]

  // Contact info
  email:       string,
  whatsapp?:   string,
  socials: {
    github?:    string,
    linkedin?:  string,
    twitter?:   string,
    behance?:   string,
  },
}
```

**هذا الـ schema يعني:** كل حاجة من العنوان الرئيسي للـ stats للتقنيات في الـ marquee → تتغير من Studio بدون لمس كود أبداً.

---

## Performance Targets (Non-Negotiable)

- Lighthouse Performance: 95+
- LCP < 2.5s
- CLS = 0
- FID < 100ms
- Bundle size: no component > 50KB

Strategies:
- `dynamic(() => import(...), { ssr: false })` for heavy animation components
- GSAP `gsap.registerPlugin()` inside `useEffect` only
- `loading="lazy"` on all below-fold images
- Fonts: `display: 'swap'` + preload
- Three.js: only load if `!prefersReducedMotion && window.innerWidth > 768`

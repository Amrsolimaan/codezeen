# CODEZEEN — Pages Specification

---

## `/` — Home Page

**Goal:** In 5 seconds, the visitor knows: who we are, what we do, that we're exceptional.

### Section 01: Hero
```
Layout: Full viewport height (100svh)
Background: ParticleGrid canvas animation

Content (centered, slightly left-aligned):
  [Small badge]: "Full-Service Software Agency" ← small pill with accent border
  [H1]: "We Build" + line break + "Digital Products" + line break + "That Matter"
         ↑ Instrument Serif, ~80px desktop, 40px mobile
         ↑ SplitText kinetic reveal animation
  [Subtitle]: One sentence. Human. Not corporate.
               "From idea to launch — mobile apps, web platforms, and everything in between."
  [CTA row]: 
    - Primary: "See Our Work" → /work  (MagneticElement)
    - Secondary: "Start a Project" → /contact (ghost button, MagneticElement)
  [Scroll indicator]: Small animated arrow, disappears after scroll

RTL (Arabic): Text alignment flips, CTA order reverses
```

### Section 02: Marquee / Tech Strip
```
Layout: Full width, overflow hidden
Content: Infinite scrolling list of tech names
  Flutter · React · Next.js · Node.js · Firebase · Supabase · Swift · Kotlin · Figma · ...
  Duplicate list for seamless loop
Animation: CSS animation (no JS needed), pauses on hover
Speed: ~40s for full loop
Style: Monospace font, muted color, slash separators
```

### Section 03: Featured Work (from Sanity, `featured: true`)
```
Layout: NOT a grid — stacked full-width sections
Each project takes 70-80vh

Left side (60%): Project info
  - Project number (01, 02, 03) — very large, ghost/muted, behind text
  - Category badge
  - Project name (large)
  - 2-line description
  - Tech stack pills
  - "View Case Study" link with arrow

Right side (40%): Project image
  - Clips with border-radius
  - On scroll: subtle parallax (image moves slower than page)
  - On hover: ProjectPortalHover miniature

Transition between projects: Horizontal rule that draws itself (GSAP)
```

### Section 04: Services (Accordion Style)
```
Layout: Full width, accordion
Default state: 4 rows, each showing service name + number
Hover/expand: Row expands to show 3-4 feature bullets + icon

Animation: GSAP height animation (not CSS height: auto — use clip-path or fixed heights)

Services (from Sanity):
  01. Mobile Development (Flutter · Swift · Kotlin)
  02. Web Development (Next.js · React · Node)
  03. UI/UX Design (Figma · Prototyping · Systems)
  04. SaaS Products (Architecture · Scaling · DevOps)
```

### Section 05: Social Proof
```
Option A (if testimonials in Sanity): Testimonials carousel
Option B (if no testimonials yet): Stats counter

Stats (animated counter when enters viewport):
  50+  Projects Delivered
  30+  Happy Clients
  4    Years Building
  100% On-Time Delivery
```

### Section 06: Latest Blog (2 posts from Sanity)
```
Layout: 2-column cards
Each card: Cover image + Date + Category + Title + Reading time
Hover: Card lifts + image zooms slightly
```

### Section 07: CTA
```
Large, full-width section
Heading: "Ready to build something great?"
Subtext: "Tell us about your project. We'll get back within 24 hours."
Button: "Start a Conversation" → /contact
Style: Different from rest of page — use surface-2 background, slightly bordered
```

---

## `/work` — Projects Page

**Goal:** Impressive portfolio that shows range AND depth.

### Layout Option (Use BOTH):
```
Toggle bar at top: [Grid View] [List View]

GRID VIEW:
  Masonry-style, 3 columns on desktop, 1 on mobile
  Each card:
    - Project image (aspect ratio preserved)
    - Category badge (top-left, absolute)
    - Title + client (bottom, slides up on hover)
    - Hover: full overlay with description + "View Project" CTA

LIST VIEW:
  Full-width rows
  Each row: Number | Title | Category | Tech Stack | Year | Arrow
  Hover: ProjectPortalHover (the unique animation)
  ScrollVelocityTilt on list items
```

### Filters (Client-side, no reload):
```
All | Mobile | Web | SaaS | Design
Animation: Filter change fades old cards out, new ones in with stagger
```

---

## `/work/[slug]` — Single Project

**Goal:** Tell the project's story. Make it feel like a case study, not a gallery.

### Layout:
```
[HERO]: Project title + hero image (full bleed, parallax)
[META BAR]: Category | Tech Stack | Year | Live Link | GitHub
[OVERVIEW]: Problem statement (from Sanity rich text)
[GALLERY]: Scrolling image gallery — NOT a slideshow
  Images reveal as you scroll (clip-path reveal animation)
[PROCESS]: Optional timeline of development phases
[RESULT]: Key outcomes, metrics if available
[NEXT PROJECT]: Links to next/prev project
```

---

## `/services` — Services Page

**Layout:**
```
[HERO]: Title + subtitle

[SERVICE CARDS — 2 column grid]:
  Each card: Icon (Lucide) + Title + Short description + Feature list + CTA
  Hover: Border glows with accent color

[PROCESS SECTION]:
  How we work — 4 steps
  Visual: Numbered steps connected by a line that draws on scroll (GSAP)

[TECH MATRIX]:
  Table showing which technologies per service category
  Animated: cells fade in with stagger
```

---

## `/about` — About Page

**Goal:** Feel human. Not corporate. Show the people.

```
[HERO]: "We're Codezeen" — large, warm
[STORY]: 2-3 paragraphs about the company founding (from Sanity)
[TEAM GRID]: Team member cards (from Sanity)
  Each: Photo + Name + Role + Short bio
  Hover: Card flips (3D) to show skills/social links

[VALUES]: 3-4 core values
  Visual: Large numbers + short text — editorial style

[TECH STACK]: 
  Same as Home marquee but expanded, with category grouping
```

---

## `/blog` — Blog Listing

```
[FEATURED POST]: Full-width, large image, top of page
[ALL POSTS GRID]: 3-column grid, paginated (6 per page)
  Each card: Image + Category + Title + Date + Reading time
[CATEGORIES FILTER]: Tag-based, client-side
```

---

## `/blog/[slug]` — Blog Post

```
Layout: Reading-focused — max-width 680px, centered
[Header]: Category + Title + Author + Date + Reading time
[Hero image]: Full bleed
[Body]: Portable Text renderer (from Sanity) with:
  - Code blocks with syntax highlighting (Prism or Shiki)
  - Image captions
  - Block quotes styled prominently
[Reading progress]: Thin line at top of screen
[Share]: At bottom — Copy link + social
[Related posts]: 2 cards at bottom
```

---

## `/contact` — Contact Page

```
[LEFT SIDE — 40%]:
  Heading: "Let's talk"
  Subtext: Human, warm
  Response time: "We reply within 24 hours"
  Contact info: email, social
  Map or office location (optional)

[RIGHT SIDE — 60%]:
  Contact form (React Hook Form + Zod validation):
    - Name (required)
    - Email (required, validated)
    - Service type (select: Mobile / Web / SaaS / Other)
    - Budget range (select — optional)
    - Message (textarea, min 20 chars)
    - Submit button (MagneticElement)
  
  On submit:
    → POST to /api/contact
    → Resend sends email to team
    → Success: form fades out, success animation appears
    → Error: inline error message per field
```

---

## `/studio/[[...tool]]` — Sanity Studio (Protected)

```
Only accessible internally (add to robots.txt: Disallow: /studio)
This is your content management panel
```

---

## Header (Sticky)

```
Default: Transparent, text white
On scroll (>80px): Background blurs + semi-transparent surface
Mobile: Hamburger menu, full-screen overlay

Contents:
  Left: Codezeen logo (SVG, from /public)
  Center: Nav links (desktop only)
  Right: Language switcher (EN | AR) + "Start Project" CTA button

Transition: Height shrinks on scroll (80px → 60px)
```

---

## Footer

```
4 columns (collapses to 2 on tablet, 1 on mobile):
  1. Logo + tagline + social icons (MagneticElement on each)
  2. Services links
  3. Company links (About, Blog, Work)
  4. Contact info

Bottom bar: Copyright | Privacy Policy | Made with ☕ in Egypt
```

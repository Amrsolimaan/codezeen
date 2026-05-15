import { defineQuery } from 'next-sanity';

// ─── Projects ────────────────────────────────────────────────────────────────

export const ALL_PROJECTS_QUERY = defineQuery(`
  *[_type == "project" && status == "published" && hidden != true]
  | order(order asc) {
    _id,
    _createdAt,
    title,
    slug,
    category,
    tags,
    year,
    heroImage { ..., asset-> },
    description { en, ar },
    featured,
    order,
    techStack[] { name, icon },
    liveUrl,
    status
  }
`);

export const FEATURED_PROJECTS_QUERY = defineQuery(`
  *[_type == "project" && featured == true && status == "published" && hidden != true]
  | order(order asc) [0...3] {
    _id,
    title,
    slug,
    category,
    tags,
    heroImage { ..., asset-> },
    techStack[] { name, icon },
    liveUrl,
    description { en, ar }
  }
`);

export const PROJECT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    _createdAt,
    title,
    slug,
    category,
    tags,
    year,
    heroImage { ..., asset-> },
    gallery[] { ..., asset-> },
    description,
    techStack[] { name, icon },
    metrics[] { label, value },
    liveUrl,
    githubUrl,
    dribbbleUrl,
    featured,
    status
  }
`);

export const PROJECT_NAV_QUERY = defineQuery(`
  *[_type == "project" && status == "published" && hidden != true]
  | order(order asc) {
    _id,
    title,
    slug
  }
`);

export const PROJECT_SLUGS_QUERY = defineQuery(`
  *[_type == "project" && status == "published" && hidden != true] {
    "slug": slug.current
  }
`);

export const PROJECTS_BY_CATEGORY_QUERY = defineQuery(`
  *[_type == "project" && category == $category && status == "published" && hidden != true]
  | order(order asc) {
    _id,
    title,
    slug,
    category,
    heroImage { ..., asset-> },
    techStack[] { name, icon },
    liveUrl
  }
`);

// ─── Services ────────────────────────────────────────────────────────────────

export const ALL_SERVICES_QUERY = defineQuery(`
  *[_type == "service"] | order(order asc) {
    _id,
    title,
    slug,
    icon,
    shortDesc,
    features,
    startingPrice,
    featured,
    order
  }
`);

export const FEATURED_SERVICES_QUERY = defineQuery(`
  *[_type == "service" && featured == true] | order(order asc) {
    _id,
    title,
    slug,
    icon,
    shortDesc,
    features,
    startingPrice
  }
`);

export const SERVICE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "service" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    icon,
    shortDesc,
    longDesc,
    features,
    startingPrice,
    featured
  }
`);

// ─── Blog ─────────────────────────────────────────────────────────────────────

export const ALL_BLOG_POSTS_QUERY = defineQuery(`
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    coverImage { ..., asset-> },
    publishedAt,
    category,
    tags,
    excerpt,
    readingTime,
    featured
  }
`);

export const FEATURED_BLOG_POSTS_QUERY = defineQuery(`
  *[_type == "blogPost" && featured == true] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    coverImage { ..., asset-> },
    publishedAt,
    category,
    excerpt,
    readingTime
  }
`);

export const BLOG_POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    coverImage { ..., asset-> },
    publishedAt,
    category,
    tags,
    excerpt,
    body,
    readingTime,
    featured
  }
`);

export const BLOG_POST_SLUGS_QUERY = defineQuery(`
  *[_type == "blogPost"] { "slug": slug.current }
`);

export const RELATED_BLOG_POSTS_QUERY = defineQuery(`
  *[_type == "blogPost" && category == $category && slug.current != $slug]
  | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    coverImage { ..., asset-> },
    publishedAt,
    category,
    excerpt,
    readingTime
  }
`);

export const BLOG_POSTS_BY_CATEGORY_QUERY = defineQuery(`
  *[_type == "blogPost" && category == $category] | order(publishedAt desc) {
    _id,
    title,
    slug,
    coverImage { ..., asset-> },
    publishedAt,
    excerpt,
    readingTime
  }
`);

// ─── Team ─────────────────────────────────────────────────────────────────────

export const ALL_TEAM_MEMBERS_QUERY = defineQuery(`
  *[_type == "teamMember"] | order(order asc) {
    _id,
    name,
    role,
    bio,
    photo { ..., asset-> },
    linkedin,
    github,
    twitter,
    order
  }
`);

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const ALL_TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial"] | order(order asc) {
    _id,
    author,
    role,
    company,
    quote,
    avatar { ..., asset-> },
    rating,
    featured,
    project->{ title, slug }
  }
`);

export const FEATURED_TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial" && featured == true] | order(order asc) {
    _id,
    author,
    role,
    company,
    quote,
    avatar { ..., asset-> },
    rating,
    project->{ title, slug }
  }
`);

// ─── Site Settings ────────────────────────────────────────────────────────────

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0] {
    siteName,
    tagline,
    logo { ..., asset-> },
    email,
    phone,
    address,
    socialLinks,
    seo {
      defaultTitle,
      defaultDescription,
      ogImage { ..., asset-> }
    },
    footerLinks
  }
`);

import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: process.env['NEXT_PUBLIC_SANITY_PROJECT_ID'] ?? 'REPLACE_ME',
  dataset: process.env['NEXT_PUBLIC_SANITY_DATASET'] ?? 'production',
  apiVersion: '2025-05-14',
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published',
  stega: {
    enabled: false,
    studioUrl: '/studio',
  },
});

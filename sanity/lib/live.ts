import { defineLive } from 'next-sanity/live';
import { client } from './client';

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    useCdn: false,
    perspective: 'published',
  }),
  serverToken: process.env['SANITY_API_TOKEN'],
  browserToken: process.env['NEXT_PUBLIC_SANITY_TOKEN'],
});

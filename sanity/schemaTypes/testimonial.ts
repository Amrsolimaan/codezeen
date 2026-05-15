import { defineType, defineField } from 'sanity';
import { StarIcon } from '@sanity/icons';

export const testimonialSchema = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: StarIcon,

  fields: [
    defineField({
      name: 'author',
      title: 'Author Name',
      type: 'string',
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'object',
      fields: [
        defineField({ name: 'en', title: 'English', type: 'string' }),
        defineField({ name: 'ar', title: 'Arabic', type: 'string' }),
      ],
    }),

    defineField({
      name: 'company',
      title: 'Company',
      type: 'object',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({ name: 'ar', title: 'Arabic', type: 'string' }),
      ],
    }),

    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'object',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'text',
          rows: 4,
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'ar',
          title: 'Arabic',
          type: 'text',
          rows: 4,
        }),
      ],
    }),

    defineField({
      name: 'avatar',
      title: 'Avatar Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),

    defineField({
      name: 'rating',
      title: 'Rating (1–5)',
      type: 'number',
      options: {
        list: [1, 2, 3, 4, 5],
        layout: 'radio',
      },
      initialValue: 5,
      validation: (R) => R.min(1).max(5),
    }),

    defineField({
      name: 'project',
      title: 'Related Project',
      type: 'reference',
      to: [{ type: 'project' }],
    }),

    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show on the home page',
      initialValue: false,
    }),

    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 100,
    }),
  ],

  preview: {
    select: {
      title: 'author',
      subtitle: 'company.en',
      media: 'avatar',
    },
  },
});

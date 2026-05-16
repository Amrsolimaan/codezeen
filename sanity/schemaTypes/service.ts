import { defineType, defineField, defineArrayMember } from 'sanity';
import { ComponentIcon } from '@sanity/icons';

export const serviceSchema = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: ComponentIcon,

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
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
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title.en', maxLength: 96 },
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'icon',
      title: 'Icon (lucide-react name)',
      type: 'string',
      description: 'e.g. "Code2", "Smartphone", "BarChart3"',
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'shortDesc',
      title: 'Short Description',
      type: 'object',
      description: 'Shown in cards and accordions',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'text',
          rows: 2,
          validation: (R) => R.required().max(160),
        }),
        defineField({
          name: 'ar',
          title: 'Arabic',
          type: 'text',
          rows: 2,
        }),
      ],
    }),

    defineField({
      name: 'longDesc',
      title: 'Long Description',
      type: 'object',
      description: 'Used on the Services detail page',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'array',
          of: [defineArrayMember({ type: 'block' })],
        }),
        defineField({
          name: 'ar',
          title: 'Arabic',
          type: 'array',
          of: [defineArrayMember({ type: 'block' })],
        }),
      ],
    }),

    defineField({
      name: 'features',
      title: 'Feature List',
      type: 'object',
      description: 'Bullet points shown in the accordion',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          options: { layout: 'tags' },
        }),
        defineField({
          name: 'ar',
          title: 'Arabic',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          options: { layout: 'tags' },
        }),
      ],
    }),

    defineField({
      name: 'techStack',
      title: 'Technologies Used',
      type: 'array',
      description: 'e.g. "React", "Node.js", "PostgreSQL"',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),

    defineField({
      name: 'startingPrice',
      title: 'Starting Price',
      type: 'string',
      description: 'e.g. "Starting from $1,500" — shown on the services page',
    }),

    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show in the home page services section',
      initialValue: true,
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
      title: 'title.en',
      subtitle: 'icon',
    },
  },

  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
});

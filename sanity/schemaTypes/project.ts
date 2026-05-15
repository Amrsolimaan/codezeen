import { defineType, defineField, defineArrayMember } from 'sanity';
import { ProjectsIcon } from '@sanity/icons';

export const projectSchema = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ProjectsIcon,

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
      name: 'year',
      title: 'Year Delivered',
      type: 'number',
      description: 'The year this project was delivered to the client',
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Published', value: 'published' },
          { title: 'Draft', value: 'draft' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'published',
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Web', value: 'web' },
          { title: 'Mobile', value: 'mobile' },
          { title: 'SaaS', value: 'saas' },
          { title: 'Design', value: 'design' },
        ],
        layout: 'radio',
      },
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (R) => R.required(),
        }),
      ],
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'array',
          of: [
            defineArrayMember({ type: 'block' }),
            defineArrayMember({
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
            }),
          ],
        }),
        defineField({
          name: 'ar',
          title: 'Arabic',
          type: 'array',
          of: [
            defineArrayMember({ type: 'block' }),
            defineArrayMember({
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tech',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'icon',
              title: 'Icon (lucide-react name)',
              type: 'string',
            }),
          ],
          preview: { select: { title: 'name' } },
        }),
      ],
    }),

    defineField({
      name: 'metrics',
      title: 'Key Metrics',
      type: 'array',
      description: 'Impressive numbers shown on the case study page (e.g. "3x", "200k+", "99%")',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'metric',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'object',
              fields: [
                defineField({ name: 'en', title: 'English', type: 'string' }),
                defineField({ name: 'ar', title: 'Arabic', type: 'string' }),
              ],
            }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label.en' },
          },
        }),
      ],
    }),

    defineField({ name: 'liveUrl', title: 'Live URL', type: 'url' }),
    defineField({ name: 'githubUrl', title: 'GitHub URL', type: 'url' }),
    defineField({ name: 'dribbbleUrl', title: 'Dribbble / Behance URL', type: 'url' }),

    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show in the home page featured section',
      initialValue: false,
    }),

    defineField({
      name: 'hidden',
      title: 'Hidden',
      type: 'boolean',
      description: 'Hide from the portfolio (keeps the slug alive for direct links)',
      initialValue: false,
    }),

    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first',
      initialValue: 100,
    }),
  ],

  preview: {
    select: {
      title: 'title.en',
      subtitle: 'category',
      media: 'heroImage',
    },
  },

  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Title A–Z',
      name: 'titleAsc',
      by: [{ field: 'title.en', direction: 'asc' }],
    },
  ],
});

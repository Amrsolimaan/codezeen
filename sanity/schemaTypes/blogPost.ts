import { defineType, defineField, defineArrayMember } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons';

export const blogPostSchema = defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  icon: DocumentTextIcon,

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
      name: 'coverImage',
      title: 'Cover Image',
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
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Engineering', value: 'engineering' },
          { title: 'Design', value: 'design' },
          { title: 'Product', value: 'product' },
          { title: 'Business', value: 'business' },
          { title: 'Case Study', value: 'case-study' },
        ],
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
      name: 'excerpt',
      title: 'Excerpt',
      type: 'object',
      description: 'Short summary shown in post cards',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'text',
          rows: 3,
          validation: (R) => R.max(300),
        }),
        defineField({
          name: 'ar',
          title: 'Arabic',
          type: 'text',
          rows: 3,
        }),
      ],
    }),

    defineField({
      name: 'body',
      title: 'Body',
      type: 'object',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'block',
              styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'H2', value: 'h2' },
                { title: 'H3', value: 'h3' },
                { title: 'H4', value: 'h4' },
                { title: 'Quote', value: 'blockquote' },
              ],
              marks: {
                decorators: [
                  { title: 'Bold', value: 'strong' },
                  { title: 'Italic', value: 'em' },
                  { title: 'Code', value: 'code' },
                  { title: 'Underline', value: 'underline' },
                ],
                annotations: [
                  {
                    name: 'link',
                    type: 'object',
                    title: 'Link',
                    fields: [
                      defineField({ name: 'href', type: 'url', title: 'URL' }),
                      defineField({
                        name: 'blank',
                        type: 'boolean',
                        title: 'Open in new tab',
                        initialValue: false,
                      }),
                    ],
                  },
                ],
              },
            }),
            defineArrayMember({
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
                defineField({ name: 'caption', type: 'string', title: 'Caption' }),
              ],
            }),
            defineArrayMember({
              type: 'object',
              name: 'codeBlock',
              title: 'Code Block',
              fields: [
                defineField({ name: 'code', type: 'text', title: 'Code' }),
                defineField({
                  name: 'language',
                  type: 'string',
                  title: 'Language',
                  options: {
                    list: ['typescript', 'javascript', 'python', 'bash', 'css', 'html', 'json', 'sql'],
                  },
                }),
                defineField({ name: 'filename', type: 'string', title: 'Filename (optional)' }),
              ],
              preview: {
                select: { title: 'language', subtitle: 'filename' },
              },
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
              fields: [
                defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
                defineField({ name: 'caption', type: 'string', title: 'Caption' }),
              ],
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
      description: 'Approximate reading time — will auto-calculate in a future version',
      initialValue: 5,
      validation: (R) => R.min(1).max(120),
    }),

    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],

  preview: {
    select: {
      title: 'title.en',
      subtitle: 'publishedAt',
      media: 'coverImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title as string,
        subtitle: subtitle
          ? new Date(subtitle as string).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'Unpublished',
        media,
      };
    },
  },

  orderings: [
    {
      title: 'Published (newest first)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
});

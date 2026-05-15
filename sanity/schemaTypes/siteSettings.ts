import { defineType, defineField, defineArrayMember } from 'sanity';
import { CogIcon } from '@sanity/icons';

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,

  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      initialValue: 'Codezeen',
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'object',
      fields: [
        defineField({ name: 'en', title: 'English', type: 'string' }),
        defineField({ name: 'ar', title: 'Arabic', type: 'string' }),
      ],
    }),

    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: false },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string', initialValue: 'Codezeen' }),
      ],
    }),

    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      validation: (R) => R.email().required(),
    }),

    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),

    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        defineField({ name: 'en', title: 'English', type: 'text', rows: 2 }),
        defineField({ name: 'ar', title: 'Arabic', type: 'text', rows: 2 }),
      ],
    }),

    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({ name: 'github', title: 'GitHub URL', type: 'url' }),
        defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'url' }),
        defineField({ name: 'twitter', title: 'Twitter / X URL', type: 'url' }),
        defineField({ name: 'instagram', title: 'Instagram URL', type: 'url' }),
        defineField({ name: 'dribbble', title: 'Dribbble URL', type: 'url' }),
      ],
    }),

    defineField({
      name: 'seo',
      title: 'SEO Defaults',
      type: 'object',
      fields: [
        defineField({
          name: 'defaultTitle',
          title: 'Default Meta Title',
          type: 'string',
          initialValue: 'Codezeen — Software Agency',
        }),
        defineField({
          name: 'defaultDescription',
          title: 'Default Meta Description',
          type: 'object',
          fields: [
            defineField({ name: 'en', type: 'text', title: 'English', rows: 2 }),
            defineField({ name: 'ar', type: 'text', title: 'Arabic', rows: 2 }),
          ],
        }),
        defineField({
          name: 'ogImage',
          title: 'Default OG Image',
          type: 'image',
          options: { hotspot: false },
          fields: [
            defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'footerLinks',
      title: 'Footer Extra Links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        }),
      ],
    }),
  ],

  preview: {
    select: { title: 'siteName' },
  },
});

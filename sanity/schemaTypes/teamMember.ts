import { defineType, defineField } from 'sanity';
import { UserIcon } from '@sanity/icons';

export const teamMemberSchema = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  icon: UserIcon,

  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'role',
      title: 'Role / Title',
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
      name: 'bio',
      title: 'Bio',
      type: 'object',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'text',
          rows: 4,
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
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
      validation: (R) => R.required(),
    }),

    defineField({
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
    }),

    defineField({
      name: 'github',
      title: 'GitHub URL',
      type: 'url',
    }),

    defineField({
      name: 'twitter',
      title: 'Twitter / X URL',
      type: 'url',
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
      title: 'name',
      subtitle: 'role.en',
      media: 'photo',
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

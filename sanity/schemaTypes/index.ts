import { projectSchema } from './project';
import { serviceSchema } from './service';
import { blogPostSchema } from './blogPost';
import { teamMemberSchema } from './teamMember';
import { testimonialSchema } from './testimonial';
import { siteSettingsSchema } from './siteSettings';

export const schemaTypes = [
  projectSchema,
  serviceSchema,
  blogPostSchema,
  teamMemberSchema,
  testimonialSchema,
  siteSettingsSchema,
];

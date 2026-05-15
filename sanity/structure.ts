import type { StructureBuilder } from 'sanity/structure';

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Codezeen CMS')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings'),
        ),

      S.divider(),

      S.documentTypeListItem('project').title('Projects'),
      S.documentTypeListItem('service').title('Services'),
      S.documentTypeListItem('blogPost').title('Blog Posts'),
      S.documentTypeListItem('teamMember').title('Team Members'),
      S.documentTypeListItem('testimonial').title('Testimonials'),
    ]);

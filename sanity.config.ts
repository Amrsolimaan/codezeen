import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemaTypes';
import { structure } from './sanity/structure';

export default defineConfig({
  name: 'codezeen',
  title: 'Codezeen CMS',

  basePath: '/studio',
  projectId: process.env['NEXT_PUBLIC_SANITY_PROJECT_ID'] ?? 'REPLACE_ME',
  dataset: process.env['NEXT_PUBLIC_SANITY_DATASET'] ?? 'production',

  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: '2025-05-14' }),
  ],

  schema: {
    types: schemaTypes,
  },
});

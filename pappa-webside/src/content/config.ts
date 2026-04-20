import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    year: z.number().nullable().optional(),
    technique: z.string().default(''),
    dimensions: z.string().default(''),
    section: z.enum(['aktuelt', 'verker', 'arkiv']),
    availability: z.enum(['original', 'digital', 'sold', 'wip']).default('digital'),
    featured: z.boolean().optional().default(false),
    sortOrder: z.number().optional(),
    price: z.string().optional().default(''),
    image: z.string(),
    imageAlt: z.string().default(''),
  }),
});

export const collections = { works };

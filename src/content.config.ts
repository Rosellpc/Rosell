import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    technologies: z.array(z.string()),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    contribution: z.string().optional(),
    status: z.string().optional(),
    architecture: z.array(z.string()).length(3).default(['Streamlit', 'FastAPI', 'JWT · RBAC']),
    preview: z.string().optional(),
    previewAlt: z.string().optional(),
    gallery: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
    repository: z.url().optional(),
    demo: z.url().optional(),
    demoLabel: z.string().default('Abrir demo'),
  }),
});

export const collections = { projects };

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Endast de två samlingar som har brödtext (Markdoc) ligger som Astro
 * content-collections, eftersom de behöver renderas. Rena datasamlingar
 * (grupper, schema, priser, terminer) läses i `src/lib/innehall.ts`.
 */

const stripIndex = (entry: string) => entry.replace(/\/?index\.mdoc$/, '');

const nyheter = defineCollection({
  loader: glob({
    pattern: '**/index.mdoc',
    base: './src/content/nyheter',
    generateId: ({ entry }) => stripIndex(entry),
  }),
  schema: z.object({
    titel: z.string(),
    datum: z.coerce.date(),
    ingress: z.string(),
    omslagsbild: z.string().nullable().optional(),
    bildtext: z.string().nullable().optional(),
    publicerad: z.boolean().default(false),
  }),
});

const instruktorer = defineCollection({
  loader: glob({
    pattern: '**/index.mdoc',
    base: './src/content/instruktorer',
    generateId: ({ entry }) => stripIndex(entry),
  }),
  schema: z.object({
    namn: z.string(),
    roll: z.string(),
    foto: z.string().nullable().optional(),
    fotoAlt: z.string().nullable().optional(),
    ordning: z.number().default(100),
  }),
});

export const collections = { nyheter, instruktorer };

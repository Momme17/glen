// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://borgenfightcenter.se';

/**
 * `lastmod` per nyhetssida, hämtat ur frontmatterns `datum`. Läses direkt från
 * filerna eftersom astro.config körs innan content-samlingarna finns.
 */
function nyhetsdatum() {
  const bas = new URL('./src/content/nyheter/', import.meta.url);
  const karta = new Map();

  for (const mapp of readdirSync(bas, { withFileTypes: true })) {
    if (!mapp.isDirectory()) continue;

    const text = readFileSync(new URL(`${mapp.name}/index.mdoc`, bas), 'utf8');
    if (!/^publicerad:\s*true/m.test(text)) continue;

    const datum = text.match(/^datum:\s*(\d{4}-\d{2}-\d{2})/m)?.[1];
    if (datum) karta.set(`${SITE}/nyheter/${mapp.name}/`, datum);
  }

  return karta;
}

const NYHETSDATUM = nyhetsdatum();

// Startsidan listar nyheterna, så senaste nyheten daterar även den. Vi undviker
// medvetet byggdatum — ett `lastmod` som ändras vid varje bygge ignoreras.
const SENASTE = [...NYHETSDATUM.values()].sort().at(-1);

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // Content pages are prerendered to static HTML. Only the Keystatic admin
  // routes run on the server, which is why an adapter is present.
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react(),
    markdoc(),
    keystatic(),
    sitemap({
      serialize(item) {
        const datum = NYHETSDATUM.get(item.url) ?? (item.url === `${SITE}/` ? SENASTE : undefined);
        if (datum) item.lastmod = new Date(`${datum}T00:00:00Z`).toISOString();
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

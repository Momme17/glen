/**
 * Läser det redaktionella innehållet som Keystatic skriver till `src/content`.
 *
 * Grupper, terminer, schema och priser är rena datafiler utan brödtext, så de
 * läses direkt här. Nyheter och instruktörer har Markdoc-innehåll och ligger
 * som Astro content-collections, se `src/content.config.ts`.
 */

export type Gruppfarg =
  | 'barn'
  | 'ungdomar'
  | 'juniorer'
  | 'vuxna1'
  | 'vuxna2'
  | 'sparring';

export type Veckodag =
  | 'mandag'
  | 'tisdag'
  | 'onsdag'
  | 'torsdag'
  | 'fredag'
  | 'lordag'
  | 'sondag';

export interface Traningsgrupp {
  slug: string;
  namn: string;
  aldersspann: string;
  kortBeskrivning: string;
  farg: Gruppfarg;
  ordning: number;
}

export interface Termin {
  slug: string;
  namn: string;
  start: string;
  slut: string;
  aktiv: boolean;
}

export interface Schemapass {
  slug: string;
  dag: Veckodag;
  start: string;
  slut: string;
  grupp: string;
  termin: string;
  notering?: string | null;
}

export interface Pris {
  slug: string;
  grupp: string;
  belopp: number;
  periodEtikett: string;
  termin: string;
}

export interface Installningar {
  heroRubrik: string;
  heroText: string;
  discipliner: string[];
  ctaText: string;
  sportadminUrl: string;
  omRubrik: string;
  omText: string;
  trygghetRubrik: string;
  trygghetText: string;
  medlemsavgift: number;
  prisNotering?: string | null;
  epost: string;
  gatuadress: string;
  postnummer: string;
  ort: string;
  kartlank?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  sponsorRubrik?: string | null;
  sponsorText?: string | null;
  sponsorLank?: string | null;
  seoTitel: string;
  seoBeskrivning: string;
}

/** Plockar ut mappnamnet (= slug) ur en sökväg som `../content/x/min-slug/index.json`. */
function slugFromPath(path: string): string {
  const match = path.match(/([^/]+)\/index\.json$/);
  return match ? match[1] : path;
}

function load<T>(modules: Record<string, unknown>): Array<T & { slug: string }> {
  return Object.entries(modules).map(([path, mod]) => ({
    ...(mod as { default: T }).default,
    slug: slugFromPath(path),
  }));
}

export const traningsgrupper: Traningsgrupp[] = load<Omit<Traningsgrupp, 'slug'>>(
  import.meta.glob('../content/traningsgrupper/*/index.json', { eager: true }),
).sort((a, b) => a.ordning - b.ordning);

export const terminer: Termin[] = load<Omit<Termin, 'slug'>>(
  import.meta.glob('../content/terminer/*/index.json', { eager: true }),
);

export const schemapass: Schemapass[] = load<Omit<Schemapass, 'slug'>>(
  import.meta.glob('../content/schema/*/index.json', { eager: true }),
);

export const priser: Pris[] = load<Omit<Pris, 'slug'>>(
  import.meta.glob('../content/priser/*/index.json', { eager: true }),
);

const installningarModules = import.meta.glob<{ default: Installningar }>(
  '../content/installningar/index.json',
  { eager: true },
);
export const installningar: Installningar =
  Object.values(installningarModules)[0].default;

/** Den termin som är markerad som aktiv i CMS:et. Faller tillbaka på den första. */
export const aktivTermin: Termin | undefined =
  terminer.find((t) => t.aktiv) ?? terminer[0];

export function gruppEfterSlug(slug: string): Traningsgrupp | undefined {
  return traningsgrupper.find((g) => g.slug === slug);
}

export const VECKODAGAR: { value: Veckodag; label: string }[] = [
  { value: 'mandag', label: 'Måndag' },
  { value: 'tisdag', label: 'Tisdag' },
  { value: 'onsdag', label: 'Onsdag' },
  { value: 'torsdag', label: 'Torsdag' },
  { value: 'fredag', label: 'Fredag' },
  { value: 'lordag', label: 'Lördag' },
  { value: 'sondag', label: 'Söndag' },
];

/**
 * Tailwind-klasser per gruppfärg. Skrivs ut i full form så att Tailwinds
 * scanner hittar dem — dynamiskt hopsatta klassnamn plockas inte upp.
 */
export const FARG_KLASS: Record<Gruppfarg, { prick: string; text: string }> = {
  barn: { prick: 'bg-grupp-barn', text: 'text-grupp-barn' },
  ungdomar: { prick: 'bg-grupp-ungdomar', text: 'text-grupp-ungdomar' },
  juniorer: { prick: 'bg-grupp-juniorer', text: 'text-grupp-juniorer' },
  vuxna1: { prick: 'bg-grupp-vuxna1', text: 'text-grupp-vuxna1' },
  vuxna2: { prick: 'bg-grupp-vuxna2', text: 'text-grupp-vuxna2' },
  sparring: { prick: 'bg-grupp-sparring', text: 'text-grupp-sparring' },
};

/**
 * Ett tidsintervall i veckoschemat. Pass som ligger på samma dag och tid slås
 * ihop till en rad, så att "Vuxna Steg 1" och "Steg 2" visas bredvid varandra
 * i stället för på två rader.
 */
export interface Schemarad {
  start: string;
  slut: string;
  grupper: Traningsgrupp[];
  noteringar: string[];
}

export interface Schemadag {
  dag: Veckodag;
  label: string;
  rader: Schemarad[];
}

export function schemaForTermin(terminSlug: string | undefined): Schemadag[] {
  const pass = terminSlug
    ? schemapass.filter((p) => p.termin === terminSlug)
    : schemapass;

  return VECKODAGAR.map(({ value, label }) => {
    const dagensPass = pass
      .filter((p) => p.dag === value)
      .sort((a, b) => a.start.localeCompare(b.start));

    const rader = new Map<string, Schemarad>();

    for (const p of dagensPass) {
      const grupp = gruppEfterSlug(p.grupp);
      if (!grupp) continue;

      const nyckel = `${p.start}-${p.slut}`;
      const befintlig = rader.get(nyckel);

      if (befintlig) {
        befintlig.grupper.push(grupp);
        if (p.notering) befintlig.noteringar.push(p.notering);
      } else {
        rader.set(nyckel, {
          start: p.start,
          slut: p.slut,
          grupper: [grupp],
          noteringar: p.notering ? [p.notering] : [],
        });
      }
    }

    return { dag: value, label, rader: [...rader.values()] };
  }).filter((d) => d.rader.length > 0);
}

export interface PrisMedGrupp extends Pris {
  gruppData: Traningsgrupp;
}

export function priserForTermin(terminSlug: string | undefined): PrisMedGrupp[] {
  return priser
    .filter((p) => !terminSlug || p.termin === terminSlug)
    .map((p) => ({ ...p, gruppData: gruppEfterSlug(p.grupp) }))
    .filter((p): p is PrisMedGrupp => Boolean(p.gruppData))
    .sort((a, b) => a.gruppData.ordning - b.gruppData.ordning);
}

/** 1500 → "1 500 kr" med hårt mellanslag enligt svensk konvention. */
export function kronor(belopp: number): string {
  return `${belopp.toLocaleString('sv-SE').replace(/\s/g, ' ')} kr`;
}

export function svensktDatum(datum: Date): string {
  return datum.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** ISO-datum för <time datetime="…">. */
export function isoDatum(datum: Date): string {
  return datum.toISOString().slice(0, 10);
}

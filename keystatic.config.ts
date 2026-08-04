import { config, fields, collection, singleton } from '@keystatic/core';

/**
 * Borgen Fight Center — innehållsmodell.
 *
 * Allt innehåll på webbplatsen redigeras härifrån. Inga texter, priser eller
 * scheman ligger hårdkodade i koden.
 *
 * Lagring: `local` betyder att innehållet sparas som filer i det här projektet.
 * När sajten ligger på en server byter man till GitHub-läge — se README.
 */

const DAGAR = [
  { label: 'Måndag', value: 'mandag' },
  { label: 'Tisdag', value: 'tisdag' },
  { label: 'Onsdag', value: 'onsdag' },
  { label: 'Torsdag', value: 'torsdag' },
  { label: 'Fredag', value: 'fredag' },
  { label: 'Lördag', value: 'lordag' },
  { label: 'Söndag', value: 'sondag' },
] as const;

const FARGER = [
  { label: 'Korall (barn)', value: 'barn' },
  { label: 'Mässing (ungdomar)', value: 'ungdomar' },
  { label: 'Grön (juniorer)', value: 'juniorer' },
  { label: 'Blå (vuxna steg 1)', value: 'vuxna1' },
  { label: 'Lila (vuxna steg 2)', value: 'vuxna2' },
  { label: 'Röd (sparring)', value: 'sparring' },
] as const;

export default config({
  storage: { kind: 'local' },

  ui: {
    brand: { name: 'Borgen Fight Center' },
    navigation: {
      Innehåll: ['nyheter', 'instruktorer'],
      Träning: ['traningsgrupper', 'schema', 'priser', 'terminer'],
      Webbplats: ['installningar'],
    },
  },

  collections: {
    // ---------------------------------------------------------------- Nyheter
    nyheter: collection({
      label: 'Nyheter',
      slugField: 'titel',
      path: 'src/content/nyheter/*/',
      format: { contentField: 'innehall' },
      entryLayout: 'content',
      columns: ['titel', 'datum'],
      schema: {
        titel: fields.slug({
          name: {
            label: 'Rubrik',
            description: 'Nyhetens rubrik, till exempel "Vårterminen 2026".',
            validation: { isRequired: true },
          },
          slug: {
            label: 'Webbadress',
            description:
              'Den del av länken som pekar på nyheten. Ändra inte i efterhand — då slutar gamla länkar fungera.',
          },
        }),
        datum: fields.date({
          label: 'Datum',
          description: 'Nyheter visas med den nyaste först.',
          validation: { isRequired: true },
        }),
        ingress: fields.text({
          label: 'Ingress',
          description:
            'En eller två meningar som visas i nyhetslistan och i delningar på sociala medier.',
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 300 } },
        }),
        omslagsbild: fields.image({
          label: 'Omslagsbild',
          description: 'Visas överst i nyheten och i nyhetslistan. Valfri.',
          directory: 'src/assets/nyheter',
          publicPath: '/src/assets/nyheter/',
        }),
        bildtext: fields.text({
          label: 'Bildbeskrivning (alt-text)',
          description:
            'Beskriv vad som syns på bilden. Läses upp för besökare som använder skärmläsare.',
        }),
        publicerad: fields.checkbox({
          label: 'Publicerad',
          description:
            'Avmarkera för att spara som utkast. Utkast syns inte på webbplatsen.',
          defaultValue: false,
        }),
        innehall: fields.markdoc({
          label: 'Innehåll',
        }),
      },
    }),

    // ----------------------------------------------------------- Instruktörer
    instruktorer: collection({
      label: 'Instruktörer',
      slugField: 'namn',
      path: 'src/content/instruktorer/*/',
      format: { contentField: 'bio' },
      entryLayout: 'content',
      columns: ['namn', 'roll'],
      schema: {
        namn: fields.slug({
          name: {
            label: 'Namn',
            validation: { isRequired: true },
          },
        }),
        roll: fields.text({
          label: 'Roll i klubben',
          description: 'Till exempel "Huvudtränare" eller "Tränare barngrupp".',
          validation: { isRequired: true },
        }),
        foto: fields.image({
          label: 'Foto',
          description:
            'Porträttbild. Bilden optimeras automatiskt — ladda gärna upp direkt från mobilen.',
          directory: 'src/assets/instruktorer',
          publicPath: '/src/assets/instruktorer/',
        }),
        fotoAlt: fields.text({
          label: 'Bildbeskrivning (alt-text)',
          description: 'Till exempel "Porträtt av Sabrina i träningskläder".',
        }),
        ordning: fields.integer({
          label: 'Ordning',
          description:
            'Styr i vilken ordning instruktörerna visas. Lägre tal visas först.',
          defaultValue: 100,
          validation: { isRequired: true },
        }),
        bio: fields.markdoc({
          label: 'Presentation',
        }),
      },
    }),

    // ------------------------------------------------------- Träningsgrupper
    traningsgrupper: collection({
      label: 'Träningsgrupper',
      slugField: 'namn',
      path: 'src/content/traningsgrupper/*/',
      format: { data: 'json' },
      columns: ['namn', 'aldersspann'],
      schema: {
        namn: fields.slug({
          name: {
            label: 'Namnet på gruppen',
            description: 'Till exempel "Ungdomar" eller "Vuxna Steg 1".',
            validation: { isRequired: true },
          },
        }),
        aldersspann: fields.text({
          label: 'Åldersspann',
          description: 'Till exempel "11–14 år" eller "21 år och uppåt".',
          validation: { isRequired: true },
        }),
        kortBeskrivning: fields.text({
          label: 'Kort beskrivning',
          description:
            'Två till tre meningar om vad gruppen tränar och vem den passar.',
          multiline: true,
          validation: { isRequired: true },
        }),
        farg: fields.select({
          label: 'Färg i schemat',
          description:
            'Gruppens färg används för att märka upp passen i veckoschemat.',
          options: [...FARGER],
          defaultValue: 'ungdomar',
        }),
        ordning: fields.integer({
          label: 'Ordning',
          description: 'Lägre tal visas först.',
          defaultValue: 100,
          validation: { isRequired: true },
        }),
      },
    }),

    // --------------------------------------------------------------- Terminer
    terminer: collection({
      label: 'Terminer',
      slugField: 'namn',
      path: 'src/content/terminer/*/',
      format: { data: 'json' },
      columns: ['namn', 'aktiv'],
      schema: {
        namn: fields.slug({
          name: {
            label: 'Terminens namn',
            description: 'Till exempel "Vårterminen 2026".',
            validation: { isRequired: true },
          },
        }),
        start: fields.date({
          label: 'Startdatum',
          validation: { isRequired: true },
        }),
        slut: fields.date({
          label: 'Slutdatum',
          validation: { isRequired: true },
        }),
        aktiv: fields.checkbox({
          label: 'Aktiv termin',
          description:
            'Schemat och priserna för den aktiva terminen är de som visas på webbplatsen. Markera bara en termin som aktiv.',
          defaultValue: false,
        }),
      },
    }),

    // ----------------------------------------------------------------- Schema
    schema: collection({
      label: 'Schema',
      slugField: 'id',
      path: 'src/content/schema/*/',
      format: { data: 'json' },
      columns: ['id', 'dag'],
      schema: {
        id: fields.slug({
          name: {
            label: 'Intern beteckning',
            description:
              'Bara för att hålla isär passen i listan, till exempel "mandag-1730-ungdomar". Visas inte på webbplatsen.',
            validation: { isRequired: true },
          },
        }),
        dag: fields.select({
          label: 'Dag',
          options: [...DAGAR],
          defaultValue: 'mandag',
        }),
        start: fields.text({
          label: 'Starttid',
          description: 'Skrivs som TT:MM, till exempel 17:30.',
          validation: { isRequired: true, pattern: { regex: /^\d{2}:\d{2}$/ } },
        }),
        slut: fields.text({
          label: 'Sluttid',
          description: 'Skrivs som TT:MM, till exempel 18:40.',
          validation: { isRequired: true, pattern: { regex: /^\d{2}:\d{2}$/ } },
        }),
        grupp: fields.relationship({
          label: 'Träningsgrupp',
          collection: 'traningsgrupper',
          validation: { isRequired: true },
        }),
        termin: fields.relationship({
          label: 'Termin',
          description: 'Vilken termin passet tillhör.',
          collection: 'terminer',
          validation: { isRequired: true },
        }),
        notering: fields.text({
          label: 'Notering',
          description:
            'Valfri kommentar som visas vid passet, till exempel "Endast med full utrustning".',
        }),
      },
    }),

    // ----------------------------------------------------------------- Priser
    priser: collection({
      label: 'Priser',
      slugField: 'id',
      path: 'src/content/priser/*/',
      format: { data: 'json' },
      columns: ['id', 'belopp'],
      schema: {
        id: fields.slug({
          name: {
            label: 'Intern beteckning',
            description:
              'Bara för att hålla isär priserna i listan, till exempel "var-2026-ungdomar". Visas inte på webbplatsen.',
            validation: { isRequired: true },
          },
        }),
        grupp: fields.relationship({
          label: 'Träningsgrupp',
          collection: 'traningsgrupper',
          validation: { isRequired: true },
        }),
        belopp: fields.integer({
          label: 'Belopp i kronor',
          description: 'Skriv bara siffror, till exempel 1000.',
          validation: { isRequired: true },
        }),
        periodEtikett: fields.text({
          label: 'Period',
          description: 'Till exempel "per termin" eller "juni–augusti".',
          defaultValue: 'per termin',
          validation: { isRequired: true },
        }),
        termin: fields.relationship({
          label: 'Termin',
          collection: 'terminer',
          validation: { isRequired: true },
        }),
      },
    }),
  },

  singletons: {
    // ----------------------------------------------------------- Inställningar
    installningar: singleton({
      label: 'Inställningar',
      path: 'src/content/installningar/',
      format: { data: 'json' },
      schema: {
        heroRubrik: fields.text({
          label: 'Rubrik på startsidan',
          multiline: true,
          validation: { isRequired: true },
        }),
        heroText: fields.text({
          label: 'Text under rubriken',
          multiline: true,
          validation: { isRequired: true },
        }),
        discipliner: fields.array(
          fields.text({ label: 'Disciplin' }),
          {
            label: 'Discipliner',
            description: 'Visas som etiketter i toppen, till exempel Kickboxning.',
            itemLabel: (props) => props.value || 'Disciplin',
          },
        ),
        ctaText: fields.text({
          label: 'Text på knappen',
          defaultValue: 'Prova gratis 1 vecka',
          validation: { isRequired: true },
        }),
        sportadminUrl: fields.url({
          label: 'Länk till anmälan (SportAdmin)',
          description: 'Knapparna "Prova gratis" och "Anmäl dig" leder hit.',
          validation: { isRequired: true },
        }),

        omRubrik: fields.text({
          label: 'Rubrik för Om oss',
          defaultValue: 'Om oss',
          validation: { isRequired: true },
        }),
        omText: fields.markdoc.inline({
          label: 'Text om klubben',
        }),

        trygghetRubrik: fields.text({
          label: 'Rubrik för trygghetsavsnittet',
          defaultValue: 'Trygghet för våra barn och ungdomar',
          validation: { isRequired: true },
        }),
        trygghetText: fields.markdoc.inline({
          label: 'Text om trygghet',
          description:
            'Här beskrivs polisutdrag, att två tränare alltid är närvarande och hur klubben hanterar bilder.',
        }),

        medlemsavgift: fields.integer({
          label: 'Medlemsavgift per år (kronor)',
          defaultValue: 200,
          validation: { isRequired: true },
        }),
        prisNotering: fields.text({
          label: 'Notering vid priserna',
          multiline: true,
          description:
            'Till exempel "Nya medlemmar betalar medlemsavgiften första året".',
        }),

        epost: fields.text({
          label: 'E-postadress',
          validation: { isRequired: true },
        }),
        gatuadress: fields.text({
          label: 'Gatuadress',
          validation: { isRequired: true },
        }),
        postnummer: fields.text({
          label: 'Postnummer',
          validation: { isRequired: true },
        }),
        ort: fields.text({ label: 'Ort', validation: { isRequired: true } }),
        kartlank: fields.url({
          label: 'Länk till karta',
          description: 'Öppnas när besökaren klickar på kartan.',
        }),

        facebook: fields.url({ label: 'Facebook' }),
        instagram: fields.url({ label: 'Instagram' }),
        tiktok: fields.url({ label: 'TikTok' }),

        sponsorRubrik: fields.text({
          label: 'Rubrik för sponsor',
          defaultValue: 'Stöd klubben genom Gräsroten',
        }),
        sponsorText: fields.text({
          label: 'Text om sponsring',
          multiline: true,
        }),
        sponsorLank: fields.url({ label: 'Länk till sponsorsidan' }),

        seoTitel: fields.text({
          label: 'Sidtitel för Google',
          validation: { isRequired: true },
        }),
        seoBeskrivning: fields.text({
          label: 'Beskrivning för Google',
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 200 } },
        }),
      },
    }),
  },
});

# Borgen Fight Center

Webbplats för Borgen Fight Center — ideell kickboxnings-, thaiboxnings- och
K1-klubb i Malmö. Byggd med [Astro](https://astro.build) och
[Keystatic](https://keystatic.com) som redigeringsverktyg.

---

## För styrelsen: så redigerar du webbplatsen

Allt innehåll på sajten går att ändra utan att röra koden. Du redigerar i ett
gränssnitt som heter Keystatic.

**Öppna redigeringsläget:** gå till `/keystatic` på webbplatsen (längst ned på
sidan finns länken "Redigera webbplatsen").

Menyn till vänster är indelad i tre delar:

### Innehåll

| Vad | Vad du kan ändra |
| --- | --- |
| **Nyheter** | Skriv nya inlägg, redigera gamla. Varje nyhet får en egen sida. Kryssrutan **Publicerad** styr om nyheten syns — avmarkera för att spara som utkast. |
| **Instruktörer** | Namn, roll, foto och presentationstext. Fältet **Ordning** styr i vilken ordning tränarna visas (lägre tal först). |

### Träning

| Vad | Vad du kan ändra |
| --- | --- |
| **Träningsgrupper** | Grupperna (Barn, Ungdomar, Juniorer, Vuxna Steg 1 och 2, Sparring): namn, åldersspann, beskrivning och färg i schemat. |
| **Schema** | Ett pass per post: dag, tid, grupp och termin. Lägg till, ändra tid eller ta bort — schemat på sajten uppdateras automatiskt. |
| **Priser** | Terminsavgift per grupp. Medlemsavgiften ligger under Inställningar. |
| **Terminer** | Vår-, höst- och sommarterminer. **Viktigt:** schemat och priserna som visas på sajten är de som hör till den termin som är markerad som **Aktiv**. Markera bara en termin som aktiv åt gången. |

### Webbplats

| Vad | Vad du kan ändra |
| --- | --- |
| **Inställningar** | Rubriken på startsidan, texten om klubben, trygghetstexten, medlemsavgift, adress, e-post, länkar till Facebook/Instagram/TikTok, länken till SportAdmin, sponsortexten och texten som Google visar. |

### Att byta termin — den vanligaste uppgiften

1. Gå till **Terminer** och skapa den nya terminen (namn, start- och slutdatum).
2. Gå till **Schema** och lägg in passen. Välj den nya terminen i fältet *Termin*.
3. Gå till **Priser** och lägg in terminsavgifterna, också de kopplade till den
   nya terminen.
4. Gå tillbaka till **Terminer**, markera den nya terminen som **Aktiv** och
   avmarkera den gamla.

Det gamla schemat och de gamla priserna ligger kvar men visas inte — praktiskt
om något behöver kontrolleras i efterhand.

### Bilder

Ladda upp bilder direkt i formulären. Du kan använda bilder tagna med mobilen —
de skalas om automatiskt. Fyll alltid i fältet **Bildbeskrivning (alt-text)**;
den läses upp för besökare som använder skärmläsare.

---

## För utvecklare

### Komma igång

```sh
npm install
npm run dev          # http://localhost:4321 — redigering på /keystatic
npm run build        # produktionsbygge till dist/
npm run preview      # kör det byggda resultatet
```

### Så hänger det ihop

- **`keystatic.config.ts`** — innehållsmodellen. Alla fältetiketter är på
  svenska. Sju innehållstyper: nyheter, instruktörer, träningsgrupper, terminer,
  schema, priser och inställningar.
- **`src/content/`** — innehållet, som vanliga filer i repot. Keystatic skriver
  hit; sajten läser härifrån. Ingen databas, ingen extern tjänst.
- **`src/lib/innehall.ts`** — läser datafilerna (grupper, schema, priser,
  terminer, inställningar) och innehåller logiken för veckoschemat och
  prislistan.
- **`src/content.config.ts`** — Astro content-collections för de två typer som
  har brödtext i Markdoc (nyheter och instruktörer).
- **`src/styles/global.css`** — designsystemet: färg, typsnitt, typskala och
  avstånd som Tailwind-tokens.
- **`src/components/`** — sektionerna på startsidan, en fil per sektion.

Sidorna byggs statiskt. Node-adaptern finns med enbart för att
Keystatic-gränssnittet på `/keystatic` behöver köras på servern.

### Innehållets filstruktur

Keystatic avgör var filerna hamnar utifrån om sökvägen i konfigurationen slutar
med `/`. Alla samlingar här använder avslutande snedstreck, vilket ger en mapp
per post med en `index`-fil i:

```
src/content/nyheter/varterminen-2026/index.mdoc
src/content/traningsgrupper/ungdomar/index.json
src/content/installningar/index.json
```

Tar man bort snedstrecket skriver Keystatic i stället `ungdomar.json` — och då
slutar sajten hitta innehållet.

### Redigering online för styrelsen

Just nu står lagringen på `local` i `keystatic.config.ts`, vilket betyder att
redigering sker lokalt. För att styrelsen ska kunna redigera direkt i webbläsaren
mot GitHub:

1. Byt `storage` till `{ kind: 'github', repo: 'Momme17/glen' }`.
2. Skapa en GitHub-app enligt Keystatics guide och lägg in nycklarna som
   miljövariabler.
3. Deploya till en värd som kör Node (Netlify, Vercel, Fly.io eller egen server).

Varje ändring en redaktör gör blir då en commit i repot.

### Att göra innan lansering

- **Logotypen.** `src/components/Logotyp.astro` innehåller ett ordmärke ritat i
  kod som platshållare. Lägg klubbens riktiga SVG i `src/assets/logo/` och byt ut
  innehållet.
- **Foton.** Inga bilder är migrerade — instruktörerna visas med initial tills
  foton laddats upp. Nyheter fungerar med eller utan omslagsbild.
- **Kontrollera schemat.** Tiderna är hämtade från den gamla sajten och bör
  stämmas av mot verkligheten, särskilt dagtidspassen.
- **Kontrollera nyhetsdatum.** Den gamla sajten visade inte alltid datum; de som
  saknades är satta utifrån innehållet och bör rättas.

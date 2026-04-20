#!/usr/bin/env node
// Applies scraped metadata from trondknutli.no to existing markdown files.
// Run: node scripts/apply-metadata.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKS_DIR = path.resolve(__dirname, '..', 'src', 'content', 'works');

// --- Scraped metadata from trondknutli.no ---
// Keys are lowercase slug-like versions of titles for fuzzy matching.

const metadata = [
  // Front page / main collection
  { match: ['ode-til-kvinna', 'ode til kvinna'], technique: 'Håndkolorert koldnål særtrykk', dimensions: '102×144 cm', availability: 'sold', price: '' },
  { match: ['kontemplasjon'], technique: 'Linosnitt/elementtrykk (særtrykk)', dimensions: '75×105 cm', price: '10 000 kr', availability: 'original' },
  { match: ['destinasjon-ukjent', 'destinasjon ukjent'], technique: 'Linosnitt/elementtrykk', dimensions: '147×94 cm', price: '25 000 kr', availability: 'original' },
  { match: ['tk-nattdikt', 'nattdikt'], technique: 'Linosnitt/elementtrykk (særtrykk)', dimensions: '100×200 cm', price: '20 000 kr', availability: 'original' },
  { match: ['homage', 'homage-a-goethe'], technique: 'Elementtrykk TRIPTYK', dimensions: '265×202 cm', price: '45 000 kr', availability: 'original' },
  { match: ['nattryttere'], technique: 'Serigrafi (1981)', dimensions: '', availability: 'sold', price: '' },
  { match: ['sort-luciagutt', 'sort luciagutt'], technique: 'Håndkolorert litografi', dimensions: '29×26 cm', price: '2 500 kr', availability: 'original' },
  { match: ['blatt-lemurisk', 'blatt lemurisk'], technique: 'Linosnitt/elementtrykk', dimensions: '96×57 cm', availability: 'sold', price: '' },
  { match: ['nocturne', 'noctrne'], technique: 'Elementtrykk', dimensions: '', availability: 'digital', price: '' },
  { match: ['kriger-og-fugl', 'kriger og fugl'], technique: 'Elementtrykk/koldnål', dimensions: '70×100 cm', availability: 'sold', price: '' },
  { match: ['kronos-eter-sine-barn'], technique: 'Linosnitt/elementtrykk', dimensions: '72×103 cm', availability: 'sold', price: '' },
  { match: ['gjennom-leden'], technique: 'Linosnitt/elementtrykk', dimensions: '80×100 cm', availability: 'sold', price: '' },
  { match: ['sareptas-krukke'], technique: 'Serigrafi', dimensions: '35×55 cm', availability: 'sold', price: '' },
  { match: ['duellen'], technique: 'Elementtrykk', dimensions: '', availability: 'digital', price: '' },
  { match: ['stemningsfragment'], technique: 'Litografi', dimensions: '', availability: 'digital', price: '' },
  { match: ['vinterkriger'], technique: 'Serigrafi', dimensions: '', price: '5 000 kr', availability: 'original' },
  { match: ['gevir'], technique: 'Elementtrykk', dimensions: '', availability: 'digital', price: '' },

  // Grand Tour series
  { match: ['grand-tour-1', 'grand tour 1'], technique: 'Serigrafi', dimensions: '69×40 cm', price: '3 500 kr', year: 1986, availability: 'original' },
  { match: ['grand-tour-2', 'grand tour 2'], technique: 'Serigrafi', dimensions: '44×66 cm', price: '3 500 kr', year: 1986, availability: 'original' },
  { match: ['grand-tour-3', 'grand tour 3'], technique: 'Serigrafi', dimensions: '44×66 cm', price: '3 500 kr', year: 1986, availability: 'original' },
  { match: ['grand-tour-4', 'grand tour 4'], technique: 'Serigrafi', dimensions: '94×45 cm', price: '6 500 kr', year: 1986, availability: 'original' },
  { match: ['grand-tour-v', 'grand tour v', 'grand-tour-5'], technique: 'Serigrafi', dimensions: '', year: 1988, price: 'Etter forespørsel', availability: 'original' },
  { match: ['grand-tour-vi', 'grand tour vi'], technique: 'Serigrafi', dimensions: '', availability: 'original', price: '' },
  { match: ['grand-tour-i', 'grand tour i'], technique: 'Serigrafi', dimensions: '', availability: 'original', price: '' },
  { match: ['grand-tour-ii-1986', 'grand tour ii'], technique: 'Serigrafi', dimensions: '', year: 1986, availability: 'original', price: '' },
  { match: ['marslandskap'], technique: 'Serigrafi', dimensions: '', price: 'Etter forespørsel', availability: 'original' },
  { match: ['atmosfaeriske-forstyrrelser', 'atmosferiske forstyrrelser'], technique: 'Serigrafi', dimensions: '50×41 cm', price: '3 500 kr', year: 1981, availability: 'original' },
  { match: ['departure'], technique: 'Akryl på papir', dimensions: '', availability: 'sold', price: '' },
  { match: ['landskap-ii'], technique: 'Linosnitt', dimensions: '', availability: 'sold', price: '' },
  { match: ['rod-titan', 'rod titan'], technique: 'Serigrafi', dimensions: '80×55 cm', price: '5 000 kr', availability: 'original' },
  { match: ['budbringer'], technique: 'Serigrafi', dimensions: '68×40 cm', price: '5 000 kr', year: 1986, availability: 'original' },
  { match: ['astro-lady'], technique: 'Serigrafi', dimensions: '40×53 cm', price: '5 000 kr', availability: 'original' },
  { match: ['kosmisk-flue'], technique: 'Akryl/kritt på papir', dimensions: '', availability: 'sold', price: '' },

  // Kunstgrafiske trykk
  { match: ['rosalill', 'dans-dans-rosalill'], technique: 'Håndkolorert koldnål', dimensions: '41×34 cm', price: '5 000 kr', availability: 'original' },
  { match: ['den-store-sjoreisen', 'sjoreisen-sort'], technique: 'Koldnål/etsning (håndkolorert)', dimensions: '44×33 cm', price: '5 000 kr', availability: 'original' },
  { match: ['knut-steen'], technique: 'Håndkolorert koldnål', dimensions: '', availability: 'digital', price: '' },
  { match: ['lek'], technique: 'Håndkolorert litografi', dimensions: '54×33 cm', price: '5 000 kr', availability: 'original' },
  { match: ['kyl1', 'kylling-pa-hjul'], technique: 'Håndkolorert photogravure', dimensions: '39×30 cm', availability: 'sold', price: '' },

  // Vinter-serien (ski jumpers)
  { match: ['kongsbergknekken'], technique: 'Etsning', dimensions: '', availability: 'digital', price: '' },
  { match: ['helmuth-recknagel'], technique: 'Etsning', dimensions: '', availability: 'digital', price: '' },
  { match: ['espen-b'], technique: 'Etsning', dimensions: '', availability: 'digital', price: '' },
  { match: ['toralf-engan'], technique: 'Etsning', dimensions: '', availability: 'digital', price: '' },
  { match: ['hyllest-til-anette-ii'], technique: 'Litografi', dimensions: '', availability: 'digital', price: '' },
  { match: ['hyllest-til-anette-iii'], technique: 'Litografi', dimensions: '', availability: 'digital', price: '' },
  { match: ['hyllest-til-anette-iiii'], technique: 'Litografi', dimensions: '', availability: 'digital', price: '' },
  { match: ['hyllest-til-anette-iii-sh', 'hyllest-til-anette-iii-svart-hvitt'], technique: 'Litografi', dimensions: '', availability: 'digital', price: '' },
  { match: ['hyllest-til-anette-iiii-sh', 'hyllest-til-anette-iiii-svart-hvitt'], technique: 'Litografi', dimensions: '', availability: 'digital', price: '' },

  // Natur og Miljø
  { match: ['trekl', 'treklover'], technique: 'Håndkolorert koldnål', dimensions: '48,5×50 cm', price: '6 000 kr / 1 750 kr digital', availability: 'original' },
  { match: ['siste-klover', 'siste klover'], technique: 'Håndkolorert koldnål', dimensions: '48,5×50 cm', price: '6 000 kr / 1 750 kr digital', availability: 'original', series: 'klover' },
  { match: ['hyllest-til-thor-sjofarer'], technique: 'Linosnitt', dimensions: '', availability: 'digital', price: '' },
  { match: ['svalene-kommer', 'svalene kommer'], technique: 'Linosnitt/elementtrykk/særtrykk', dimensions: '103×166 cm', price: 'Etter forespørsel', availability: 'original' },
  { match: ['mastodont'], technique: 'Linosnitt/elementtrykk/særtrykk', dimensions: '177×92 cm', price: 'Etter forespørsel', availability: 'original' },
  { match: ['puma'], technique: 'Linosnitt', dimensions: '', availability: 'digital', price: '' },

  // Stjernetegn — all same technique & price
  ...['virgo','aries','taurus','scorpio','sagittarius','pisces','libra','leo','cancer','capricorn','gemini','aquarius'].map(z => ({
    match: [z], technique: 'Håndkolorert akvarell', dimensions: '', price: '2 250 kr', availability: 'original', series: 'stjernetegn',
  })),

  // 70s-80s critical realism
  { match: ['byrakratens-drommereise', 'byrakratens drommereise'], technique: 'Serigrafi', dimensions: '', availability: 'sold', price: '' },
  { match: ['dystopi'], technique: 'Serigrafi', dimensions: '', availability: 'sold', price: '' },
  { match: ['saigon'], technique: 'Serigrafi', dimensions: '', availability: 'sold', price: '' },
  { match: ['norse-petroleum'], technique: 'Serigrafi', dimensions: '', year: 1977, availability: 'sold', price: '' },
  { match: ['outsider-1979', 'outsider'], technique: 'Serigrafi', dimensions: '', year: 1979, availability: 'sold', price: '' },
  { match: ['outsider-ii'], technique: 'Serigrafi', dimensions: '', year: 1980, availability: 'sold', price: '' },
  { match: ['reitgjerdet-ii'], technique: 'Serigrafi', dimensions: '', year: 1980, availability: 'sold', price: '' },
  { match: ['reitgjerdet'], technique: 'Serigrafi', dimensions: '', availability: 'sold', price: '' },
  { match: ['uten-tittel'], technique: 'Serigrafi', dimensions: '', year: 1983, availability: 'sold', price: '' },
  { match: ['bravo-i-og-ii'], technique: 'Elementtrykk/dyptrykk', dimensions: '', availability: 'sold', price: '' },
  { match: ['globalisering'], technique: 'Serigrafi', dimensions: '', availability: 'sold', price: '' },
  { match: ['flygende-titan'], technique: 'Serigrafi', dimensions: '', availability: 'sold', price: '' },
  { match: ['triptyk'], technique: 'Elementtrykk', dimensions: '', availability: 'sold', price: '' },

  // Misc
  { match: ['kontemplasjon-ii'], technique: 'Elementtrykk', dimensions: '', availability: 'digital', price: '' },
  { match: ['saigon'], technique: 'Serigrafi', dimensions: '', availability: 'sold', price: '' },
  { match: ['arabisk-var', 'arabisk var'], technique: 'Elementtrykk', dimensions: '', availability: 'digital', price: '' },
];

// --- match & update ---

const files = fs.readdirSync(WORKS_DIR).filter(f => f.endsWith('.md'));
let updated = 0;
let matched = 0;

for (const file of files) {
  const slug = file.replace('.md', '');
  const filePath = path.join(WORKS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Find best match
  const entry = metadata.find(m =>
    m.match.some(pattern => slug === pattern || slug.startsWith(pattern + '-') || slug.includes(pattern))
  );

  if (!entry) continue;
  matched++;

  let changed = false;

  if (entry.technique) {
    const old = content.match(/^technique: ".*"$/m)?.[0];
    const rep = `technique: "${entry.technique}"`;
    if (old && old !== rep) { content = content.replace(old, rep); changed = true; }
  }

  if (entry.dimensions) {
    const old = content.match(/^dimensions: ".*"$/m)?.[0];
    const rep = `dimensions: "${entry.dimensions}"`;
    if (old && old !== rep) { content = content.replace(old, rep); changed = true; }
  }

  if (entry.availability) {
    const old = content.match(/^availability: ".*"$/m)?.[0];
    const rep = `availability: "${entry.availability}"`;
    if (old && old !== rep) { content = content.replace(old, rep); changed = true; }
  }

  if (entry.year) {
    const old = content.match(/^year: .*$/m)?.[0];
    const rep = `year: ${entry.year}`;
    if (old && old !== rep) { content = content.replace(old, rep); changed = true; }
  }

  if (entry.series) {
    const old = content.match(/^series: .*$/m)?.[0];
    const rep = `series: "${entry.series}"`;
    if (old && old !== rep) { content = content.replace(old, rep); changed = true; }
  }

  if (entry.price) {
    // Add price field if not present
    if (!content.includes('price:')) {
      content = content.replace(/^imageAlt:/m, `price: "${entry.price}"\nimageAlt:`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    updated++;
    console.log(`  ✓ ${slug}`);
  }
}

console.log(`\n✓ Matched ${matched} works, updated ${updated} files.`);
console.log(`  ${files.length - matched} works had no match (need manual metadata).`);

#!/usr/bin/env node
// Creates markdown entries for the missing works and downloads product page images
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const WORKS_DIR = 'src/content/works';
const IMAGES_DIR = 'public/images/works';

const newWorks = [
  // Product pages — metadata from earlier scrape
  {
    title: 'Ved Havet', slug: 'ved-havet',
    technique: 'Håndkolorert koldnål/elementtrykk', dimensions: '66×59,5 cm',
    availability: 'digital', price: '', section: 'verker',
    imageUrl: 'https://www.trondknutli.no/butikk/p/havet',
  },
  {
    title: 'Trekløver', slug: 'treklover',
    technique: 'Håndkolorert koldnål', dimensions: '48,5×50 cm',
    availability: 'original', price: '6 000 kr', section: 'verker',
    imageUrl: 'https://www.trondknutli.no/butikk/p/treklver',
  },
  {
    title: 'Grønt Skifte', slug: 'gront-skifte',
    technique: 'Elementtrykk', dimensions: '36,5×48,5 cm',
    availability: 'digital', price: '', section: 'verker',
    imageUrl: 'https://www.trondknutli.no/butikk/p/grnt-skifte',
  },
  {
    title: 'Rådyr og Jeger', slug: 'radyr-og-jeger',
    technique: 'Fargelavering', dimensions: '79×67 cm',
    availability: 'digital', price: '', section: 'verker',
    imageUrl: 'https://www.trondknutli.no/butikk/p/rdyr-og-jeger',
  },
  {
    title: 'Grønt Føll', slug: 'gront-foll',
    technique: 'Elementtrykk/særtrykk', dimensions: '48,5×36,5 cm',
    availability: 'digital', price: '', section: 'verker',
    imageUrl: 'https://www.trondknutli.no/butikk/p/grnt-fll',
  },
  {
    title: 'Gullføll i Grønn Vår', slug: 'gullfoll-i-gronn-var',
    technique: 'Elementtrykk/særtrykk', dimensions: '48,5×36,5 cm',
    availability: 'digital', price: '', section: 'verker',
    imageUrl: 'https://www.trondknutli.no/butikk/p/gullfll-i-grnn-vr',
  },
  {
    title: 'Sort Hest i Rød Høst', slug: 'sort-hest-i-rod-host',
    technique: 'Elementtrykk/særtrykk', dimensions: '48,5×36,5 cm',
    availability: 'digital', price: '', section: 'verker',
    imageUrl: 'https://www.trondknutli.no/butikk/p/sort-hest-i-rd-hst',
  },
  {
    title: 'Gutt med Blå Fjær', slug: 'gutt-med-bla-fjaer',
    technique: 'Etsning/dyptrykk', dimensions: '47×68 cm',
    availability: 'original', price: '5 000 kr', section: 'verker',
    imageUrl: 'https://www.trondknutli.no/butikk/p/gutt-med-bl-fjr',
  },
  {
    title: 'Ut mot Havet', slug: 'ut-mot-havet',
    technique: 'Akryl på lerret', dimensions: '120×56 cm',
    availability: 'original', price: '8 000 kr', section: 'verker',
    imageUrl: 'https://www.trondknutli.no/butikk/p/ut-mot-havet',
  },
  // Direct image links with inline metadata
  {
    title: 'Rødt Lemurisk Landskap', slug: 'rodt-lemurisk-landskap',
    technique: 'Linosnitt/elementtrykk', dimensions: '96×57 cm',
    availability: 'sold', price: '', section: 'verker',
    localImage: 'rodt-lemurisk-landskap.jpg',
  },
  {
    title: 'Tattoo', slug: 'tattoo',
    technique: 'Akryl på papir', dimensions: '55×75 cm',
    availability: 'sold', price: '', section: 'verker',
    localImage: 'tattoo.jpg',
  },
  {
    title: 'Undring 1', slug: 'undring-1',
    technique: '', dimensions: '',
    availability: 'digital', price: '', section: 'verker',
    imageUrl: 'https://www.trondknutli.no/bilder?itemId=6p3apiryirsrl3wygxoxcywg3kc993',
  },
  {
    title: 'Undring 2', slug: 'undring-2',
    technique: '', dimensions: '',
    availability: 'digital', price: '', section: 'verker',
    imageUrl: 'https://www.trondknutli.no/bilder?itemId=06mro8bi6tlejknvuaof9ez370aira',
  },
  {
    title: 'Trofé', slug: 'trofe',
    technique: 'Linosnitt', dimensions: '',
    availability: 'digital', price: '', section: 'verker',
    localImage: 'trofe.jpg',
  },
  {
    title: 'Trofé (Bukk)', slug: 'trofe-bukk',
    technique: 'Linosnitt', dimensions: '',
    availability: 'digital', price: '', section: 'verker',
    localImage: 'trofe-bukk.jpg',
  },
  // Cinque Terre series
  { title: 'Cinque Terre 1', slug: 'cinque-terre-1', technique: 'Akryl', dimensions: '', availability: 'digital', price: '', section: 'verker', localImage: 'cinque-terre-1.jpg' },
  { title: 'Cinque Terre 2', slug: 'cinque-terre-2', technique: 'Akryl', dimensions: '', availability: 'digital', price: '', section: 'verker', localImage: 'cinque-terre-2.jpg' },
  { title: 'Cinque Terre 3', slug: 'cinque-terre-3', technique: 'Akryl', dimensions: '', availability: 'digital', price: '', section: 'verker', localImage: 'cinque-terre-3.jpg' },
  { title: 'Cinque Terre 4', slug: 'cinque-terre-4', technique: 'Akryl', dimensions: '', availability: 'digital', price: '', section: 'verker', localImage: 'cinque-terre-4.jpg' },
  { title: 'Cinque Terre 5', slug: 'cinque-terre-5', technique: 'Akryl', dimensions: '', availability: 'digital', price: '', section: 'verker', localImage: 'cinque-terre-5.jpg' },
  { title: 'Cinque Terre 6', slug: 'cinque-terre-6', technique: 'Akryl', dimensions: '', availability: 'digital', price: '', section: 'verker', localImage: 'cinque-terre-6.jpg' },
  { title: 'Cinque Terre 7', slug: 'cinque-terre-7', technique: 'Akryl', dimensions: '', availability: 'digital', price: '', section: 'verker', localImage: 'cinque-terre-7.jpg' },
  { title: 'Cinque Terre 8', slug: 'cinque-terre-8', technique: 'Akryl', dimensions: '', availability: 'digital', price: '', section: 'verker', localImage: 'cinque-terre-8.png' },
];

let created = 0;
for (const w of newWorks) {
  const imagePath = w.localImage
    ? `/images/works/${w.localImage}`
    : `/images/works/${w.slug}.jpg`;

  // Skip if markdown already exists
  const mdPath = path.join(WORKS_DIR, `${w.slug}.md`);
  if (fs.existsSync(mdPath)) {
    console.log(`  skip: ${w.slug} (exists)`);
    continue;
  }

  const fm = [
    '---',
    `title: "${w.title}"`,
    `slug: "${w.slug}"`,
    `year: null`,
    `technique: "${w.technique}"`,
    `dimensions: "${w.dimensions}"`,
    `section: "${w.section}"`,
    `availability: "${w.availability}"`,
    `featured: false`,
    w.price ? `price: "${w.price}"` : null,
    `image: "${imagePath}"`,
    `imageAlt: "${w.title}"`,
    '---',
    '',
  ].filter(Boolean).join('\n');

  fs.writeFileSync(mdPath, fm);
  created++;
  console.log(`  ✓ ${w.slug}`);
}

console.log(`\nCreated ${created} new work entries.`);
console.log('Note: Product page images need to be downloaded separately via curl.');

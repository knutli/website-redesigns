#!/usr/bin/env node
// Generates work markdown files + copies images to public/images/works/
// Run once: `node scripts/build-content.mjs`

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_IMAGES = path.join(ROOT, 'images');
const DEST_IMAGES = path.join(ROOT, 'public', 'images', 'works');
const WORKS_DIR = path.join(ROOT, 'src', 'content', 'works');

fs.mkdirSync(DEST_IMAGES, { recursive: true });
fs.mkdirSync(WORKS_DIR, { recursive: true });

// --- helpers ----------------------------------------------------------------

function decode(name) {
  try {
    return decodeURIComponent(name.replace(/%25/g, '%'));
  } catch {
    return name;
  }
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(str) {
  // Keep Norwegian lowercase grammar words, capitalise others
  const small = new Set(['og', 'i', 'til', 'for', 'av', 'en', 'et', 'den', 'det', 'de', 'på', 'er', 'som', 'med', 'fra', 'over', 'under']);
  return str
    .split(/\s+/)
    .map((w, idx) => {
      const lower = w.toLowerCase();
      if (idx > 0 && small.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function extractYear(name) {
  const m = name.match(/\b(19[6-9]\d|20[0-2]\d)\b/);
  return m ? parseInt(m[1], 10) : null;
}

function cleanTitle(rawName) {
  let t = rawName;
  // Strip extension
  t = t.replace(/\.[a-z0-9]+$/i, '');
  // Strip redigert variants
  t = t.replace(/-?\s*redigert[_\s]*(web|2)?/gi, '');
  t = t.replace(/_web\b/gi, '');
  t = t.replace(/\bsvart hvitt\b/gi, '(s/h)');
  // Strip trailing numbering / version indicators: "(2)", "v2", "_01"
  t = t.replace(/\s*\(\d+\)\s*$/g, '');
  t = t.replace(/\s*v\d+\s*$/gi, '');
  t = t.replace(/_\d+$/g, '');
  t = t.replace(/\s+-\s*$/g, '');
  // Collapse whitespace
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

// Decide section and series from title
function classify(title, year) {
  const lower = title.toLowerCase();

  // Zodiac signs → stjernetegn series, verker
  const zodiac = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  if (zodiac.some(z => lower === z || lower.startsWith(z + ' '))) {
    return { section: 'verker', series: 'stjernetegn' };
  }

  // Series detection
  if (lower.includes('lemurisk') || lower.includes('lemurisk')) return { section: 'aktuelt', series: 'lemurisk' };
  if (lower.includes('kløver') || lower.includes('klover') || lower.includes('kl%c3%b8ver')) return { section: 'aktuelt', series: 'klover' };
  if (lower.includes('hest') || lower.includes('gevir') || lower.includes('mastodont') || lower.includes('puma')) {
    return { section: 'verker', series: 'hester' };
  }
  if (lower.includes('sjøreise') || lower.includes('sjoreise') || lower.includes('sjoreisen') || lower.includes('sj%c3%b8reisen')) {
    return { section: 'verker', series: 'sjoreise' };
  }
  if (lower.includes('grand tour')) return { section: 'verker', series: null };
  if (lower.includes('skog-int')) return { section: 'aktuelt', series: null };

  // Arkiv: old works (pre-2000) with explicit years
  if (year && year < 2000) return { section: 'arkiv', series: null };

  // Portraits / named homages → verker
  if (lower.includes('hyllest') || lower.includes('homage') || lower.includes('recknagel') || lower.includes('steen') || lower.includes('engan') || lower.includes('espen')) {
    return { section: 'verker', series: null };
  }

  // Default: verker for mid-career, aktuelt for recent/unmarked
  return { section: 'verker', series: null };
}

// Naive technique guess based on filename hints
function guessTechnique(title) {
  const lower = title.toLowerCase();
  if (lower.includes('etsning') || lower.includes('etsing')) return 'Etsning';
  if (lower.includes('koldnål') || lower.includes('koldnal')) return 'Koldnål';
  if (lower.includes('litografi')) return 'Litografi';
  if (lower.includes('særtrykk')) return 'Særtrykk';
  return 'Grafikk';
}

// --- read source ------------------------------------------------------------

const EXCLUDE = new Set([
  'manifest.txt',
  'signatur hvit.png',
  '.DS_Store',
]);

// Raw camera/phone filenames we can't derive a meaningful title from.
// These are studio/atelier photos, not catalog works.
const RAW_FILENAME_RE = /^(20\d{6}|DSCF\d+|IMG_\d+|IMG\d+)/i;

const PORTRAITS = new Set([
  'Trond_Knutli_05.jpg',
  'Trond_Knutli_06.jpg',
  'Trond_Knutli_08.jpg',
  'Trond_Knutli_11.jpg',
  'Trond_Knutli_16 (2).jpg',
]);

const allFiles = fs.readdirSync(SRC_IMAGES)
  .filter(f => !EXCLUDE.has(f))
  .filter(f => !f.startsWith('.'))
  .filter(f => /\.(jpe?g|png|jfif|tiff?|webp)$/i.test(f))
  .filter(f => !RAW_FILENAME_RE.test(f));

// Copy portrait separately
const portraitDest = path.join(ROOT, 'public', 'images', 'portrait.jpg');
if (!fs.existsSync(portraitDest)) {
  const portraitSrc = allFiles.find(f => PORTRAITS.has(f));
  if (portraitSrc) {
    fs.copyFileSync(path.join(SRC_IMAGES, portraitSrc), portraitDest);
  }
}

const workFiles = allFiles.filter(f => !PORTRAITS.has(f));

// Deduplicate by title (some files are clearly duplicates: "Puma.png" + "Puma_2.png",
// "Hyllest til Anette III.jpg" + "… svart hvitt.jpg" etc.)
const seenSlugs = new Map();
const works = [];

// Manual featured list (picked from the clearly important / hero-worthy recent works)
const FEATURED = new Set([
  'ode-til-kvinna-2',
  'destinasjon-ukjent-2',
  'nocturne',
  'kontemplasjon',
  'tk-nattdikt',
  'blatt-lemurisk',
  'duellen',
  'homage',
]);

for (const file of workFiles) {
  const decoded = decode(file);
  const rawTitle = cleanTitle(decoded);
  const title = titleCase(rawTitle);
  const year = extractYear(decoded);
  let { section, series } = classify(rawTitle, year);
  const tempSlug = slugify(rawTitle);
  if (FEATURED.has(tempSlug)) section = 'aktuelt';
  const technique = guessTechnique(rawTitle);

  let slug = slugify(rawTitle);
  if (!slug) slug = slugify(decoded.replace(/\.[a-z0-9]+$/i, ''));
  if (seenSlugs.has(slug)) {
    const n = seenSlugs.get(slug) + 1;
    seenSlugs.set(slug, n);
    slug = `${slug}-${n}`;
  } else {
    seenSlugs.set(slug, 1);
  }

  // Copy image with a safe filename preserving extension
  const ext = path.extname(file).toLowerCase().replace('.jfif', '.jpg');
  const safeFilename = `${slug}${ext}`;
  fs.copyFileSync(path.join(SRC_IMAGES, file), path.join(DEST_IMAGES, safeFilename));

  works.push({
    slug,
    title,
    year,
    section,
    series,
    technique,
    image: `/images/works/${safeFilename}`,
    featured: FEATURED.has(slug),
  });
}

// Write markdown files
let written = 0;
for (const w of works) {
  const fm = [
    '---',
    `title: "${w.title.replace(/"/g, '\\"')}"`,
    `slug: "${w.slug}"`,
    w.year ? `year: ${w.year}` : 'year: null',
    `technique: "${w.technique}"`,
    `dimensions: ""`,
    `section: "${w.section}"`,
    `availability: "${w.section === 'arkiv' ? 'sold' : 'digital'}"`,
    w.featured ? 'featured: true' : 'featured: false',
    w.series ? `series: "${w.series}"` : 'series: null',
    `image: "${w.image}"`,
    `imageAlt: "${w.title.replace(/"/g, '\\"')}"`,
    '---',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(WORKS_DIR, `${w.slug}.md`), fm);
  written++;
}

console.log(`✓ Copied ${workFiles.length} images to public/images/works/`);
console.log(`✓ Wrote ${written} markdown files to src/content/works/`);
console.log(`  Sections: aktuelt=${works.filter(w => w.section === 'aktuelt').length}, verker=${works.filter(w => w.section === 'verker').length}, arkiv=${works.filter(w => w.section === 'arkiv').length}`);
console.log(`  Featured: ${works.filter(w => w.featured).length}`);

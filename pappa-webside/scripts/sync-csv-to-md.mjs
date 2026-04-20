#!/usr/bin/env node
// Syncs verkliste.csv changes back to the markdown frontmatter files.
// Matches by fuzzy title comparison and applies updates.

import fs from 'node:fs';
import path from 'node:path';

const WORKS_DIR = 'src/content/works';
const CSV_PATH = 'verkliste.csv';

// --- Parse semicolon-delimited CSV ---
const csvRaw = fs.readFileSync(CSV_PATH, 'utf-8').trim();
const csvLines = csvRaw.split('\n');
const header = csvLines[0].split(';');
const csvRows = csvLines.slice(1).map(line => {
  const cols = line.split(';');
  return {
    title: cols[0]?.trim() || '',
    year: cols[1]?.trim() || '',
    technique: cols[2]?.trim() || '',
    price: cols[3]?.trim() || '',
    dimensions: cols[4]?.trim() || '',
    dimensionsDigital: cols[5]?.trim() || '',
    availability: cols[6]?.trim() || '',
  };
});

// Map availability labels back to values
const avMap = {
  'original tilgjengelig': 'original',
  'kun digitaltrykk': 'digital',
  'utsolgt': 'sold',
  'under arbeid': 'wip',
};

// --- Read all existing markdown files ---
const mdFiles = fs.readdirSync(WORKS_DIR).filter(f => f.endsWith('.md'));
const works = mdFiles.map(file => {
  const content = fs.readFileSync(path.join(WORKS_DIR, file), 'utf-8');
  const titleMatch = content.match(/^title:\s*"(.+)"$/m);
  return { file, content, title: titleMatch ? titleMatch[1] : '' };
});

// --- Known renames: old md title → new CSV title ---
const renames = {
  'Arabisk Vår 2': 'Mastodont 2',
  'Puma': 'Ut i lyset inn i mørket',
  'Svalene Kommer': 'Arabisk vår (svalene kommer)',
  'Tk-nattdikt': 'Nattdikt',
  'Kyl1': 'Kylling på hjul',
  'Trofé': 'Trofé 1',
  'Trofé (Bukk)': 'Trofé 2',
  'Skog-int': 'Skog 1',    // first match
};

// SKOG-INT handling: we have 3 files (skog-int, skog-int-2, skog-int-3)
const skogMap = {
  'skog-int.md': 'Skog 1',
  'skog-int-2.md': 'Skog 2',
  'skog-int-3.md': 'Skog 3',
};

// Normalize for matching
function norm(s) {
  return s.toLowerCase()
    .replace(/[^\wæøåa-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- Match and update ---
let updated = 0;
let skipped = 0;
const usedCsvRows = new Set();

// Handle known renames and skog map first, then fuzzy match
for (const work of works) {
  let csvRow = null;

  // Check skog map
  if (skogMap[work.file]) {
    csvRow = csvRows.find(r => r.title === skogMap[work.file]);
  }

  // Check known renames
  if (!csvRow && renames[work.title]) {
    csvRow = csvRows.find(r => r.title === renames[work.title]);
  }

  // Exact title match
  if (!csvRow) {
    csvRow = csvRows.find((r, i) => !usedCsvRows.has(i) && norm(r.title) === norm(work.title));
  }

  // Fuzzy: CSV title starts with or contains the md title
  if (!csvRow) {
    csvRow = csvRows.find((r, i) => !usedCsvRows.has(i) && (
      norm(r.title).includes(norm(work.title)) ||
      norm(work.title).includes(norm(r.title))
    ));
  }

  if (!csvRow) {
    // Check if this is a duplicate that was removed from CSV
    skipped++;
    continue;
  }

  const idx = csvRows.indexOf(csvRow);
  usedCsvRows.add(idx);

  let content = work.content;
  let changed = false;

  // Update title
  if (csvRow.title && csvRow.title !== work.title) {
    content = content.replace(/^title: ".*"$/m, `title: "${csvRow.title}"`);
    content = content.replace(/^imageAlt: ".*"$/m, `imageAlt: "${csvRow.title}"`);
    changed = true;
  }

  // Update year
  if (csvRow.year) {
    const yearNum = parseInt(csvRow.year);
    if (!isNaN(yearNum)) {
      content = content.replace(/^year: .*$/m, `year: ${yearNum}`);
      changed = true;
    }
  }

  // Update technique
  if (csvRow.technique) {
    const old = content.match(/^technique: ".*"$/m)?.[0];
    const rep = `technique: "${csvRow.technique}"`;
    if (old && old !== rep) { content = content.replace(old, rep); changed = true; }
  }

  // Update dimensions
  if (csvRow.dimensions) {
    const old = content.match(/^dimensions: ".*"$/m)?.[0];
    const rep = `dimensions: "${csvRow.dimensions}"`;
    if (old && old !== rep) { content = content.replace(old, rep); changed = true; }
  }

  // Update price
  if (csvRow.price) {
    if (content.includes('price:')) {
      const old = content.match(/^price: ".*"$/m)?.[0];
      const rep = `price: "${csvRow.price}"`;
      if (old && old !== rep) { content = content.replace(old, rep); changed = true; }
    } else {
      content = content.replace(/^imageAlt:/m, `price: "${csvRow.price}"\nimageAlt:`);
      changed = true;
    }
  }

  // Update availability
  if (csvRow.availability) {
    const avValue = avMap[csvRow.availability.toLowerCase()] || '';
    if (avValue) {
      const old = content.match(/^availability: ".*"$/m)?.[0];
      const rep = `availability: "${avValue}"`;
      if (old && old !== rep) { content = content.replace(old, rep); changed = true; }
    }
  }

  if (changed) {
    fs.writeFileSync(path.join(WORKS_DIR, work.file), content);
    updated++;
    console.log(`  ✓ ${work.file} → ${csvRow.title}`);
  }
}

// --- Remove duplicates that are no longer in CSV ---
// Count titles in CSV
const csvTitleCounts = {};
csvRows.forEach(r => {
  const key = norm(r.title);
  csvTitleCounts[key] = (csvTitleCounts[key] || 0) + 1;
});

// Count titles in md files (re-read after updates)
const mdTitleCounts = {};
const updatedMdFiles = fs.readdirSync(WORKS_DIR).filter(f => f.endsWith('.md'));
for (const file of updatedMdFiles) {
  const content = fs.readFileSync(path.join(WORKS_DIR, file), 'utf-8');
  const titleMatch = content.match(/^title:\s*"(.+)"$/m);
  if (titleMatch) {
    const key = norm(titleMatch[1]);
    if (!mdTitleCounts[key]) mdTitleCounts[key] = [];
    mdTitleCounts[key].push(file);
  }
}

// Remove extras where md has more copies than CSV
let removed = 0;
for (const [key, files] of Object.entries(mdTitleCounts)) {
  const csvCount = csvTitleCounts[key] || 0;
  if (files.length > csvCount && csvCount > 0) {
    // Remove the later-numbered duplicates
    const toRemove = files.slice(csvCount);
    for (const f of toRemove) {
      fs.unlinkSync(path.join(WORKS_DIR, f));
      console.log(`  ✗ removed duplicate: ${f}`);
      removed++;
    }
  }
}

console.log(`\n✓ Updated ${updated} files, skipped ${skipped}, removed ${removed} duplicates.`);
console.log(`  CSV has ${csvRows.length} rows, MD dir has ${updatedMdFiles.length - removed} files.`);

#!/usr/bin/env node
// Generate a SHA-256 hash of a password for use as CMS_PASSWORD_HASH env var.
// Usage: node scripts/hash-password.mjs "your-password-here"

import { createHash } from 'node:crypto';

const pw = process.argv[2];
if (!pw) {
  console.error('Usage: node scripts/hash-password.mjs "your-password"');
  process.exit(1);
}

const hash = createHash('sha256').update(pw).digest('hex');
console.log(`\nPassword: ${pw}`);
console.log(`SHA-256:  ${hash}`);
console.log(`\nAdd to Vercel environment variables:`);
console.log(`  CMS_PASSWORD_HASH = ${hash}`);

// Vercel serverless function: POST /api/auth
// Checks a password against a SHA-256 hash and returns a GitHub PAT.
//
// Required Vercel environment variables:
//   CMS_PASSWORD_HASH  — SHA-256 hex hash of the admin password
//   GITHUB_PAT         — Fine-grained GitHub personal access token with
//                         repo Contents read+write on the site repo

import { createHash } from 'node:crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  const expectedHash = process.env.CMS_PASSWORD_HASH;
  const githubToken = process.env.GITHUB_PAT;

  if (!expectedHash || !githubToken) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const hash = createHash('sha256').update(password).digest('hex');

  if (hash !== expectedHash) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  return res.status(200).json({ token: githubToken });
}

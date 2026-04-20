const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_COUNT = 12;

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[/\\:*?"<>|]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/\0/g, "")
    .slice(0, 100);
}

export function validateImages(files: File[]): { valid: File[]; error?: string } {
  if (files.length > MAX_FILE_COUNT) {
    return { valid: [], error: `Maximum ${MAX_FILE_COUNT} images allowed` };
  }

  const valid: File[] = [];
  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return { valid: [], error: `File type ${file.type} not allowed. Use JPEG, PNG, WebP, or AVIF.` };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: [], error: `File ${file.name} exceeds 10 MB limit` };
    }
    valid.push(file);
  }

  return { valid };
}

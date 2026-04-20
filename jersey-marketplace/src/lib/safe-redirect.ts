/**
 * Validates a redirect target to prevent open redirects.
 * Only allows relative paths starting with / (not //).
 */
export function safeRedirect(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  if (next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) {
    return next;
  }
  return fallback;
}

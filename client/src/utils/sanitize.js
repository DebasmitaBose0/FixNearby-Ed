/**
 * sanitize.js
 *
 * A lightweight, zero-dependency HTML sanitizer for client-side use.
 *
 * Why not DOMPurify?
 * DOMPurify is the gold-standard library for this and should be used in
 * production.  This utility is intentionally self-contained so the PR can be
 * evaluated and merged without introducing a new npm dependency.  A follow-up
 * issue should migrate to DOMPurify once the team agrees on the threat model.
 *
 * What it does:
 *   1. Strips all HTML tags from a string — prevents stored XSS when user-
 *      supplied data (e.g. a worker's bio) is rendered in the DOM.
 *   2. Decodes a small set of common HTML entities so the displayed text still
 *      reads naturally (e.g. "&amp;" becomes "&").
 *   3. Returns an empty string for any non-string input so callers never have
 *      to guard against null / undefined values.
 *
 * Usage:
 *   import { sanitizePlainText } from '../utils/sanitize';
 *   <p>{sanitizePlainText(worker.bio)}</p>
 */

const HTML_ENTITY_MAP = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

/**
 * Strip HTML tags and decode common entities from an untrusted string.
 *
 * @param {unknown} value - The value to sanitize.
 * @returns {string} Plain text safe to render in the DOM.
 */
export function sanitizePlainText(value) {
  if (typeof value !== 'string') return '';

  // 1. Remove all HTML / XML tags.
  const stripped = value.replace(/<[^>]*>/g, '');

  // 2. Decode a bounded set of HTML entities.
  return stripped.replace(
    /&(?:amp|lt|gt|quot|#39|nbsp);/g,
    (entity) => HTML_ENTITY_MAP[entity] ?? entity
  );
}

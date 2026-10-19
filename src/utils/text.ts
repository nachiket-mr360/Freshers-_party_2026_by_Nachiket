/** Input safety helpers. */

/** Collapse whitespace, trim, and clamp the guest name to a sane length. */
export function sanitizeName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 40);
}

/**
 * Names are always rendered as plain React text nodes (never as HTML), so they
 * cannot inject markup. This helper documents the intent and centralises the
 * transformation used before storing the name.
 */
export function safeName(raw: string): string {
  return sanitizeName(raw);
}

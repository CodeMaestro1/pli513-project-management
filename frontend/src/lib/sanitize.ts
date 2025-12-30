// Centralized, lightweight input sanitizers for user-provided strings.
// Goal: trim/remove whitespace and block unexpected/special characters in fields that commonly
// end up in URLs, logs, or backend queries (username, names, emails).

const WHITESPACE = /\s+/g;

function stripWhitespace(value: string): string {
  return value.replace(WHITESPACE, "");
}

function keepChars(value: string, allowed: RegExp): string {
  // `allowed` should be a single-character matcher (e.g. /[a-z]/i or /\p{L}/u)
  // We iterate by Unicode codepoints to keep behavior sane for non-latin names.
  let out = "";
  for (const ch of value) {
    if (allowed.test(ch)) out += ch;
  }
  return out;
}

export function sanitizeUsername(value: string): string {
  // No spaces, no special characters.
  const noSpaces = stripWhitespace(value);
  return keepChars(noSpaces, /[A-Za-z0-9]/);
}

export function sanitizePersonName(value: string): string {
  // First/last name: letters only, no spaces/specials.
  const noSpaces = stripWhitespace(value.trim());
  // Unicode letters only.
  return keepChars(noSpaces, /\p{L}/u);
}

export function sanitizeEmail(value: string): string {
  // Email must allow @ and .; we still remove whitespace and reject other chars.
  const noSpaces = stripWhitespace(value).toLowerCase();
  return keepChars(noSpaces, /[A-Za-z0-9@._+-]/);
}

export function sanitizeEmailAtOnly(value: string): string {
  // Stricter email input: allow only letters/numbers plus '@', '.', and '+'.
  // Rationale: '.' is required for domains like 'gmail.com'; '+' is used for Gmail aliasing.
  const noSpaces = stripWhitespace(value).toLowerCase();
  return keepChars(noSpaces, /[A-Za-z0-9@.+]/);
}

export function sanitizeLoginIdentifier(value: string): string {
  // Login accepts either username or email.
  // - Emails: normalize to lowercase and allow typical email-safe characters.
  // - Usernames: preserve case; allow only alphanumerics.
  const trimmed = value.trim();
  if (trimmed.includes("@")) return sanitizeEmail(trimmed);
  return sanitizeUsername(trimmed);
}

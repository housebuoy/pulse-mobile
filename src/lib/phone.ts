/**
 * Ghana mobile number validation (bug-triage BE-13/FE-30) — mirrors the
 * backend `GhanaPhoneValidator`.
 *
 * Accepted forms (whitespace/dashes stripped first):
 *  - 0XXXXXXXXX          leading 0 + exactly 10 digits
 *  - +233XXXXXXXXX       country code +233 + exactly 9 digits
 */
const LOCAL = /^0\d{9}$/;
const INTL = /^\+233\d{9}$/;

export function isValidGhanaPhone(raw: string): boolean {
  if (!raw) return false;
  const s = raw.replace(/\s+/g, '').replace(/-/g, '');
  return LOCAL.test(s) || INTL.test(s);
}

export const PHONE_ERROR_MESSAGE = 'Enter a valid Ghana number: 0XXXXXXXXX or +233XXXXXXXXX';

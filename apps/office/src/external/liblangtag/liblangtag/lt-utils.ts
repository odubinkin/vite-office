/** @fileoverview Actual liblangtag C-string ASCII operations over managed logical byte strings.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */

/** Returns the logical C-string prefix. @param value - Managed byte string. @returns Prefix before first NUL. */
function cString(value: string): string {
  const end = value.indexOf("\0");
  return end < 0 ? value : value.slice(0, end);
}

/** Preserves native ASCII lowercase values. @param value - Logical C byte string in the supported ASCII domain. @returns Lowercase prefix, without physical mutable storage. */
export function lt_strlower(value: string): string {
  return cString(value).replace(
    /[A-Z]/g,
    /** Uses native JS for equivalent ASCII scalar lowering. @param c - Capital. @returns Lowercase scalar. */
    (c) => c.toLowerCase(),
  );
}

/** Compares native ASCII C-string values. @param s1 - First byte string. @param s2 - Second byte string. @returns Original first unequal folded-byte difference, or raw terminator-byte difference. */
export function lt_strcasecmp(s1: string, s2: string): number {
  const left = cString(s1),
    right = cString(s2);
  let i = 0;
  while (i < left.length && i < right.length) {
    const c1 = lt_strlower(left.charAt(i)).charCodeAt(0),
      c2 = lt_strlower(right.charAt(i)).charCodeAt(0);
    if (c1 !== c2) return c1 - c2;
    i++;
  }
  return (left.charCodeAt(i) || 0) - (right.charCodeAt(i) || 0);
}

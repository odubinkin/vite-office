/** @fileoverview Original ICU78.3 uloc.cpp key/type syntax fallbacks and public C-string facades over actual uloc_keytype.cpp map views. */
import * as K from "./uloc_keytype";
import { ultag_isUnicodeLocaleKey, ultag_isUnicodeLocaleType } from "./uloc_tag";
export type { KeyTypeStringView } from "./uloc_keytype";
/** Original ASCII legacy-key alphabet; empty input remains accepted by the internal all_of, unlike the public C facade. @param key - Counted view. @returns Accepted. */
function isWellFormedLegacyKey(key: string): boolean {
  for (let i = 0; i < key.length; ++i) {
    const c = key[i] as string;
    if (!((c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c >= "0" && c <= "9"))) return false;
  }
  return true;
}
/** Original legacy-type grammar permits underscore/slash/hyphen between nonempty alphanumeric runs; plus is not accepted despite the source comment. @param value - Counted view. @returns Accepted. */
function isWellFormedLegacyType(value: string): boolean {
  let n = 0;
  for (let i = 0; i < value.length; ++i) {
    const c = value[i] as string;
    if (c === "_" || c === "/" || c === "-") {
      if (n === 0) return false;
      n = 0;
    } else if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c >= "0" && c <= "9")) ++n;
    else return false;
  }
  return n !== 0;
}
/** Original Unicode-key syntax fallback. @param key - Counted source view. @returns Canonical/input view or null. */
export function ulocimp_toBcpKeyWithFallback(key: string): K.KeyTypeStringView | null {
  const mapped = K.ulocimp_toBcpKey(key);
  return mapped === null && ultag_isUnicodeLocaleKey(key, key.length)
    ? { value: key, inputAlias: true }
    : mapped;
}
/** Original Unicode-type syntax fallback. @param key - Counted key. @param value - Counted source type. @returns Canonical/input view or null. */
export function ulocimp_toBcpTypeWithFallback(
  key: string,
  value: string,
): K.KeyTypeStringView | null {
  const mapped = K.ulocimp_toBcpType(key, value);
  return mapped === null && ultag_isUnicodeLocaleType(value, value.length)
    ? { value, inputAlias: true }
    : mapped;
}
/** Original legacy-key syntax fallback. @param key - Counted source view. @returns Canonical/input view or null. */
export function ulocimp_toLegacyKeyWithFallback(key: string): K.KeyTypeStringView | null {
  const mapped = K.ulocimp_toLegacyKey(key);
  return mapped === null && isWellFormedLegacyKey(key) ? { value: key, inputAlias: true } : mapped;
}
/** Original legacy-type syntax fallback. @param key - Counted key. @param value - Counted source type. @returns Canonical/input view or null. */
export function ulocimp_toLegacyTypeWithFallback(
  key: string,
  value: string,
): K.KeyTypeStringView | null {
  const mapped = K.ulocimp_toLegacyType(key, value);
  return mapped === null && isWellFormedLegacyType(value) ? { value, inputAlias: true } : mapped;
}
/** Original C-string boundary. @param text - Readable narrow C string/null. @returns C prefix/null. */
function cstring(text: string | null): string | null {
  if (text === null) return null;
  const i = text.indexOf("\0");
  return i < 0 ? text : text.slice(0, i);
}
/** Original public Unicode key wrapper rejects null/empty before the internal fallback. @param key - C string/null. @returns Canonical/input C value/null. */
export function uloc_toUnicodeLocaleKey(key: string | null): string | null {
  key = cstring(key);
  return key === null || key.length === 0
    ? null
    : (ulocimp_toBcpKeyWithFallback(key)?.value ?? null);
}
/** Original public legacy key wrapper. @param key - C string/null. @returns Canonical/input C value/null. */
export function uloc_toLegacyKey(key: string | null): string | null {
  key = cstring(key);
  return key === null || key.length === 0
    ? null
    : (ulocimp_toLegacyKeyWithFallback(key)?.value ?? null);
}
/** Original public Unicode type wrapper. @param key - C key/null. @param value - C type/null. @returns Canonical/input C value/null. */
export function uloc_toUnicodeLocaleType(key: string | null, value: string | null): string | null {
  key = cstring(key);
  value = cstring(value);
  return key === null || key.length === 0 || value === null || value.length === 0
    ? null
    : (ulocimp_toBcpTypeWithFallback(key, value)?.value ?? null);
}
/** Original public legacy type wrapper. @param key - C key/null. @param value - C type/null. @returns Canonical/input C value/null. */
export function uloc_toLegacyType(key: string | null, value: string | null): string | null {
  key = cstring(key);
  value = cstring(value);
  return key === null || key.length === 0 || value === null || value.length === 0
    ? null
    : (ulocimp_toLegacyTypeWithFallback(key, value)?.value ?? null);
}

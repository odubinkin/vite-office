/** @fileoverview Original consumed locid.cpp default-locale cache and setters over actual Locale owners. Native mutex/cleanup/hash addresses and allocator failures are outside this binding. */
import { Locale, type LocaleConstReference } from "./locid";
import { ulocimp_getName, ulocimp_canonicalize } from "./uloc.normalize";
import { uprv_getDefaultLocaleID } from "../../browser/putil-locale";
import { U_FAILURE } from "./unicode/utypes";
let gDefaultLocale: Locale | null = null;
const gDefaultLocalesHashT = new Map<string, Locale>();
/** Native C-string key semantics for the default-locale cache. @param text - Counted storage. @returns C prefix. */
function cstring(text: string): string {
  const end = text.indexOf("\0");
  return end < 0 ? text : text.slice(0, end);
}
/** Original default setter canonicalizes only a null/host ID, looks up the first normalized name and inserts under the actual constructed name. @param id - C ID/null host request. @param status - Sticky status. @returns Current cached owner/null on initial failure. */
export function locale_set_default_internal(id: string | null, status: [number]): Locale | null {
  const canonicalize = id === null;
  if (id === null) id = uprv_getDefaultLocaleID();
  let name = "";
  const sink = {
    /** Appends the actual CharString bytes. @param value - Narrow span. @returns Nothing. */ Append(
      value: string,
    ) {
      name += value;
    },
  };
  (canonicalize ? ulocimp_canonicalize : ulocimp_getName)(cstring(id), sink, status);
  if (U_FAILURE(status[0])) return gDefaultLocale;
  let next = gDefaultLocalesHashT.get(cstring(name));
  if (next === undefined) {
    next = new Locale(cstring(name));
    gDefaultLocalesHashT.set(next.getName(), next);
  }
  gDefaultLocale = next;
  return gDefaultLocale;
}
/** Original C facade discards its local error code. @param id - C ID/null host request. @returns Nothing. */
export function locale_set_default(id: string | null): void {
  locale_set_default_internal(id, [0]);
}
/** Original borrowed const default query, including initial host setup. Non-null initial construction is the native successful-platform precondition. @returns Borrowed owner. */
export function getDefaultLocale(): LocaleConstReference {
  if (gDefaultLocale !== null) return gDefaultLocale;
  return locale_set_default_internal(null, [0]) as Locale;
}
/** Original default-name facade. @returns Borrowed canonical C name. */
export function locale_get_default(): string {
  return getDefaultLocale().getName();
}

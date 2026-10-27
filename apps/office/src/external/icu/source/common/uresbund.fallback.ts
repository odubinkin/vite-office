/** @fileoverview Original ICU78.3 uresbund.cpp filename-fallback helpers and generated localefallback_data.h tables. These helpers deliberately differ from inheritance of an existing bundle; no Intl/likely-subtag substitute or extra locale grammar is used. */
import type { ByteStringSink } from "./unicode/bytestream";
import tables from "./localefallback_data.json" with { type: "json" };
import { CheckedArrayByteSink } from "./unicode/bytestream";
import { ulocimp_getSubtags } from "./uloc.subtags";
/** Original source open modes. */
export enum UResOpenType {
  URES_OPEN_LOCALE_DEFAULT_ROOT,
  URES_OPEN_LOCALE_ROOT,
  URES_OPEN_DIRECT,
}
/** Original C string prefix. @param text - Narrow storage. @returns Prefix. */
function cstring(text: string): string {
  const n = text.indexOf("\0");
  return n < 0 ? text : text.slice(0, n);
}
/** Original last-underscore truncation; no other normalization. @param name - Mutable C name. @returns Truncated. */
export function chopLocale(name: [string]): boolean {
  name[0] = cstring(name[0]);
  const i = name[0].lastIndexOf("_");
  if (i < 0) return false;
  name[0] = name[0].slice(0, i);
  return true;
}
/** Original variant detection ignores parser error and tests bytes already appended to the actual checked sink. @param localeID - C name. @returns Nonempty parsed variant. */
export function hasVariant(localeID: string): boolean {
  const status: [number] = [0],
    sink = new CheckedArrayByteSink(null, 0);
  ulocimp_getSubtags(cstring(localeID), null, null, null, sink, null, status);
  return sink.NumberOfBytesAppended() !== 0;
}
/** Original binary pair table lookup with exact C key comparison. @param key - C key. @param keyStrs - Native key storage. @param valueStrs - Native value storage. @param lookupTable - Original offset pairs. @returns Borrowed C value/null. */
export function performFallbackLookup(
  key: string,
  keyStrs: string,
  valueStrs: string,
  lookupTable: readonly number[],
): string | null {
  key = cstring(key);
  let bottom = 0,
    top = lookupTable.length;
  while (bottom < top) {
    const middle = bottom + Math.trunc((top - bottom) / 4) * 2,
      entryKey = cstring(keyStrs.slice(lookupTable[middle] as number));
    if (key === entryKey) return cstring(valueStrs.slice(lookupTable[middle + 1] as number));
    if (key < entryKey) top = middle;
    else bottom = middle + 2;
  }
  return null;
}
/** Original language+region then language lookup, including the literal Latn source default. @param language - Counted CharString storage. @param region - Counted CharString storage. @returns Source default script. */
export function getDefaultScript(language: string, region: string): string {
  let defaultScript: string | null = null;
  if (region !== "")
    defaultScript = performFallbackLookup(
      language + "_" + region,
      tables.dsLocaleIDChars,
      tables.scriptCodeChars,
      tables.defaultScriptTable,
    );
  if (defaultScript === null)
    defaultScript = performFallbackLookup(
      language,
      tables.dsLocaleIDChars,
      tables.scriptCodeChars,
      tables.defaultScriptTable,
    );
  return defaultScript ?? "Latn";
}
/** Original requested-file parent search, separate from chopLocale inheritance of found bundles. @param name - Mutable C name. @param origName - Original C request. @param openType - Source mode. @returns Parent was selected. */
export function getParentLocaleID(
  name: [string],
  origName: string,
  openType: UResOpenType,
): boolean {
  name[0] = cstring(name[0]);
  origName = cstring(origName);
  const n = name[0].length;
  if (n === 0 || name[0][n - 1] === "_" || hasVariant(name[0])) return chopLocale(name);
  const parts = ["", "", ""];
  const sinks = parts.map(
    /** Owns source intermediate CharStrings. @param unused - Initial span. @param i - Field. @returns Sink. */ (
      _,
      i,
    ) => ({
      /** Appends original parser bytes. @param bytes - Span. @returns Nothing. */ Append(
        bytes: string,
      ) {
        parts[i] += bytes;
      },
    }),
  );
  const status: [number] = [0];
  ulocimp_getSubtags(
    name[0],
    sinks[0] as ByteStringSink,
    sinks[1] as ByteStringSink,
    sinks[2] as ByteStringSink,
    null,
    null,
    status,
  );
  if (status[0] > 0) return chopLocale(name);
  if (openType === UResOpenType.URES_OPEN_LOCALE_DEFAULT_ROOT) {
    const parent = performFallbackLookup(
      name[0],
      tables.parentLocaleChars,
      tables.parentLocaleChars,
      tables.parentLocaleTable,
    );
    if (parent !== null) {
      name[0] = parent;
      return true;
    }
  }
  const language = parts[0] as string,
    script = parts[1] as string,
    region = parts[2] as string;
  // eslint-disable-next-line no-useless-assignment -- Preserve the original default-constructed CharString before source branches.
  let workingLocale = "";
  if (script !== "" && region !== "") {
    workingLocale =
      getDefaultScript(language, region) === script
        ? language + "_" + region
        : language + "_" + script;
  } else if (region !== "") {
    let origScript = "";
    ulocimp_getSubtags(
      origName,
      null,
      {
        /** Owns the original-request script span. @param bytes - Span. @returns Nothing. */ Append(
          bytes: string,
        ) {
          origScript += bytes;
        },
      },
      null,
      null,
      null,
      [0],
    );
    workingLocale =
      language + "_" + (origScript !== "" ? origScript : getDefaultScript(language, region));
  } else if (script !== "") {
    if (
      openType !== UResOpenType.URES_OPEN_LOCALE_DEFAULT_ROOT ||
      getDefaultScript(language, "") === script
    )
      workingLocale = language;
    else return false;
  } else return false;
  if (workingLocale !== "") {
    name[0] = workingLocale;
    return true;
  }
  return false;
}
/** Original strstr condition, including substring behavior beyond the full names nb/nn. @param name - C name. @returns Source parent hint. */
export function mayHaveParent(name: string): boolean {
  name = cstring(name);
  return name !== "" && "nb nn".includes(name);
}

/** @fileoverview Original font token/search-name/script/symbol operations; shipped MS substitution configuration is consumed without a fake service. */
import { FontSubstConfiguration } from "../config/fontcfg";
import { SubsFontFlags } from "../../inc/fontdefs";
import names from "./font-name-dictionary.json" with { type: "json" };
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
// Preserve all source initializer rows and sequential unique insertion, including CALC-144 conflicts.
const dictionary = new Map<string, string>();
for (const [name, value] of names as [string, string][])
  if (!dictionary.has(name)) dictionary.set(name, value);

/** Native mutable signed32 reference; input view and result borrow the same UTF16 backing array. */
export interface FontTokenIndex {
  value: number;
}
/** Original comma/semicolon token parsing with no trimming, quoting or skipped empty tokens. @param rTokenStr - Logical UTF16 view. @param rIndex - Signed32 start, updated to next start or minus one. @returns Borrowed token view. */
export function GetNextFontToken(rTokenStr: Uint16Array, rIndex: FontTokenIndex): Uint16Array {
  const start = rIndex.value | 0;
  if (start >>> 0 >= rTokenStr.length) {
    rIndex.value = -1;
    return rTokenStr.subarray(0, 0);
  }
  let end = start;
  while (end < rTokenStr.length && rTokenStr[end] !== 59 && rTokenStr[end] !== 44) end++;
  if (end < rTokenStr.length) rIndex.value = end + 1;
  else {
    rIndex.value = -1;
    if (start === 0) return rTokenStr;
  }
  return rTokenStr.subarray(start, end);
}

/** Converts logical UTF16 text to the actual shared Unicode value. @param value - Complete text. @returns Owned string. */
function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** ASCII-only binding for original case comparisons; other UTF16 units remain unchanged. @param view - Logical view. @returns ASCII-folded text. */
function asciiLower(view: Uint16Array): string {
  let result = "";
  for (const unit of view)
    result += String.fromCharCode(unit >= 65 && unit <= 90 ? unit + 32 : unit);
  return result;
}
/** Original search key and complete localized-name dictionary. JS text accumulation replaces only buffer storage. @param rInName - Borrowed UTF16 name. @returns Original normalized shared value. */
export function GetEnglishSearchFontName(rInName: Uint16Array): OUString {
  let length = rInName.length;
  while (length && (rInName[length - 1] as number) < 32) length--;
  let result = "",
    needTranslation = false;
  for (let i = 0; i < length; i++) {
    let unit = rInName[i] as number;
    if (unit > 127) {
      if (unit >= 0xff00 && unit <= 0xff5e) unit -= 0xfee0;
      else {
        needTranslation = true;
        result += String.fromCharCode(unit);
        continue;
      }
    }
    if (unit >= 65 && unit <= 90) unit += 32;
    else if (
      (unit < 97 || unit > 122) &&
      (unit < 48 || unit > 57) &&
      unit !== 59 &&
      unit !== 40 &&
      unit !== 41
    )
      continue;
    result += String.fromCharCode(unit);
  }
  if (needTranslation) result = dictionary.get(result) ?? result;
  return unicode(result);
}
/** Original repeatedly stripped script suffixes, distinct from normalized search names. @param source - Const native font name. @returns Copied value with recognized suffixes removed. */
export function StripScriptFromName(source: OUStringConstReference): OUString {
  const suffixes = [
    " baltic",
    " ce",
    " cyr",
    " greek",
    " tur",
    " (arabic)",
    " (hebrew)",
    " (thai)",
    " (vietnamese)",
  ];
  const units = source.getStr().subarray(0, source.getLength());
  let end = units.length,
    finished = false;
  let lower = asciiLower(units);
  while (!finished) {
    finished = true;
    for (const suffix of suffixes) {
      if (lower.endsWith(suffix)) {
        finished = false;
        end -= suffix.length;
        lower = lower.slice(0, end);
      }
    }
  }
  return end === units.length ? new OUString(source) : new OUString(units.subarray(0, end), end);
}
/** Original private exact token search, including final empty-token behavior. @param name - Logical list. @param token - Raw token. @returns Presence. */
function ImplIsFontToken(name: Uint16Array, token: Uint16Array): boolean {
  const index = { value: 0 };
  do {
    const current = GetNextFontToken(name, index);
    if (
      current.length === token.length &&
      current.every(
        /** Compares one raw unit. @param unit - Unit. @param offset - Position. @returns Equality. */ (
          unit,
          offset,
        ) => unit === token[offset],
      )
    )
      return true;
  } while (index.value !== -1);
  return false;
}
/** Original semicolon append represented by one shared value assignment. @param name - Mutable value. @param token - Borrowed token, possibly aliasing name. @returns Nothing. */
function ImplAppendFontToken(name: OUString, token: Uint16Array): void {
  const length = name.getLength(),
    separator = length ? 1 : 0;
  const units = new Uint16Array(length + separator + token.length);
  units.set(name.getStr().subarray(0, length));
  if (separator) units[length] = 59;
  units.set(token, length + separator);
  const value = new OUString(units, units.length);
  name.assign(value);
  value.dispose();
}
/** Original raw-token de-duplication, with no normalization or case folding. @param rName - Mutable list. @param rNewToken - Borrowed token. @returns Nothing. */
export function AddTokenFontName(rName: OUString, rNewToken: Uint16Array): void {
  if (!ImplIsFontToken(rName.getStr().subarray(0, rName.getLength()), rNewToken))
    ImplAppendFontToken(rName, rNewToken);
}
/** Original first-token OpenSymbol/StarSymbol test, ASCII case only with no trimming. @param rFontName - Logical list. @returns Recognition. */
export function IsOpenSymbol(rFontName: Uint16Array): boolean {
  const first = asciiLower(GetNextFontToken(rFontName, { value: 0 }));
  return first === "starsymbol" || first === "opensymbol";
}

/** Native configured substitution lookup, including exact symbol special case and original raw-token exclusion. @param name - Logical UTF16 family list. @param flags - Original bitmask. @returns Owned substitution list. */
export function GetSubsFontName(name: Uint16Array, flags: SubsFontFlags): OUString {
  const result = new OUString();
  const original = GetEnglishSearchFontName(GetNextFontToken(name, { value: 0 }));
  let search = "";
  try {
    for (let index = 0; index < original.getLength(); ++index)
      search += String.fromCharCode(original.getStr()[index] as number);
  } finally {
    original.dispose();
  }
  if (
    flags === (SubsFontFlags.MS | SubsFontFlags.ONLYONE) &&
    (search === "starsymbol" || search === "opensymbol")
  )
    return result;
  if (flags & SubsFontFlags.MS) {
    const attributes = FontSubstConfiguration.get().getSubstInfo(search);
    if (attributes)
      for (const replacement of attributes.MSSubstitutions) {
        const units = new Uint16Array(replacement.length);
        for (let index = 0; index < replacement.length; ++index)
          units[index] = replacement.charCodeAt(index);
        if (!ImplIsFontToken(name, units)) {
          ImplAppendFontToken(result, units);
          if (flags & SubsFontFlags.ONLYONE) break;
        }
      }
  }
  return result;
}

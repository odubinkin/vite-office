/** @fileoverview Original ICU78.3 ulocimp_getKeywords append/sort path from uloc.cpp. This internal legacy-view operation is distinct from getKeywordValue and BCP47 conversion. */
import type { LocaleByteSink } from "./uloc.subtags";
import { uprv_sortArray } from "./uarrsort";
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
/** Original KeywordStruct value storage, without native layout/pointer claims. */
interface KeywordStruct {
  readonly keyword: string;
  readonly value: string;
}
/** Original strcmp observes narrow NUL-terminated names even though the stored keywordLen counts all input units. @param left - First record. @param right - Second record. @returns Source byte ordering. */
function compareKeywordStructs(left: KeywordStruct, right: KeywordStruct): number {
  let i = 0;
  for (; ; ++i) {
    const a = i < left.keyword.length ? left.keyword.charCodeAt(i) : 0,
      b = i < right.keyword.length ? right.keyword.charCodeAt(i) : 0;
    if (a !== b) return a - b;
    if (a === 0) return 0;
  }
}
/** Original ByteSink overload retains first duplicate, internal spaces removal, key/name limits, output deferral until validation and exact non-value NUL list. @param localeID - Explicit narrow view after delimiter. @param prev - Original preceding delimiter. @param sink - Append output. @param valuesToo - Include values/semicolon separators. @param status - Sticky ICU status. @returns Nothing. */
export function ulocimp_getKeywords(
  localeID: string,
  prev: string,
  sink: LocaleByteSink,
  valuesToo: boolean,
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  const list: KeywordStruct[] = [];
  if (prev !== "@") return;
  do {
    while (localeID.length !== 0 && localeID[0] === " ") localeID = localeID.slice(1);
    if (localeID.length === 0) break;
    if (list.length === 25) {
      status[0] = UErrorCode.U_INTERNAL_PROGRAM_ERROR;
      return;
    }
    let equal = localeID.indexOf("=");
    const semicolon = localeID.indexOf(";");
    if (equal < 0 || (semicolon >= 0 && semicolon < equal) || equal === 0) {
      status[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
      return;
    }
    if (equal >= 25) {
      status[0] = UErrorCode.U_INTERNAL_PROGRAM_ERROR;
      return;
    }
    let keyword = "";
    for (let i = 0; i < equal; ++i) {
      const c = localeID[i] as string;
      if (c !== " ")
        keyword += c >= "A" && c <= "Z" ? String.fromCharCode(c.charCodeAt(0) + 32) : c;
    }
    ++equal;
    while (equal < localeID.length && localeID[equal] === " ") ++equal;
    if (equal === localeID.length || equal === semicolon) {
      status[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
      return;
    }
    let value = localeID.slice(equal, semicolon >= 0 ? semicolon : undefined);
    localeID = semicolon >= 0 ? localeID.slice(semicolon + 1) : "";
    let last = value.length - 1;
    while (last >= 0 && value[last] === " ") --last;
    if (last >= 0) value = value.slice(0, last + 1);
    const item = { keyword, value };
    let duplicate = false;
    for (const entry of list)
      if (compareKeywordStructs(entry, item) === 0) {
        duplicate = true;
        break;
      }
    if (!duplicate) list.push(item);
  } while (localeID.length !== 0);
  // Original native sizeof(KeywordStruct) is layout dependent; the port retains its positive item-width contract, not an ABI claim.
  uprv_sortArray(list, list.length, 48, compareKeywordStructs, false, status);
  for (let i = 0; i < list.length; ++i) {
    const item = list[i] as KeywordStruct;
    sink.Append(item.keyword);
    if (valuesToo) {
      sink.Append("=");
      sink.Append(item.value);
      if (i < list.length - 1) sink.Append(";");
    } else sink.Append("\0");
  }
}

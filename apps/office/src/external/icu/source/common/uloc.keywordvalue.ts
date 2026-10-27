/** @fileoverview Original ICU78.3 uloc_getKeywordValue and internal ByteSink getter from uloc.cpp. This lookup deliberately has different validation/partial output rules than keyword-list normalization. */
import type { ByteStringSink } from "./unicode/bytestream";
import { ByteSinkUtil } from "./bytesinkutil";
import { _hasBCP47Extension } from "./uloc.normalize";
import { ulocimp_forLanguageTag } from "./uloc_tag.convert";
import { UErrorCode, U_FAILURE, U_SUCCESS } from "./unicode/utypes";
/** Original C-string boundary. @param text - Counted storage/null. @returns C prefix/null. */
function cstring(text: string | null): string | null {
  if (text === null) return null;
  const n = text.indexOf("\0");
  return n < 0 ? text : text.slice(0, n);
}
/** Original ASCII keyword alphabet. @param c - Narrow unit. @returns Alphanumeric. */
function alnum(c: string): boolean {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c >= "0" && c <= "9");
}
/** Original ASCII keyword case mapping. @param c - Narrow unit. @returns Lower unit. */
function lower(c: string): string {
  return c >= "A" && c <= "Z" ? String.fromCharCode(c.charCodeAt(0) + 32) : c;
}
/** Original complete internal getter: localeID is a C string, keywordName is an explicit counted view. Only the selected value is validated, and valid prefix bytes remain appended if its later byte fails. @param localeID - Narrow C ID/null. @param keywordName - Counted key. @param sink - Existing append output. @param status - Sticky status. @returns Nothing. */
export function ulocimp_getKeywordValue(
  localeID: string | null,
  keywordName: string,
  sink: ByteStringSink,
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  if (localeID === null || keywordName.length === 0) {
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  localeID = cstring(localeID) as string;
  let canonKeywordName = "";
  for (let i = 0; i < keywordName.length; ++i) {
    const c = keywordName[i] as string;
    if (!alnum(c)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    canonKeywordName += lower(c);
  }
  let tmpLocaleID = localeID;
  if (_hasBCP47Extension(localeID)) {
    let temp = "";
    ulocimp_forLanguageTag(
      localeID,
      -1,
      {
        /** Owns converted CharString bytes. @param value - Span. @returns Nothing. */ Append(
          value: string,
        ) {
          temp += value;
        },
      },
      null,
      status,
    );
    if (U_SUCCESS(status[0]) && temp.length !== 0) tmpLocaleID = cstring(temp) as string;
  }
  let startSearchHere = tmpLocaleID.indexOf("@");
  if (startSearchHere < 0) return;
  while (startSearchHere >= 0) {
    ++startSearchHere;
    let nextSeparator = tmpLocaleID.indexOf("=", startSearchHere);
    if (nextSeparator < 0) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    while (tmpLocaleID[startSearchHere] === " ") ++startSearchHere;
    let keyValueTail = nextSeparator;
    while (keyValueTail > startSearchHere && tmpLocaleID[keyValueTail - 1] === " ") --keyValueTail;
    if (startSearchHere === keyValueTail) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    let localeKeywordName = "";
    while (startSearchHere < keyValueTail) {
      const c = tmpLocaleID[startSearchHere] as string;
      if (!alnum(c)) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
      localeKeywordName += lower(c);
      ++startSearchHere;
    }
    startSearchHere = tmpLocaleID.indexOf(";", nextSeparator);
    if (canonKeywordName === localeKeywordName) {
      ++nextSeparator;
      while (tmpLocaleID[nextSeparator] === " ") ++nextSeparator;
      keyValueTail = startSearchHere >= 0 ? startSearchHere : tmpLocaleID.length;
      while (keyValueTail > nextSeparator && tmpLocaleID[keyValueTail - 1] === " ") --keyValueTail;
      if (nextSeparator === keyValueTail) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
      while (nextSeparator < keyValueTail) {
        const c = tmpLocaleID[nextSeparator] as string;
        if (!alnum(c) && c !== "_" && c !== "-" && c !== "+" && c !== "/") {
          status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
          return;
        }
        sink.Append(c);
        ++nextSeparator;
      }
      return;
    }
  }
}
/** Original C getter checks status and C keyword before invoking the actual checked-array bridge; null locale ID is illegal, not a default request. @param localeID - C ID/null. @param keywordName - C key/null. @param buffer - Actual output/null for non-writing capacities. @param bufferCapacity - Native signed32 capacity. @param status - Sticky status. @returns Source result length/zero on validation failure. */
export function uloc_getKeywordValue(
  localeID: string | null,
  keywordName: string | null,
  buffer: Uint8Array | null,
  bufferCapacity: number,
  status: [number],
): number {
  if (U_FAILURE(status[0])) return 0;
  keywordName = cstring(keywordName);
  if (keywordName === null || keywordName.length === 0) {
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return 0;
  }
  return ByteSinkUtil.viaByteSinkToTerminatedChars(
    buffer,
    bufferCapacity,
    /** Uses the actual getter rather than precomputing/validating its complete output. @param sink - Checked append owner. @param s - Shared status. @returns Nothing. */ (
      sink,
      s,
    ) => ulocimp_getKeywordValue(localeID, keywordName as string, sink, s),
    status,
  );
}

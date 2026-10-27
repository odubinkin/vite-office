/** @fileoverview Original ICU78.3 uloc.cpp name/base-name/legacy-canonical normalization over actual source subtag, keyword and language-tag conversion modules. */
import tables from "../data/misc/uloc.json";
import { _getVariant, ulocimp_getSubtags, type LocaleByteSink } from "./uloc.subtags";
import { ulocimp_getKeywords } from "./uloc.keywords";
import { ulocimp_forLanguageTag } from "./uloc_tag.convert";
import { locale_get_default } from "./locid.default";
import { UErrorCode, U_FAILURE, U_SUCCESS } from "./unicode/utypes";
/** Original CharString append owner, without native capacity/allocator claims. */
class Buffer implements LocaleByteSink {
  value = "";
  /** Appends counted narrow bytes, including NUL. @param text - Source span. @returns Nothing. */
  Append(text: string): void {
    this.value += text;
  }
}
/** Original shortest-subtag loop deliberately does not fold the final pending length into the minimum. @param id - Counted narrow view. @returns Source minimum. */
function getShortestSubtagLength(id: string): number {
  let length = id.length,
    tmpLength = 0,
    reset = true;
  for (let i = 0; i < id.length; ++i) {
    if (id[i] !== "_" && id[i] !== "-") {
      if (reset) {
        tmpLength = 0;
        reset = false;
      }
      ++tmpLength;
    } else {
      if (tmpLength !== 0 && tmpLength < length) length = tmpLength;
      reset = true;
    }
  }
  return length;
}
/** Original loose BCP47 detection predicate. @param id - Counted view. @returns Convert first. */
export function _hasBCP47Extension(id: string): boolean {
  return !id.includes("@") && getShortestSubtagLength(id) === 1;
}
/** Original complete legacy canonicalization body. @param localeID - Counted narrow view. @param sink - Existing append output. @param options - Source mask0/1/2. @param err - Sticky status. @returns Nothing. */
function _canonicalize(
  localeID: string,
  sink: LocaleByteSink,
  options: number,
  err: [number],
): void {
  if (U_FAILURE(err[0])) return;
  let fieldCount = 0,
    keywordAssign = -1,
    separatorIndicator = -1,
    tmpLocaleID: string;
  if (_hasBCP47Extension(localeID)) {
    let localeIDPtr = localeID;
    if (
      localeID.length >= 2 &&
      localeID.includes("_") &&
      localeID[1] !== "-" &&
      localeID[1] !== "_"
    ) {
      let value = "",
        terminated = false;
      for (let i = 0; i < localeID.length; ++i) {
        const c = localeID[i] as string;
        if (c === "\0") terminated = true;
        value += !terminated && c === "_" ? "-" : c;
      }
      localeIDPtr = value;
    }
    const temp = new Buffer();
    ulocimp_forLanguageTag(localeIDPtr, localeIDPtr.length, temp, null, err);
    tmpLocaleID = U_SUCCESS(err[0]) && temp.value.length !== 0 ? temp.value : localeIDPtr;
  } else tmpLocaleID = localeID;
  const origLocaleID = tmpLocaleID,
    tag = new Buffer(),
    script = new Buffer(),
    country = new Buffer(),
    variant = new Buffer(),
    end: [number] = [0];
  ulocimp_getSubtags(tmpLocaleID, tag, script, country, variant, end, err);
  if (U_FAILURE(err[0])) return;
  if (end[0] > 0) tmpLocaleID = tmpLocaleID.slice(end[0]);
  if (
    tag.value.length === 9 &&
    origLocaleID.length >= 9 &&
    origLocaleID.slice(0, 9) === "i-default"
  )
    tag.value = locale_get_default();
  else {
    if (script.value.length !== 0) {
      ++fieldCount;
      tag.Append("_");
      tag.Append(script.value);
    }
    if (country.value.length !== 0) {
      ++fieldCount;
      tag.Append("_");
      tag.Append(country.value);
    }
    if (variant.value.length !== 0) {
      ++fieldCount;
      if (country.value.length === 0) tag.Append("_");
      tag.Append("_");
      tag.Append(variant.value);
    }
  }
  if ((options & 1) === 0 && tmpLocaleID.length !== 0 && tmpLocaleID[0] === ".") {
    tag.Append(".");
    tmpLocaleID = tmpLocaleID.slice(1);
    const at = tmpLocaleID.indexOf("@"),
      length = at < 0 ? tmpLocaleID.length : at;
    if (length > 64) {
      err[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    if (length > 0) {
      tag.Append(tmpLocaleID.slice(0, length));
      tmpLocaleID = tmpLocaleID.slice(length);
    }
  }
  const start = tmpLocaleID.indexOf("@");
  if (start >= 0) {
    if (start > 0) tmpLocaleID = tmpLocaleID.slice(start);
    keywordAssign = tmpLocaleID.indexOf("=");
    separatorIndicator = tmpLocaleID.indexOf(";");
  } else tmpLocaleID = "";
  if ((options & 1) === 0 && tmpLocaleID.length !== 0 && keywordAssign < 0) {
    tag.Append(tmpLocaleID);
    tmpLocaleID = "";
  }
  if (options & 1) {
    if (tmpLocaleID.length !== 0 && keywordAssign < 0) {
      if (fieldCount < 2 || (fieldCount < 3 && script.value.length !== 0)) {
        do {
          tag.Append("_");
          ++fieldCount;
        } while (fieldCount < 2);
      }
      _getVariant(tmpLocaleID.slice(1), "@", tag, variant.value.length !== 0, err);
      if (U_FAILURE(err[0])) return;
    }
    for (const [id, canonicalID] of tables.tables.CANONICALIZE_MAP)
      if (tag.value === id) {
        if (id.length === 0 && tmpLocaleID.length !== 0) break;
        tag.value = canonicalID as string;
        break;
      }
  }
  sink.Append(tag.value);
  if (
    (options & 2) === 0 &&
    tmpLocaleID.length !== 0 &&
    keywordAssign >= 0 &&
    (separatorIndicator < 0 || separatorIndicator > keywordAssign)
  ) {
    sink.Append("@");
    // eslint-disable-next-line no-useless-assignment -- Preserve the original bookkeeping increment before emitting legacy keywords.
    ++fieldCount;
    ulocimp_getKeywords(tmpLocaleID.slice(1), "@", sink, true, err);
  }
}
/** Original internal level-one normalization. @param localeID - Counted view. @param sink - Output. @param status - Sticky status. @returns Nothing. */
export function ulocimp_getName(localeID: string, sink: LocaleByteSink, status: [number]): void {
  _canonicalize(localeID, sink, 0, status);
}
/** Original strip-keywords mode retains POSIX charset/variant behavior. @param localeID - Counted view. @param sink - Output. @param status - Sticky status. @returns Nothing. */
export function ulocimp_getBaseName(
  localeID: string,
  sink: LocaleByteSink,
  status: [number],
): void {
  _canonicalize(localeID, sink, 2, status);
}
/** Original legacy level-two canonicalization, distinct from modern Locale::canonicalize alias-resource processing. @param localeID - Counted view. @param sink - Output. @param status - Sticky status. @returns Nothing. */
export function ulocimp_canonicalize(
  localeID: string,
  sink: LocaleByteSink,
  status: [number],
): void {
  _canonicalize(localeID, sink, 1, status);
}

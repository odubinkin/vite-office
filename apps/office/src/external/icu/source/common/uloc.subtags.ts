/** @fileoverview Original ICU78.3 uloc.cpp legacy subtag parser over explicit narrow-byte string views and optional append sinks. No Locale normalization, BCP47 conversion, default locale or calendar service is substituted here. */
import data from "../data/misc/uloc.json";
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
/** Original consumed ByteSink Append boundary; strings represent narrow-byte spans, including embedded NUL. */
export interface LocaleByteSink {
  /** Appends original narrow units. @param bytes - Owned/borrowed span. @returns Nothing. */
  Append(bytes: string): void;
}
/** Source ASCII platform separator predicate. @param c - Narrow unit. @returns Separator. */
function _isIDSeparator(c: string | undefined): boolean {
  return c === "_" || c === "-";
}
/** Source POSIX field terminators, deliberately excluding NUL in string_view. @param c - Narrow unit. @returns Terminator. */
function _isTerminator(c: string | undefined): boolean {
  return c === "." || c === "@";
}
/** Source ASCII letter predicate. @param c - Narrow unit. @returns Letter. */
function letter(c: string | undefined): boolean {
  return c !== undefined && ((c >= "A" && c <= "Z") || (c >= "a" && c <= "z"));
}
/** Original ASCII uprv_tolower mapping, without Unicode expansion. @param s - Narrow span. @returns Mapped span. */
function lower(s: string): string {
  let result = "";
  for (const c of s) result += c >= "A" && c <= "Z" ? String.fromCharCode(c.charCodeAt(0) + 32) : c;
  return result;
}
/** Original ASCII uprv_toupper mapping. @param s - Narrow span. @returns Mapped span. */
function upper(s: string): string {
  let result = "";
  for (const c of s) result += c >= "a" && c <= "z" ? String.fromCharCode(c.charCodeAt(0) - 32) : c;
  return result;
}
/** Original parser recognizes only t/u/x hyphen extensions here. @param s - Remaining span. @returns Recognized extension. */
function _isBCP47Extension(s: string): boolean {
  return s.length >= 3 && s[0] === "-" && "tTuUxX".includes(s[1] as string) && s[2] === "-";
}
/** Original two-pass null-delimited lookup retains obsolete second-section identities. @param list - Original table. @param key - Normalized key. @returns Source index or absent. */
function _findIndex(list: readonly (string | null)[], key: string): number | null {
  let index = 0;
  for (let pass = 0; pass < 2; ++pass) {
    while (list[index] !== null) {
      if (list[index] === key) return index;
      ++index;
    }
    ++index;
  }
  return null;
}
/** Original language parser, including root/und stripping and paired ISO aliases. @param id - Remaining narrow span. @param sink - Optional output. @param status - Sticky status. @returns Consumed input units. */
function _getLanguage(id: string, sink: LocaleByteSink | null, status: [number]): number {
  let skip = 0;
  if (id.length === 4 && lower(id) === "root") {
    skip = 4;
    id = id.slice(skip);
  } else if (
    id.length >= 3 &&
    lower(id.slice(0, 3)) === "und" &&
    (id.length === 3 || id[3] === "-" || id[3] === "_" || id[3] === "@")
  ) {
    skip = 3;
    id = id.slice(skip);
  }
  let len = id.length >= 2 && "xXiI".includes(id[0] as string) && _isIDSeparator(id[1]) ? 2 : 0;
  while (len < id.length && !_isTerminator(id[len]) && !_isIDSeparator(id[len])) {
    if (len === 11) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    ++len;
  }
  if (sink === null || len === 0) return skip + len;
  let value = lower(id.slice(0, len));
  if (len >= 2 && id.length >= 2 && _isIDSeparator(id[1]))
    value = value.slice(0, 1) + "-" + value.slice(2);
  if (len === 3) {
    const index = _findIndex(data.tables.LANGUAGES_3, value);
    if (index !== null) {
      sink.Append(data.tables.LANGUAGES[index] as string);
      return skip + len;
    }
  }
  sink.Append(value);
  return skip + len;
}
/** Original exactly-four-letter script parser. @param id - Remaining span. @param sink - Optional output. @returns Consumed units. */
function _getScript(id: string, sink: LocaleByteSink | null): number {
  let len = 0;
  while (
    len < id.length &&
    !_isTerminator(id[len]) &&
    !_isIDSeparator(id[len]) &&
    letter(id[len])
  ) {
    if (len === 4) return 0;
    ++len;
  }
  if (len !== 4) return 0;
  if (sink !== null) sink.Append(upper(id[0] as string) + lower(id.slice(1, 4)));
  return len;
}
/** Original two/three-unit region parser does not add an ASCII-letter validation. @param id - Remaining span. @param sink - Optional output. @returns Consumed units. */
function _getRegion(id: string, sink: LocaleByteSink | null): number {
  let len = 0;
  while (len < id.length && !_isTerminator(id[len]) && !_isIDSeparator(id[len])) {
    if (len === 3) return 0;
    ++len;
  }
  if (len < 2) return 0;
  if (sink === null) return len;
  const value = upper(id.slice(0, len));
  if (len === 3) {
    const index = _findIndex(data.tables.COUNTRIES_3, value);
    if (index !== null) {
      sink.Append(data.tables.COUNTRIES[index] as string);
      return len;
    }
  }
  sink.Append(value);
  return len;
}
/** Original multi-variant parser preserves historical trailing separator consumption, append-before-error output and POSIX scanning. @param id - Remaining span. @param prev - Preceding delimiter. @param sink - Optional append output. @param needSeparator - Existing variant flag. @param status - Sticky status. @returns Consumed units or zero. */
export function _getVariant(
  id: string,
  prev: string,
  sink: LocaleByteSink | null,
  needSeparator: boolean,
  status: [number],
): number {
  if (U_FAILURE(status[0]) || id.length === 0) return 0;
  let index = 0;
  if (_isIDSeparator(prev)) {
    let sub = id;
    for (;;) {
      const found = sub.search(/[.@_-]/u),
        next = found < 0 ? -1 : found,
        finished = next < 0 || next + 1 === sub.length,
        limit = finished ? sub.length : next;
      index += limit;
      if (index > 179) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return 0;
      }
      if (sink !== null) {
        if (needSeparator) sink.Append("_");
        else needSeparator = true;
        sink.Append(upper(sub.slice(0, limit)));
      }
      if (finished) return index;
      sub = sub.slice(next);
      if (_isTerminator(sub[0]) || _isBCP47Extension(sub)) return index;
      sub = sub.slice(1);
      ++index;
    }
  }
  let skip = 0;
  if (prev !== "@") {
    const at = id.indexOf("@");
    if (at < 0) return 0;
    skip = at + 1;
    id = id.slice(skip);
  }
  for (; index < id.length && !_isTerminator(id[index]); ++index) {
    if (index >= 179) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    if (needSeparator) {
      sink?.Append("_");
      needSeparator = false;
    }
    if (sink !== null) {
      let c = upper(id[index] as string);
      if (c === "-" || c === ",") c = "_";
      sink.Append(c);
    }
  }
  return skip + index;
}
/** Original complete ByteSink overload. Append sinks may be null independently; end is an offset into the ORIGINAL string_view, written only at the source checkpoints. @param localeID - Explicit narrow-byte view, not a C-string. @param language - Language append sink. @param script - Script append sink. @param region - Region append sink. @param variant - Variant append sink. @param end - Optional consumed-pointer projection. @param status - Sticky ICU status. @returns Nothing. */
export function ulocimp_getSubtags(
  localeID: string,
  language: LocaleByteSink | null,
  script: LocaleByteSink | null,
  region: LocaleByteSink | null,
  variant: LocaleByteSink | null,
  end: [number] | null,
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  let pos = 0;
  if (end !== null) end[0] = 0;
  else if (language === null && script === null && region === null && variant === null) return;
  if (localeID.length === 0) return;
  let hasRegion = false;
  {
    const len = _getLanguage(localeID, language, status);
    if (U_FAILURE(status[0])) return;
    if (len > 0) pos += len;
  }
  if (end !== null) end[0] = pos;
  else if (script === null && region === null && variant === null) return;
  if (pos === localeID.length) return;
  if (_isIDSeparator(localeID[pos])) {
    const len = _getScript(localeID.slice(pos + 1), script);
    if (len > 0) {
      pos += len + 1;
      if (end !== null) end[0] = pos;
    }
  }
  if ((region === null && variant === null && end === null) || pos === localeID.length) return;
  if (_isIDSeparator(localeID[pos])) {
    const len = _getRegion(localeID.slice(pos + 1), region);
    if (len > 0) {
      hasRegion = true;
      pos += len + 1;
      if (end !== null) end[0] = pos;
    }
  }
  if ((variant === null && end === null) || pos === localeID.length) return;
  let hasVariant = false;
  if (_isIDSeparator(localeID[pos]) && !_isBCP47Extension(localeID.slice(pos))) {
    const skip =
        !hasRegion && localeID.length - pos > 1 && _isIDSeparator(localeID[pos + 1]) ? 2 : 1,
      len = _getVariant(
        localeID.slice(pos + skip),
        localeID[pos] as string,
        variant,
        false,
        status,
      );
    if (U_FAILURE(status[0])) return;
    if (len > 0) {
      hasVariant = true;
      pos += skip + len;
      if (end !== null) end[0] = pos;
    }
  }
  if ((variant === null && end === null) || pos === localeID.length) return;
  if (_isBCP47Extension(localeID.slice(pos))) {
    pos += 2;
    for (;;) {
      let next = localeID.indexOf("-", pos + 1);
      if (next < 0) break;
      next = localeID.indexOf("-", next + 1);
      const finished = next < 0,
        sub = localeID.slice(pos, finished ? undefined : next);
      if (sub.length === 9 && lower(sub) === "-va-posix") {
        if (variant !== null) {
          if (hasVariant) variant.Append("_");
          variant.Append("POSIX");
        }
        if (end !== null) end[0] = pos + 9;
      }
      if (finished) break;
      pos = next;
    }
  }
}

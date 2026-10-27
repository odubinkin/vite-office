/** @fileoverview Consumed ICU78.3 ZoneMeta CLDR canonical ID/cache and numeric custom-zone creation. Native mutex/allocation/cleanup and metazone services remain unported. */
import { UnicodeString } from "../common/unistr";
import { uprv_isInvariantUString } from "../common/uinvchar";
import { UErrorCode as E, U_FAILURE } from "../common/unicode/utypes";
import * as R from "../common/uresbund";
import { findID, dereferOlsonLink } from "./timezone.resources";
import { SimpleTimeZone } from "./simpletz";
const canonicalIDCache = new Map<string, string>();
/** Original C-string resource-key loop leaves character zero untouched and changes later slashes to colons. @param text - NUL-terminated key projection. @returns Converted key. */
function resourceKey(text: string): string {
  const units = text.split("");
  for (let i = 1; i < units.length; ++i) if (units[i] === "/") units[i] = ":";
  return units.join("");
}
/** Source metadata owner; only the consumed canonical lookup entrypoint is ported. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static ZoneMeta metadata owner.
export class ZoneMeta {
  /** Original numeric-offset custom factory with source uint8 field narrowing. Native signed INT_MIN negation is outside the defined-input witness. @param offset - Signed32 milliseconds. @returns Owned fixed zone. */
  static createCustomTimeZone(offset: number): SimpleTimeZone {
    offset |= 0;
    const negative = offset < 0;
    let tmp = negative ? -offset | 0 : offset;
    tmp = Math.trunc(tmp / 1000);
    const second = (tmp % 60) & 255;
    tmp = Math.trunc(tmp / 60);
    const minute = (tmp % 60) & 255,
      hour = Math.trunc(tmp / 60) & 255;
    const id = ZoneMeta.formatCustomID(hour, minute, second, negative, new UnicodeString());
    return new SimpleTimeZone(offset, id);
  }
  /** Original numeric-factory normalization deliberately tests hour/minute only, retaining the source seconds-only GMT ID. @param hour - uint8 hour. @param minute - uint8 minute. @param second - uint8 second. @param negative - Sign. @param id - Output. @returns Output. */
  private static formatCustomID(
    hour: number,
    minute: number,
    second: number,
    negative: boolean,
    id: UnicodeString,
  ): UnicodeString {
    hour &= 255;
    minute &= 255;
    second &= 255;
    id.assign(new UnicodeString("GMT"));
    if (hour !== 0 || minute !== 0) {
      const units = [
        negative ? 45 : 43,
        48 + Math.trunc((hour % 100) / 10),
        48 + (hour % 10),
        58,
        48 + Math.trunc((minute % 100) / 10),
        48 + (minute % 10),
      ];
      if (second !== 0) units.push(58, 48 + Math.trunc((second % 100) / 10), 48 + (second % 10));
      id.append(new UnicodeString(String.fromCharCode(...units), units.length));
    }
    return id;
  }
  /** Original CLDR canonical lookup, including source local-status isolation and cache insertion guards. @param tzid - Original UTF16 input. @param status - ICU status. @returns Borrowed canonical string or null. */
  static getCanonicalCLDRID(tzid: UnicodeString, status: [number]): string | null {
    if (U_FAILURE(status[0])) return null;
    if (tzid.isBogus() || tzid.length() > 128) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      return null;
    }
    const text = tzid.getBuffer() as string;
    if (!uprv_isInvariantUString(text, -1)) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      return null;
    }
    const terminated = text.split("\0", 1)[0] as string,
      cached = canonicalIDCache.get(terminated);
    if (cached !== undefined) return cached;
    let canonical: string | null = null,
      isInputCanonical = false;
    const tmp: [number] = [0],
      top = R.ures_openDirect(null, "keyTypeData", tmp);
    let rb = R.ures_getByKey(top, "typeMap", null, tmp),
      key = resourceKey(terminated);
    R.ures_getByKey(rb, "timezone", rb, tmp);
    R.ures_getByKey(rb, key, rb, tmp);
    if (!U_FAILURE(tmp[0])) {
      canonical = findID(tzid);
      isInputCanonical = true;
    }
    if (canonical === null) {
      tmp[0] = 0;
      rb = R.ures_getByKey(top, "typeAlias", rb, tmp);
      R.ures_getByKey(rb, "timezone", rb, tmp);
      const alias = R.ures_getStringByKey(rb, key, null, tmp);
      if (!U_FAILURE(tmp[0])) canonical = alias;
      if (canonical === null) {
        const derefer = dereferOlsonLink(tzid);
        if (derefer === null) status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
        else {
          key = resourceKey(derefer);
          tmp[0] = 0;
          const alias = R.ures_getStringByKey(rb, key, null, tmp);
          if (!U_FAILURE(tmp[0])) canonical = alias;
          else {
            canonical = derefer;
            isInputCanonical = true;
          }
        }
      }
    }
    if (!U_FAILURE(status[0]) && canonical !== null) {
      if (!canonicalIDCache.has(terminated)) {
        const key = findID(tzid);
        if (key !== null) canonicalIDCache.set(key, canonical);
      }
      if (isInputCanonical && !canonicalIDCache.has(canonical))
        canonicalIDCache.set(canonical, canonical);
    }
    R.ures_close(rb);
    R.ures_close(top);
    return canonical;
  }
}

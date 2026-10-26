/** @fileoverview Original ICU78.3 LSR logical ownership, region indexing, comparison and hash from lsr.h/cpp. Immutable narrow strings project borrowed C pointers and owned spans; native invalid pointers, allocation failure, destructor/ABI and self-move are outside this binding. */
import { U_FAILURE } from "./unicode/utypes";
import { ustr_hashCharsN } from "./ustring";
/** Source C prefix. @param s - Narrow storage. @returns Prefix. */
function cstring(s: string): string {
  const n = s.indexOf("\0");
  return n < 0 ? s : s.slice(0, n);
}
/** Original LSR value; owned holds the actual logical backing bytes when a constructor copies subtags. */
export class LSR {
  static readonly REGION_INDEX_LIMIT = 1001 + 26 * 26;
  static readonly EXPLICIT_LSR = 7;
  static readonly EXPLICIT_LANGUAGE = 4;
  static readonly EXPLICIT_SCRIPT = 2;
  static readonly EXPLICIT_REGION = 1;
  static readonly IMPLICIT_LSR = 0;
  static readonly DONT_CARE_FLAGS = 0;
  language: string | null = "und";
  script: string | null = "";
  region: string | null = "";
  owned: string | null = null;
  regionIndex = 0;
  flags = 0;
  hashCode = 0;
  /** Original default. @returns LSR. */
  constructor();
  /** Original borrowed C-pointer constructor. @param lang - Language. @param scr - Script. @param region - Region. @param flags - Source flags. @returns LSR. */
  constructor(lang: string, scr: string, region: string, flags: number);
  /** Original counted StringPiece constructor. @param lang - Counted language. @param scr - Counted script. @param region - Counted region with source-readable termination. @param flags - Flags. @param status - Sticky status. @returns Owner. */
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- Preserve source borrowed C-pointer versus owned counted-span overloads.
  constructor(lang: string, scr: string, region: string, flags: number, status: [number]);
  /** Original prefixed owned constructor. @param prefix - Narrow prefix. @param lang - C language. @param scr - C script. @param region - C region. @param flags - Flags. @param status - Status. @returns Owner. */
  constructor(
    prefix: number,
    lang: string,
    scr: string,
    region: string,
    flags: number,
    status: [number],
  );
  /** Original constructor dispatch retains null fields on failure, byte offsets and C versus counted spans. @param a - Language/prefix. @param b - Script/language. @param c - Region/script. @param d - Flags/region. @param e - Status/flags. @param f - Prefix status. @returns LSR. */
  constructor(
    a?: string | number,
    b?: string,
    c?: string,
    d?: number | string,
    e?: number | [number],
    f?: [number],
  ) {
    if (a === undefined) return;
    if (typeof a === "number") {
      this.language = this.script = null;
      this.region = cstring(d as string);
      this.regionIndex = LSR.indexForRegion(this.region);
      this.flags = (e as number) | 0;
      if (U_FAILURE((f as [number])[0])) return;
      const prefix = String.fromCharCode(a & 255),
        language = prefix + cstring(b as string),
        script = prefix + cstring(c as string);
      this.owned = language + "\0" + script + "\0";
      this.language = cstring(language);
      this.script = cstring(script);
    } else {
      this.regionIndex = LSR.indexForRegion(c as string);
      this.flags = (d as number) | 0;
      if (e === undefined) {
        this.language = cstring(a);
        this.script = cstring(b as string);
        this.region = cstring(c as string);
        return;
      }
      this.language = this.script = this.region = null;
      if (U_FAILURE((e as [number])[0])) return;
      this.owned = a + "\0" + b + "\0" + c + "\0";
      this.language = cstring(a);
      this.script = cstring(b as string);
      this.region = cstring(c as string);
    }
  }
  /** Original move constructor, without copying the owned backing store. @param other - Source owner. @returns Moved value. */
  static move(other: LSR): LSR {
    return new LSR().assignMove(other);
  }
  /** Original move assignment clears only source language/script, ownership and cached hash if it owned bytes; region/index/flags remain in the moved-from source. @param other - Source. @returns This owner. */
  assignMove(other: LSR): this {
    this.language = other.language;
    this.script = other.script;
    this.region = other.region;
    this.regionIndex = other.regionIndex;
    this.flags = other.flags;
    this.owned = other.owned;
    this.hashCode = other.hashCode;
    if (this.owned !== null) {
      other.language = other.script = "";
      other.owned = null;
      other.hashCode = 0;
    }
    return this;
  }
  /** Original uppercase two-letter or three-digit region index; lower-case is not normalized. @param region - Readable C storage. @returns Index/zero. */
  static indexForRegion(region: string): number {
    region = cstring(region);
    const c = region.length === 0 ? 0 : region.charCodeAt(0),
      a = c - 48;
    if (a >= 0 && a <= 9) {
      const b = region.length > 1 ? region.charCodeAt(1) - 48 : -48,
        d = region.length > 2 ? region.charCodeAt(2) - 48 : -48;
      if (b < 0 || b > 9 || d < 0 || d > 9 || region.length !== 3) return 0;
      return (10 * a + b) * 10 + d + 1;
    }
    const upper = c - 65,
      b = region.length > 1 ? region.charCodeAt(1) - 65 : -65;
    return upper < 0 || upper > 25 || b < 0 || b > 25 || region.length !== 2
      ? 0
      : 26 * upper + b + 1001;
  }
  /** Original equality ignoring flags; requires non-null successful constructor fields. @param other - Other value. @returns Equivalent. */
  isEquivalentTo(other: LSR): boolean {
    return (
      this.language === other.language &&
      this.script === other.script &&
      this.regionIndex === other.regionIndex &&
      (this.regionIndex > 0 || this.region === other.region)
    );
  }
  /** Original equality additionally compares flags. @param other - Other. @returns Equal. */
  equals(other: LSR): boolean {
    return this.isEquivalentTo(other) && this.flags === other.flags;
  }
  /** Original lazy hash with unsigned32 multiplication and no invalidation on public field mutation. @returns This owner. */
  setHashCode(): this {
    if (this.hashCode === 0) {
      let h = ustr_hashCharsN(this.language as string, (this.language as string).length);
      h =
        (Math.imul(h, 37) +
          ustr_hashCharsN(this.script as string, (this.script as string).length)) |
        0;
      h = (Math.imul(h, 37) + this.regionIndex) | 0;
      this.hashCode = (Math.imul(h, 37) + this.flags) | 0;
    }
    return this;
  }
}

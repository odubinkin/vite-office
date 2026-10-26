/** @fileoverview Original ICU78.3 UniqueCharStrings logical stable string pool from uniquecharstr.h, using immutable UTF16/narrow strings for native storage. Physical allocation failure, raw-pointer lifetime and debug assertions remain uncertified. */
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
import { uprv_isInvariantUString } from "./uinvchar";
/** Source UTF16 terminated prefix. @param s - Stable text. @returns C prefix. */
function cstring(s: string): string {
  const n = s.indexOf("\0");
  return n < 0 ? s : s.slice(0, n);
}
/** Original deduplicating pool, with native byte offsets as indexes. */
export class UniqueCharStrings {
  private readonly map = new Map<string, number>();
  private strings: string | null = null;
  private isFrozen = false;
  /** Original incoming error guard before storage construction. @param status - Status. @returns Owner. */
  constructor(status: [number]) {
    if (!U_FAILURE(status[0])) this.strings = "";
  }
  /** Original owned-storage transfer, including one implicit final NUL. @returns Owned bytes/null. */
  orphanCharStrings(): string | null {
    const result = this.strings;
    this.strings = null;
    return result === null ? null : result + "\0";
  }
  /** Original add preserves offset bookkeeping before invariant conversion failure. @param p - Stable terminated UTF16 storage. @param status - Status. @returns Index/-1 on early failure. */
  add(p: string, status: [number]): number {
    if (U_FAILURE(status[0])) return -1;
    if (this.isFrozen) {
      status[0] = UErrorCode.U_NO_WRITE_PERMISSION;
      return -1;
    }
    p = cstring(p);
    const previous = this.map.get(p);
    if (previous !== undefined) return previous;
    this.strings = (this.strings as string) + "\0";
    const index = this.strings.length;
    if (!uprv_isInvariantUString(p, p.length)) status[0] = UErrorCode.U_INVARIANT_CONVERSION_ERROR;
    else this.strings += p;
    if (!U_FAILURE(status[0])) this.map.set(p, index);
    return index;
  }
  /** Original by-value call retains a stable copied key in native code; immutable JS text supplies that lifetime. @param s - UTF16 value. @param status - Status. @returns Index. */
  addByValue(s: string, status: [number]): number {
    return this.add(s, status);
  }
  /** Original freeze flag. @returns Nothing. */
  freeze(): void {
    this.isFrozen = true;
  }
  /** Original release guard returns null before freeze/nonpositive index. @param i - Native byte offset. @returns Borrowed C span/null. */
  get(i: number): string | null {
    i |= 0;
    return this.isFrozen && i > 0 ? cstring((this.strings as string).slice(i)) : null;
  }
}

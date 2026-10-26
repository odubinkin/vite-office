/** @fileoverview Original ICU78.3 CharStringMap borrowed C-string map from charstrmap.h. JS Map projects the original content-keyed hash storage; native allocation/mutex/ABI and unusable null-map operations remain uncertified. */
import { U_FAILURE } from "./unicode/utypes";
/** Original C view. @param s - Narrow pointer projection. @returns C prefix. */
function cstring(s: string): string {
  const n = s.indexOf("\0");
  return n < 0 ? s : s.slice(0, n);
}
/** Original map retains values without owning/copying/deleting their storage. */
export class CharStringMap {
  private map: Map<string, string> | null = null;
  /** Original default unusable map or sized construction. @param size - Native capacity hint. @param status - Native status for sized creation. @returns Map owner. */
  constructor(size?: number, status?: [number]) {
    if (size !== undefined && status !== undefined && !U_FAILURE(status[0])) this.map = new Map();
  }
  /** Original borrowed lookup; requires a usable map. @param key - C key. @returns C value/null. */
  get(key: string): string | null {
    return (this.map as Map<string, string>).get(cstring(key)) ?? null;
  }
  /** Original sticky-error insertion. @param key - C key. @param value - C value. @param status - Status. @returns Nothing. */
  put(key: string, value: string, status: [number]): void {
    if (!U_FAILURE(status[0])) (this.map as Map<string, string>).set(cstring(key), cstring(value));
  }
  /** Original move assignment invalidates only the source map. @param other - Source. @returns This owner. */
  assignMove(other: CharStringMap): this {
    this.map = other.map;
    other.map = null;
    return this;
  }
  /** Original move constructor. @param other - Source. @returns Owner. */
  static move(other: CharStringMap): CharStringMap {
    return new CharStringMap().assignMove(other);
  }
}

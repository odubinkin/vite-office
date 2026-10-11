/** @fileoverview Original shared Unicode value owner from include/svl/sharedstring.hxx and svl/source/misc/sharedstring.cxx. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  rtl_uString_acquire,
  rtl_uString_release,
  rtl_ustr_reverseCompare_WithLength,
} from "../../../sal/inc/rtl/ustring.h";
import type { rtl_uString, rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";

/** Original const SharedString reference exposes queries without assignment or destructor invocation. */
export type SharedStringConstReference = Readonly<
  Pick<
    SharedString,
    | "equals"
    | "notEquals"
    | "getString"
    | "getIgnoreCaseString"
    | "getData"
    | "getDataIgnoreCase"
    | "isValid"
    | "isEmpty"
    | "getLength"
  >
>;

/** Original SharedString with separate original/case-folded nullable pointer fields. */
export class SharedString {
  /** Original const static OUString value. */
  static readonly EMPTY_STRING: OUStringConstReference = new OUString();
  private static emptySharedString: SharedString | undefined;
  private mpData: rtl_uStringSlot = [null];
  private mpDataIgnoreCase: rtl_uStringSlot = [null];

  /** Original process-local empty singleton, acquiring both original static pointers once. @returns Same const empty value. */
  static getEmptyString(): SharedStringConstReference {
    if (SharedString.emptySharedString === undefined)
      SharedString.emptySharedString = new SharedString(
        SharedString.EMPTY_STRING.pData,
        SharedString.EMPTY_STRING.pData,
      );
    return SharedString.emptySharedString;
  }

  /** Selects original default, const-value or raw-pair constructor arguments. @param args - Original argument combination. @returns Initialized shared value. */
  constructor(
    ...args:
      | []
      | [source: OUStringConstReference | SharedStringConstReference]
      | [data: rtl_uString | null, ignoreCase: rtl_uString | null]
  ) {
    const [source, ignoreCase = null] = args;
    if (source === undefined) return;
    if (source instanceof SharedString) {
      this.mpData[0] = source.mpData[0];
      this.mpDataIgnoreCase[0] = source.mpDataIgnoreCase[0];
    } else if (source !== null && "pData" in source) {
      this.mpData[0] = source.pData;
      rtl_uString_acquire(source.pData as rtl_uString);
      return;
    } else {
      this.mpData[0] = source as rtl_uString | null;
      this.mpDataIgnoreCase[0] = ignoreCase;
    }
    if (this.mpData[0] !== null) rtl_uString_acquire(this.mpData[0]);
    if (this.mpDataIgnoreCase[0] !== null) rtl_uString_acquire(this.mpDataIgnoreCase[0]);
  }

  /** Original move constructor exchanges both fields with null without acquiring. @param source - Rvalue value owner. @returns Transferred value. */
  static move(source: SharedString): SharedString {
    const result = new SharedString();
    result.mpData[0] = source.mpData[0];
    source.mpData[0] = null;
    result.mpDataIgnoreCase[0] = source.mpDataIgnoreCase[0];
    source.mpDataIgnoreCase[0] = null;
    return result;
  }
  /** Original destructor releases original then folded data without resetting fields. @returns Nothing. */
  dispose(): void {
    if (this.mpData[0] !== null) rtl_uString_release(this.mpData[0]);
    if (this.mpDataIgnoreCase[0] !== null) rtl_uString_release(this.mpDataIgnoreCase[0]);
  }
  /** Original copy assignment, retaining its native self guard and release-before-acquire order. @param sourceReference - Source const reference. @returns This value. */
  assign(sourceReference: SharedStringConstReference): this {
    const source = sourceReference as SharedString;
    if (this === source) return this;
    if (this.mpData[0] !== null) rtl_uString_release(this.mpData[0]);
    if (this.mpDataIgnoreCase[0] !== null) rtl_uString_release(this.mpDataIgnoreCase[0]);
    this.mpData[0] = source.mpData[0];
    this.mpDataIgnoreCase[0] = source.mpDataIgnoreCase[0];
    if (this.mpData[0] !== null) rtl_uString_acquire(this.mpData[0]);
    if (this.mpDataIgnoreCase[0] !== null) rtl_uString_acquire(this.mpDataIgnoreCase[0]);
    return this;
  }
  /** Original move assignment; no invented self guard, and each exchange completes before assignment. @param source - Rvalue owner. @returns This value. */
  moveAssign(source: SharedString): this {
    if (this.mpData[0] !== null) rtl_uString_release(this.mpData[0]);
    if (this.mpDataIgnoreCase[0] !== null) rtl_uString_release(this.mpDataIgnoreCase[0]);
    const data = source.mpData[0];
    source.mpData[0] = null;
    this.mpData[0] = data;
    const ignoreCase = source.mpDataIgnoreCase[0];
    source.mpDataIgnoreCase[0] = null;
    this.mpDataIgnoreCase[0] = ignoreCase;
    return this;
  }
  /** Original equality compares only original data. @param otherReference - Other const reference. @returns Original equality result. */
  equals(otherReference: SharedStringConstReference): boolean {
    const other = otherReference as SharedString;
    const data = this.mpData[0],
      otherData = other.mpData[0];
    if (data === otherData) return true;
    if (data === null || otherData === null) return false;
    if (data.length !== otherData.length) return false;
    return (
      rtl_ustr_reverseCompare_WithLength(
        data.buffer,
        data.length,
        otherData.buffer,
        otherData.length,
      ) === 0
    );
  }
  /** Original inequality. @param other - Other value. @returns Negated original equality. */
  notEquals(other: SharedStringConstReference): boolean {
    return !this.equals(other);
  }
  /** Original live const reference or static fallback. @returns Original-data string view. */
  getString(): OUStringConstReference {
    return this.mpData[0] !== null ? OUString.unacquired(this.mpData) : SharedString.EMPTY_STRING;
  }
  /** Original live folded-data const reference or static fallback. @returns Folded string view. */
  getIgnoreCaseString(): OUStringConstReference {
    return this.mpDataIgnoreCase[0] !== null
      ? OUString.unacquired(this.mpDataIgnoreCase)
      : SharedString.EMPTY_STRING;
  }
  /** Original const/nonconst pointer getters share a concrete pointer. @returns Original-data pointer. */
  getData(): rtl_uString | null {
    return this.mpData[0];
  }
  /** Original case-folded pointer getter. @returns Folded-data pointer. */
  getDataIgnoreCase(): rtl_uString | null {
    return this.mpDataIgnoreCase[0];
  }
  /** Original validity is based solely on original-data presence. @returns Original validity. */
  isValid(): boolean {
    return this.mpData[0] !== null;
  }
  /** Original nullable-empty predicate. @returns Original emptiness. */
  isEmpty(): boolean {
    return this.mpData[0] === null || this.mpData[0].length === 0;
  }
  /** Original nullable length. @returns Logical original length or zero. */
  getLength(): number {
    return this.mpData[0] !== null ? this.mpData[0].length : 0;
  }
}

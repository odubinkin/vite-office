/** @fileoverview Original byte-count constructor, binary lookup and lazy indexed flagged lookup bodies. */
import type {
  OneToOneMappingTable_t,
  UnicodePairWithFlag,
  UnicodePairFlag,
} from "../../inc/oneToOneMapping";

/** Original borrowed-table lookup owner; native copy construction/assignment are unavailable. */
export class oneToOneMapping {
  protected mpTable: readonly OneToOneMappingTable_t[] | null;
  protected mnSize: number;
  /** Original rnBytes/rnUnitSize row count; default native row size is four bytes. @param rpTable - Borrowed table pointer. @param rnBytes - Original table byte count. @param rnUnitSize - Native row size, default sizeof the two-unit struct. @returns Original lookup owner. */
  constructor(rpTable: readonly OneToOneMappingTable_t[] | null, rnBytes: number, rnUnitSize = 4) {
    this.mpTable = rpTable;
    this.mnSize = Math.trunc(rnBytes / rnUnitSize);
  }
  /** Original empty virtual destructor; borrowed rows are not destroyed and native index storage is GC-owned. @returns Nothing. */
  dispose(): void {}
  /** Original binary search, retaining duplicate selection and native integer midpoint division. @param nKey - Native sal_Unicode key. @returns Original translated unit or key. */
  find(nKey: number): number {
    const key = nKey & 0xffff;
    if (this.mpTable) {
      let bottom = 0,
        top = this.mnSize - 1;
      for (;;) {
        const current = Math.trunc((top + bottom) / 2),
          row = this.mpTable[current] as OneToOneMappingTable_t;
        if (key < row.first) top = current - 1;
        else if (key > row.first) bottom = current + 1;
        else return row.second;
        if (bottom > top) return key;
      }
    }
    return key;
  }
  /** Original operator[] delegates to virtual find; explicit method adapts C++ indexing syntax. @param nKey - Native key. @returns Virtual lookup result. */
  get(nKey: number): number {
    return this.find(nKey & 0xffff);
  }
}

/** Original final flagged lookup class; index entries borrow actual rows rather than copies. */
export class oneToOneMappingWithFlag extends oneToOneMapping {
  private mpTableWF: readonly UnicodePairWithFlag[] | null;
  private mnFlag: UnicodePairFlag;
  private mpIndex: ((UnicodePairWithFlag | null)[] | null)[];
  private mbHasIndex: boolean;
  /** Original base nullptr and sizeof(UnicodePairWithFlag) six-byte row count. @param rpTableWF - Borrowed flagged rows. @param rnSize - Original total byte size. @param rnFlag - Native signed8 mask. @returns Original flagged owner. */
  constructor(
    rpTableWF: readonly UnicodePairWithFlag[] | null,
    rnSize: number,
    rnFlag: UnicodePairFlag,
  ) {
    super(null, rnSize, 6);
    this.mpTableWF = rpTableWF;
    this.mnFlag = (rnFlag << 24) >> 24;
    this.mpIndex = Array(256).fill(null);
    this.mbHasIndex = false;
  }
  /** Original empty derived virtual destructor and base destruction; owned native index allocations use GC. @returns Nothing. */
  override dispose(): void {
    super.dispose();
  }
  /** Original lazy index allocation and row-pointer assignment; duplicate keys retain the last source row regardless of its flag. @returns Nothing. */
  makeIndex(): void {
    if (this.mbHasIndex || !this.mpTableWF) return;
    let current = -1;
    for (let k = 0; k < this.mnSize; k++) {
      const row = this.mpTableWF[k] as UnicodePairWithFlag,
        high = (row.first >> 8) & 0xff,
        low = row.first & 0xff;
      if (high !== current) {
        current = high;
        this.mpIndex[high] = Array(256).fill(null);
      }
      (this.mpIndex[high] as (UnicodePairWithFlag | null)[])[low] = row;
    }
    this.mbHasIndex = true;
  }
  /** Original index or binary lookup using the selected row's own flag. @param nKey - Native sal_Unicode key. @returns Original translated unit or key. */
  override find(nKey: number): number {
    const key = nKey & 0xffff;
    if (this.mpTableWF) {
      if (this.mbHasIndex) {
        const high = (key >> 8) & 0xff,
          low = key & 0xff,
          page = this.mpIndex[high] as (UnicodePairWithFlag | null)[] | null;
        if (
          page !== null &&
          page[low] !== null &&
          (page[low] as UnicodePairWithFlag).flag & this.mnFlag
        )
          return (page[low] as UnicodePairWithFlag).second;
        return key;
      }
      let bottom = 0,
        top = this.mnSize - 1;
      for (;;) {
        const current = Math.trunc((top + bottom) / 2),
          row = this.mpTableWF[current] as UnicodePairWithFlag;
        if (key < row.first) top = current - 1;
        else if (key > row.first) bottom = current + 1;
        else return row.flag & this.mnFlag ? row.second : key;
        if (bottom > top) return key;
      }
    }
    return key;
  }
}

/** @fileoverview Original ScCellValue scalar variant owner; genuine shared values and native JS refs are reused, rich-text/formula/document peer families remain unported. */
import { CellType } from "../../../inc/global";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";

/** Original first three std::variant alternatives represented by JS tags and values. */
type CellData =
  | { readonly index: 0 }
  | { readonly index: 1; readonly value: number }
  | { readonly index: 2; readonly value: SharedString };

/** Original owning cell value; scalar construction/set copies string values, logical moves empty their source. */
export class ScCellValue {
  private maData: CellData = { index: 0 };
  /** Original default/double/const SharedString constructors. @param value - Optional scalar value. @returns Cell value. */
  constructor(value?: number | SharedStringConstReference) {
    if (value !== undefined)
      this.maData =
        typeof value === "number"
          ? { index: 1, value }
          : { index: 2, value: new SharedString(value) };
  }
  /** Original reset_to_empty without allocation/refcount emulation. @returns Nothing. */
  private reset_to_empty(): void {
    this.maData = { index: 0 };
  }
  /** Original rvalue constructor adapts to a factory; semantic data transfer empties the source. @param source - Moved cell. @returns New cell value. */
  static move(source: ScCellValue): ScCellValue {
    const result = new ScCellValue();
    result.maData = source.maData;
    source.reset_to_empty();
    return result;
  }
  /** Original noexcept clear resets the variant and its existing shared value boundary. @returns Nothing. */
  clear(): void {
    if (this.maData.index === 2) this.maData.value.dispose();
    this.reset_to_empty();
  }
  /** Original scalar set first clears then assigns/copies the new value. @param value - Scalar value. @returns Nothing. */
  set(value: number | SharedStringConstReference): void {
    this.clear();
    this.maData =
      typeof value === "number"
        ? { index: 1, value }
        : { index: 2, value: new SharedString(value) };
  }
  /** Original mapping of the three implemented variant indices. @returns Native cell type. */
  getType(): CellType {
    switch (this.maData.index) {
      case 0:
        return CellType.CELLTYPE_NONE;
      case 1:
        return CellType.CELLTYPE_VALUE;
      case 2:
        return CellType.CELLTYPE_STRING;
    }
  }
  /** Original std::get numeric access rejects the wrong alternative; TypeError is the JS exception boundary. @returns Numeric value. */
  getDouble(): number {
    if (this.maData.index !== 1) throw new TypeError("bad_variant_access");
    return this.maData.value;
  }
  /** Original borrowed const shared value pointer, not a new copy. @returns Actual const member view. */
  getSharedString(): SharedStringConstReference {
    if (this.maData.index !== 2) throw new TypeError("bad_variant_access");
    return this.maData.value;
  }
  /** Original emptiness depends on the variant tag, not string content or numeric value. @returns Empty-cell predicate. */
  isEmpty(): boolean {
    return this.getType() === CellType.CELLTYPE_NONE;
  }
  /** Original move assignment clears before transfer, including self-move clearing. @param source - Moved cell. @returns This cell. */
  move_assign(source: ScCellValue): this {
    this.clear();
    this.maData = source.maData;
    source.reset_to_empty();
    return this;
  }
  /** Original std::swap transfers both variants, including self-swap. @param other - Swapped cell. @returns Nothing. */
  swap(other: ScCellValue): void {
    const data = this.maData;
    this.maData = other.maData;
    other.maData = data;
  }
}

/** Original non-owning scalar cell view; callers keep its source valid and use only the getter matching getType(). */
export class ScRefCellValue {
  private meType = CellType.CELLTYPE_NONE;
  private mfValue = 0;
  private mpString: SharedStringConstReference | null = null;
  /** Original scalar constructors and implicit memberwise copy; null selects the string-pointer overload. @param value - Optional scalar or copied view. @returns Cell reference. */
  constructor(value?: number | SharedStringConstReference | null | ScRefCellValue) {
    if (value instanceof ScRefCellValue) this.copy_assign(value);
    else if (value !== undefined) {
      if (typeof value === "number") {
        this.meType = CellType.CELLTYPE_VALUE;
        this.mfValue = value;
      } else {
        this.meType = CellType.CELLTYPE_STRING;
        this.mpString = value;
      }
    }
  }
  /** Native implicit assignment copies the value/reference without acquiring a string owner. @param source - Copied view. @returns This view. */
  copy_assign(source: ScRefCellValue): this {
    this.meType = source.meType;
    this.mfValue = source.mfValue;
    this.mpString = source.mpString;
    return this;
  }
  /** Original clear resets the tag and numeric value; drop the inactive JS reference for GC. @returns Nothing. */
  clear(): void {
    this.meType = CellType.CELLTYPE_NONE;
    this.mfValue = 0;
    this.mpString = null;
  }
  /** Original inline cell type query. @returns Native cell type. */
  getType(): CellType {
    return this.meType;
  }
  /** Original numeric getter requires VALUE; wrong union alternatives are outside its contract. @returns Numeric value. */
  getDouble(): number {
    return this.mfValue;
  }
  /** Original borrowed pointer getter requires STRING and can return null. @returns Actual borrowed shared value. */
  getSharedString(): SharedStringConstReference | null {
    return this.mpString;
  }
  /** Original emptiness tests the tag alone. @returns Empty-cell predicate. */
  isEmpty(): boolean {
    return this.meType === CellType.CELLTYPE_NONE;
  }
}

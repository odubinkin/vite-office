/** @fileoverview Owning scalar, rich-text and formula ScCellValue snapshots and borrowed ScRefCellValue views. */
import type { ScDocument } from "../../../inc/document";
import type { ScAddress } from "../../../inc/address";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { EditTextObject } from "../../../../editeng/inc/editobj";
import { CellType } from "../../../inc/global";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";

/** Original empty,numeric,shared-string and formula std::variant alternatives represented by JS tags and values. */
type CellData =
  | { readonly index: 0 }
  | { readonly index: 1; readonly value: number }
  | { readonly index: 2; readonly value: SharedString }
  | { readonly index: 3; readonly value: EditTextObject }
  | { readonly index: 4; readonly value: ScFormulaCell };

/** Original owning cell value; scalar construction/set copies string values, logical moves empty their source. */
export class ScCellValue {
  private maData: CellData = { index: 0 };
  /** Original default/scalar/copy and borrowed-reference constructors;formula alternatives clone the actual cell. @param value - Optional value or copied owner/view. @returns Cell value. */
  constructor(
    value?: number | SharedStringConstReference | EditTextObject | ScCellValue | ScRefCellValue,
  ) {
    if (value instanceof ScCellValue || value instanceof ScRefCellValue) {
      switch (value.getType()) {
        case CellType.CELLTYPE_NONE:
          break;
        case CellType.CELLTYPE_VALUE:
          this.maData = { index: 1, value: value.getDouble() };
          break;
        case CellType.CELLTYPE_STRING:
          this.maData = {
            index: 2,
            value: new SharedString(value.getSharedString() as SharedStringConstReference),
          };
          break;
        case CellType.CELLTYPE_EDIT:
          this.maData = { index: 3, value: (value.getEditText() as EditTextObject).Clone() };
          break;
        case CellType.CELLTYPE_FORMULA:
          this.maData = { index: 4, value: (value.getFormula() as ScFormulaCell).Clone() };
          break;
      }
    } else if (value instanceof EditTextObject) this.maData = { index: 3, value: value.Clone() };
    else if (value !== undefined)
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
    if (this.maData.index === 3) this.maData.value.dispose();
    if (this.maData.index === 4) this.maData.value.Dispose();
    this.reset_to_empty();
  }
  /** Original scalar set first clears then assigns/copies the new value. @param value - Scalar value. @returns Nothing. */
  set(value: number | SharedStringConstReference | EditTextObject | ScFormulaCell): void {
    this.clear();
    this.maData =
      typeof value === "number"
        ? { index: 1, value }
        : value instanceof EditTextObject
          ? { index: 3, value: value.Clone() }
          : "GetCode" in value
            ? { index: 4, value }
            : { index: 2, value: new SharedString(value) };
  }
  /** Original mapping of the four implemented variant indices. @returns Native cell type. */
  getType(): CellType {
    switch (this.maData.index) {
      case 0:
        return CellType.CELLTYPE_NONE;
      case 1:
        return CellType.CELLTYPE_VALUE;
      case 2:
        return CellType.CELLTYPE_STRING;
      case 3:
        return CellType.CELLTYPE_EDIT;
      case 4:
        return CellType.CELLTYPE_FORMULA;
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
  /** Borrows the owned edit object. @returns Edit text. */
  getEditText(): EditTextObject {
    if (this.maData.index !== 3) throw new TypeError("bad_variant_access");
    return this.maData.value;
  }
  /** Original formula variant getter;wrong alternatives follow the existing bad_variant_access boundary. @returns Actual owned formula. */
  getFormula(): ScFormulaCell {
    if (this.maData.index !== 4) throw new TypeError("bad_variant_access");
    return this.maData.value;
  }
  /** Original document assignment clears then copies current real content;formula cells are cloned and remain detached. @param rDoc - Source document. @param rPos - Source cell. @returns Nothing. */
  assign(rDoc: ScDocument, rPos: ScAddress): void {
    this.clear();
    const value = new ScCellValue(new ScRefCellValue(rDoc, rPos));
    this.maData = value.maData;
    value.reset_to_empty();
  }
  /** Original document commit copies owned content, including independently cloned edit text and formulas. Number-format transport remains separate. @param rDoc - Destination document. @param rPos - Destination cell. @returns Nothing. */
  commit(rDoc: ScDocument, rPos: ScAddress): void {
    switch (this.getType()) {
      case CellType.CELLTYPE_STRING:
        rDoc.SetTextCell(rPos, this.getSharedString().getString());
        break;
      case CellType.CELLTYPE_EDIT:
        rDoc.SetEditText(rPos, this.getEditText().Clone());
        break;
      case CellType.CELLTYPE_VALUE:
        rDoc.SetValue(rPos, this.getDouble());
        break;
      case CellType.CELLTYPE_FORMULA:
        rDoc.SetFormulaCell(rPos, this.getFormula().Clone());
        break;
      default:
        rDoc.SetEmptyCell(rPos);
    }
  }
  /** Original document release transfers formula ownership and empties this value;strings still copy through literal text input. @param rDoc - Destination document. @param rPos - Cell. @returns Nothing. */
  release(rDoc: ScDocument, rPos: ScAddress): void {
    switch (this.getType()) {
      case CellType.CELLTYPE_STRING:
        rDoc.SetTextCell(rPos, this.getSharedString().getString());
        break;
      case CellType.CELLTYPE_EDIT:
        rDoc.SetEditText(rPos, this.getEditText().Clone());
        break;
      case CellType.CELLTYPE_VALUE:
        rDoc.SetValue(rPos, this.getDouble());
        break;
      case CellType.CELLTYPE_FORMULA:
        rDoc.SetFormulaCell(rPos, this.getFormula());
        break;
      default:
        rDoc.SetEmptyCell(rPos);
    }
    if (this.maData.index === 2) this.maData.value.dispose();
    if (this.maData.index === 3) this.maData.value.dispose();
    this.reset_to_empty();
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

/** Original non-owning scalar/formula cell view; callers keep its source valid and use only the getter matching getType(). */
export class ScRefCellValue {
  private mpFormula: ScFormulaCell | null = null;
  private mpEditText: EditTextObject | null = null;
  private meType = CellType.CELLTYPE_NONE;
  private mfValue = 0;
  private mpString: SharedStringConstReference | null = null;
  /** Original scalar constructors and implicit memberwise copy; null selects the string-pointer overload. @param value - Optional scalar or copied view. @returns Cell reference. */
  constructor(
    value?:
      number | SharedStringConstReference | EditTextObject | null | ScRefCellValue | ScFormulaCell,
  );
  /** Borrows actual document content at the source position. @param value - Document. @param position - Cell. @returns View. */
  constructor(value: ScDocument, position: ScAddress);
  /** Binds native scalar/formula/document overloads. @param value - Value or owner. @param position - Document position. @returns View. */
  constructor(
    value?:
      | number
      | SharedStringConstReference
      | EditTextObject
      | null
      | ScRefCellValue
      | ScFormulaCell
      | ScDocument,
    position?: ScAddress,
  ) {
    if (position !== undefined) {
      this.copy_assign((value as ScDocument).GetRefCellValue(position));
      return;
    }
    if (value instanceof ScRefCellValue) this.copy_assign(value);
    else if (value !== undefined) {
      if (typeof value === "number") {
        this.meType = CellType.CELLTYPE_VALUE;
        this.mfValue = value;
      } else if (value instanceof EditTextObject) {
        this.meType = CellType.CELLTYPE_EDIT;
        this.mpEditText = value;
      } else if (value && "GetCode" in value) {
        this.meType = CellType.CELLTYPE_FORMULA;
        this.mpFormula = value;
      } else {
        this.meType = CellType.CELLTYPE_STRING;
        this.mpString = value as SharedStringConstReference | null;
      }
    }
  }
  /** Native implicit assignment copies the value/reference without acquiring a string owner. @param source - Copied view. @returns This view. */
  copy_assign(source: ScRefCellValue): this {
    this.meType = source.meType;
    this.mfValue = source.mfValue;
    this.mpString = source.mpString;
    this.mpFormula = source.mpFormula;
    this.mpEditText = source.mpEditText;
    return this;
  }
  /** Original clear resets the tag and numeric value; drop the inactive JS reference for GC. @returns Nothing. */
  clear(): void {
    this.meType = CellType.CELLTYPE_NONE;
    this.mfValue = 0;
    this.mpString = null;
    this.mpFormula = null;
    this.mpEditText = null;
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
  /** Borrows the edit object for the EDIT alternative. @returns Edit text or null. */
  getEditText(): EditTextObject | null {
    return this.mpEditText;
  }
  /** Borrows the actual formula pointer for the FORMULA alternative. @returns Formula or null. */
  getFormula(): ScFormulaCell | null {
    return this.mpFormula;
  }
  /** Native final-result empty predicate for represented cells. @returns Empty value. */
  hasEmptyValue(): boolean {
    return (
      this.meType === CellType.CELLTYPE_NONE ||
      (this.meType === CellType.CELLTYPE_FORMULA && (this.mpFormula as ScFormulaCell).IsEmpty())
    );
  }
  /** Native text predicate; formula errors remain value/error results. @returns Text value. */
  hasString(): boolean {
    return (
      this.meType === CellType.CELLTYPE_STRING ||
      this.meType === CellType.CELLTYPE_EDIT ||
      (this.meType === CellType.CELLTYPE_FORMULA && !(this.mpFormula as ScFormulaCell).IsValue())
    );
  }
  /** Original numeric predicate evaluates real formula results,including value/error results. @returns Numeric cell. */
  hasNumeric(): boolean {
    return (
      this.meType === CellType.CELLTYPE_VALUE ||
      (this.meType === CellType.CELLTYPE_FORMULA && (this.mpFormula as ScFormulaCell).IsValue())
    );
  }
  /** Original emptiness tests the tag alone. @returns Empty-cell predicate. */
  isEmpty(): boolean {
    return this.meType === CellType.CELLTYPE_NONE;
  }
}

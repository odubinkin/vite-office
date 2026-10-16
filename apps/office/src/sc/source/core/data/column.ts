/** @fileoverview Scalar ScColumn storage contracts over the existing shared block vector and text metadata. Formula,rich-text,notes and listener services are outside this initial subset. */
import {
  CellStoreType,
  CellTextAttrStoreType,
  string_element_callbacks,
  string_value_type,
} from "../../../inc/mtvelements";
import { double_element_callbacks } from "../../../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks.ts";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { CellType } from "../../../inc/global";
import {
  element_type_numeric,
  element_type_string,
  celltextattr_element_callbacks,
} from "../../../inc/mtvelements";
import { CellTextAttr } from "../../../inc/celltextattr";
import type { ScDocument } from "../../../inc/document";

/** Initial numeric/string portion of the column owner;cells are not stored in an application-side grid. */
export class ScColumn {
  private nCol = 0;
  private nTab = 0;
  private readonly maCells: CellStoreType;
  private readonly maCellTextAttrs: CellTextAttrStoreType;
  /** Creates empty stores spanning the document's actual row domain. @param rDocument - Owning document. @returns Column. */
  constructor(private readonly rDocument: ScDocument) {
    this.maCells = new CellStoreType(rDocument.GetMaxRowCount());
    this.maCellTextAttrs = new CellTextAttrStoreType(rDocument.GetMaxRowCount());
  }
  /** Initializes position in the owning sheet;full attribute-array services are not claimed. @param col - Column. @param tab - Sheet. @returns Nothing. */
  Init(col: number, tab: number): void {
    this.nCol = col;
    this.nTab = tab;
  }
  /** Reads the native column coordinate. @returns Column. */
  GetCol(): number {
    return this.nCol;
  }
  /** Reads the native sheet coordinate. @returns Sheet. */
  GetTab(): number {
    return this.nTab;
  }
  /** Borrows the actual owning document. @returns Document. */
  GetDoc(): ScDocument {
    return this.rDocument;
  }
  /** Writes numeric cell content and invalidates its text measurement metadata. @param row - Row. @param value - Number. @returns Nothing. */
  SetValue(row: number, value: number): void {
    if (!this.rDocument.ValidRow(row)) return;
    this.maCells.set(row, value, double_element_callbacks);
    this.maCellTextAttrs.set(row, new CellTextAttr(), celltextattr_element_callbacks);
  }
  /** Stores literal text using the document's shared pool,without number or formula recognition. @param row - Row. @param value - Unicode text or already interned string. @returns Nothing. */
  SetRawString(row: number, value: OUStringConstReference | SharedStringConstReference): void {
    if (!this.rDocument.ValidRow(row)) return;
    const shared =
      "getData" in value
        ? new SharedString(value)
        : this.rDocument.GetSharedStringPool().intern(value);
    try {
      this.maCells.set(row, shared, string_element_callbacks);
      this.maCellTextAttrs.set(row, new CellTextAttr(), celltextattr_element_callbacks);
    } finally {
      shared.dispose();
    }
  }
  /** Reads the scalar discriminator;unsupported cell alternatives cannot be inserted in this store. @param row - Valid row. @returns Cell type. */
  GetCellType(row: number): CellType {
    const kind = this.maCells.get_type(row);
    return kind === element_type_numeric
      ? CellType.CELLTYPE_VALUE
      : kind === element_type_string
        ? CellType.CELLTYPE_STRING
        : CellType.CELLTYPE_NONE;
  }
  /** Returns zero for nonnumeric cells,as required by the native scalar getter. @param row - Valid row. @returns Value. */
  GetValue(row: number): number {
    return this.maCells.get_type(row) === element_type_numeric
      ? this.maCells.get(row, double_element_callbacks)
      : 0;
  }
  /** Returns an independent shared string value,or its native empty default. @param row - Valid row. @returns Shared text. */
  GetSharedString(row: number): SharedString {
    return this.maCells.get_type(row) === element_type_string
      ? this.maCells.get(row, string_element_callbacks, string_value_type)
      : new SharedString();
  }
  /** Clears content and its text metadata in the represented scalar stores. @param row - Valid row. @returns Nothing. */
  Delete(row: number): void {
    this.maCells.set_empty(row, row);
    this.maCellTextAttrs.set_empty(row, row);
  }
}

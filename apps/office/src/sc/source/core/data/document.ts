/** @fileoverview Minimal ScDocument scalar editing chain for the first browser/ODS integration. Full native construction,formatting,formula and shell services are not claimed. */
import { ScTable } from "../../../inc/table";
import {
  ScAddress,
  MAXCOL,
  MAXROW,
  MAXROWCOUNT,
  MAXTAB,
  SC_TAB_APPEND,
  ValidCol,
  ValidRow,
  ValidTab,
} from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { SharedStringPool } from "../../../../svl/inc/sharedstringpool";
import { uppercase } from "../../../../unotools/inc/charclass";
import { MsLangId } from "../../../../i18nlangtag/inc/mslangid";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Explicit initial document subset;all supported cells live in its actual sheet/column chain. */
export class ScDocument {
  private readonly maTabs: ScTable[] = [];
  private readonly locale = MsLangId.Conversion.convertLanguageToLocale(0, false);
  private readonly mpCellStringPool: SharedStringPool;
  /** Creates the scalar document's shared pool using the existing prepared-locale uppercase operation. @returns Document. */
  constructor() {
    const locale = this.locale;
    this.mpCellStringPool = new SharedStringPool({
      /** Applies the existing real whole-string classifier field binding. @param value - Unicode source. @returns Uppercase value. */
      uppercase(value) {
        return uppercase(value, locale);
      },
    });
  }
  /** Borrows the actual shared string pool. @returns Pool. */
  GetSharedStringPool(): SharedStringPool {
    return this.mpCellStringPool;
  }
  /** Reads the normal native row limit. @returns Last row. */
  MaxRow(): number {
    return MAXROW;
  }
  /** Reads the normal native column limit. @returns Last column. */
  MaxCol(): number {
    return MAXCOL;
  }
  /** Reports the full logical row domain of every column store. @returns Count. */
  GetMaxRowCount(): number {
    return MAXROWCOUNT;
  }
  /** Checks native row bounds. @param row - Row. @returns Validity. */
  ValidRow(row: number): boolean {
    return ValidRow(row, MAXROW);
  }
  /** Checks native column/row bounds. @param col - Column. @param row - Row. @returns Validity. */
  ValidColRow(col: number, row: number): boolean {
    return ValidCol(col, MAXCOL) && this.ValidRow(row);
  }
  /** Reports actual sheet ownership count. @returns Count. */
  GetTableCount(): number {
    return this.maTabs.length;
  }
  /** Borrows a real existing sheet or native null result. @param tab - Sheet. @returns Owner or null. */
  FetchTable(tab: number): ScTable | null {
    return ValidTab(tab) && tab < this.maTabs.length ? (this.maTabs[tab] as ScTable) : null;
  }
  /** Copies the sheet name or clears the output for a missing sheet. @param tab - Sheet. @param output - Unicode target. @returns Found. */
  GetName(tab: number, output: OUString): boolean {
    const table = this.FetchTable(tab);
    if (!table) {
      output.clear();
      return false;
    }
    output.assign(table.GetName());
    return true;
  }
  /** Applies native editable sheet-name character constraints without a fabricated length limit. @param name - Native Unicode name. @returns Validity. */
  static ValidTabName(name: OUStringConstReference): boolean {
    const value = text(name);
    return !!value && !/[:\\/?*[\]]/.test(value) && !value.startsWith("'") && !value.endsWith("'");
  }
  /** Rejects duplicate names using the existing real uppercase operation. @param name - New name. @returns Availability. */
  ValidNewTabName(name: OUStringConstReference): boolean {
    if (!ScDocument.ValidTabName(name)) return false;
    const candidate = uppercase(name, this.locale);
    for (const table of this.maTabs)
      if (uppercase(table.GetName(), this.locale).equals(candidate)) return false;
    return true;
  }
  /** Inserts a normal scalar sheet and updates shifted sheet/column positions. External-document/undo-delete modes remain unsupported APIs. @param position - Position or native append sentinel. @param name - Native sheet name. @returns Inserted. */
  InsertTab(position: number, name: OUStringConstReference): boolean {
    if (this.maTabs.length > MAXTAB || !this.ValidNewTabName(name)) return false;
    if (position === SC_TAB_APPEND || position >= this.maTabs.length) position = this.maTabs.length;
    if (!ValidTab(position)) return false;
    this.maTabs.splice(position, 0, new ScTable(this, position, name));
    for (let i = position + 1; i < this.maTabs.length; i++) (this.maTabs[i] as ScTable).SetTabNo(i);
    return true;
  }
  /** Writes a number through the actual sheet/column chain. @param position - Cell address. @param value - Number. @returns Nothing. */
  SetValue(position: ScAddress, value: number): void {
    this.FetchTable(position.Tab())?.SetValue(position.Col(), position.Row(), value);
  }
  /** Reads numeric cells with native zero fallback. @param position - Cell address. @returns Value. */
  GetValue(position: ScAddress): number {
    return this.FetchTable(position.Tab())?.GetValue(position.Col(), position.Row()) ?? 0;
  }
  /** Reads the actual stored scalar discriminator. @param position - Cell address. @returns Type. */
  GetCellType(position: ScAddress): CellType {
    return (
      this.FetchTable(position.Tab())?.GetCellType(position.Col(), position.Row()) ??
      CellType.CELLTYPE_NONE
    );
  }
  /** Returns an independent shared-string value. @param position - Cell address. @returns Shared text. */
  GetSharedString(position: ScAddress): SharedString {
    return (
      this.FetchTable(position.Tab())?.GetSharedString(position.Col(), position.Row()) ??
      new SharedString()
    );
  }
  /** Implements the literal single-line content portion of SetTextCell;rich edit-text and number-format attributes are explicit gaps. @param position - Cell address. @param value - Literal Unicode input. @returns Nothing. */
  SetTextCell(position: ScAddress, value: OUStringConstReference): void {
    const table = this.FetchTable(position.Tab());
    if (!table || !this.ValidColRow(position.Col(), position.Row())) return;
    if (/[\r\n]/.test(text(value)))
      throw new Error("Multiline edit-text cells are not implemented");
    if (!value.getLength()) {
      table.SetEmptyCell(position.Col(), position.Row());
      return;
    }
    const shared = this.mpCellStringPool.intern(value);
    try {
      table.SetRawString(position.Col(), position.Row(), shared);
    } finally {
      shared.dispose();
    }
  }
  /** Clears an existing scalar cell without allocating a missing column or sheet. @param position - Cell address. @returns Nothing. */
  SetEmptyCell(position: ScAddress): void {
    this.FetchTable(position.Tab())?.SetEmptyCell(position.Col(), position.Row());
  }
}

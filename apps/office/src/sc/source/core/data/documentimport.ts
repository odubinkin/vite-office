/** @fileoverview ScDocumentImport block-position writes and post-import formula/text-attribute initialization. */
import { ScCellValue } from "../../../inc/cellvalue";
import { CellType } from "../../../inc/global";
import type { ScSetStringParam } from "../../../inc/stringutil";
import type { EditTextObject } from "../../../../editeng/inc/editobj";
import { double_element_callbacks } from "../../../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
import type { Grammar } from "../../../../formula/inc/grammar";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { ValidTab, type ScAddress } from "../../../inc/address";
import { CellTextAttr } from "../../../inc/celltextattr";
import type { ScColumn } from "../../../inc/column";
import type { ScDocument } from "../../../inc/document";
import { ScFormulaCell } from "../../../inc/formulacell";
import { StartListeningContext } from "../../../inc/listenercontext";
import {
  CellTextAttrStoreType,
  TableColumnBlockPositionSet,
  celltextattr_block,
  celltextattr_element_callbacks,
  edittext_element_callbacks,
  element_type_empty,
  element_type_formula,
  element_type_numeric,
  formula_block,
  formula_element_callbacks,
  string_element_callbacks,
  type ColumnBlockPosition,
} from "../../../inc/mtvelements";
import { SharedFormulaUtil } from "../../../inc/sharedformula";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScTable } from "../../../inc/table";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import { delayed_delete_vector_iterator } from "../../../../external/mdds/include/mdds/multi_type_vector/delayed_delete_vector";

/** Original represented ScDocumentImportImpl cache and listening state. */
class ScDocumentImportImpl {
  readonly listenContext: StartListeningContext;
  readonly blockPositions: TableColumnBlockPositionSet[] = [];
  defaultScriptNumeric: SvtScriptType = SvtScriptType.UNKNOWN;
  /** Binds the actual import document. @param document - Document.  @returns Constructed instance. */
  constructor(readonly document: ScDocument) {
    this.listenContext = new StartListeningContext(document);
  }
  /** Source lazy per-sheet cache creation. @param tab - Sheet. @param col - Column. @returns Hint or null outside the source column/sheet domain. */
  getBlockPosition(tab: number, col: number): ColumnBlockPosition | null {
    if (!ValidTab(tab) || !this.document.ValidCol(col)) return null;
    for (let index = this.blockPositions.length; index <= tab; index++)
      this.blockPositions.push(new TableColumnBlockPositionSet(this.document, index));
    return (this.blockPositions[tab] as TableColumnBlockPositionSet).getBlockPosition(col);
  }
}

/** Native document-bound importer; normal editing setters and broadcasts are bypassed until finalization. */
export class ScDocumentImport {
  private readonly impl: ScDocumentImportImpl;
  /** Binds the actual target. @param document - Document. @returns Importer. */
  constructor(document: ScDocument) {
    this.impl = new ScDocumentImportImpl(document);
  }
  /** Borrows the native document. @returns Document. */
  getDoc(): ScDocument {
    return this.impl.document;
  }
  /** Initializes existing sheet caches as in ScDocumentImportImpl::initForSheets. @returns Nothing. */
  initForSheets(): void {
    for (let tab = this.impl.blockPositions.length; tab < this.getDoc().GetTableCount(); tab++)
      this.impl.blockPositions.push(new TableColumnBlockPositionSet(this.getDoc(), tab));
  }
  /** Original name lookup distinguishes its minus-one failure result from GetTable's zeroed out-parameter. @param name - Native sheet name. @returns Existing sheet index or minus one. */
  getSheetIndex(name: OUStringConstReference): number {
    const tab: [number] = [-1];
    return this.getDoc().GetTable(name, tab) ? tab[0] : -1;
  }
  /** Original load-only sheet rename forwards to document admission. @param tab - Native sheet index. @param name - Prepared sheet name. @returns Nothing. */
  setSheetName(tab: number, name: OUStringConstReference): void {
    this.getDoc().SetTabNameOnLoad(tab, name);
  }
  /** Original import sheet count, without normal editing-side state. @returns Actual sheet-vector size. */
  getSheetCount(): number {
    return this.getDoc()["maTabs"].length;
  }
  /** Original raw sheet append, without editing validation/reference updates or broadcasting. @param name - Prepared native sheet name. @returns Whether the native sheet limit admits append. */
  appendSheet(name: OUStringConstReference): boolean {
    const document = this.getDoc(),
      tab = document["maTabs"].length;
    if (!ValidTab(tab)) return false;
    document["maTabs"].push(new ScTable(document, tab, name));
    return true;
  }
  /** Original document-options null-date assignment, without the broader SetDocOptions formatter update. @param year - Native unsigned16 year. @param month - Native unsigned16 month. @param day - Native unsigned16 day. @returns Nothing. */
  setOriginDate(year: number, month: number, day: number): void {
    this.getDoc()["pDocOptions"].SetDate(day & 0xffff, month & 0xffff, year & 0xffff);
  }
  /** Sets the source default script for numeric blocks. @param script - Script flags. @returns Nothing. */
  setDefaultNumericScript(script: SvtScriptType): void {
    this.impl.defaultScriptNumeric = script;
  }
  /** Invalidates one existing sheet's cached iterators. @param tab - Sheet. @returns Nothing. */
  invalidateBlockPositionSet(tab: number): void {
    this.impl.blockPositions[tab]?.invalidate();
  }
  /** Original ParseString-based automatic cell input and direct typed-store transfer. @param pos - Cell position. @param value - Input text. @param parameter - Optional native policy. @returns Nothing. */
  setAutoInput(
    pos: ScAddress,
    value: OUStringConstReference,
    parameter: ScSetStringParam | null = null,
  ): void {
    const document = this.getDoc(),
      table = document.FetchTable(pos.Tab());
    if (!table) return;
    const block = this.impl.getBlockPosition(pos.Tab(), pos.Col());
    if (!block) return;
    if (parameter && !parameter.mbCheckLinkFormula)
      throw new Error("assert(!pStringParam || pStringParam->mbCheckLinkFormula)");
    const cell = new ScCellValue(),
      column = table.CreateColumnIfNotExists(pos.Col()),
      store = column.GetCellStore();
    try {
      column.ParseString(
        cell,
        pos.Row(),
        pos.Tab(),
        value,
        document.GetAddressConvention(),
        parameter,
      );
      const cursor = block.miCellPos as NonNullable<ColumnBlockPosition["miCellPos"]>;
      switch (cell.getType()) {
        case CellType.CELLTYPE_STRING:
          block.miCellPos = store.set(
            cursor,
            pos.Row(),
            cell.getSharedString(),
            string_element_callbacks,
          );
          break;
        case CellType.CELLTYPE_EDIT:
          block.miCellPos = store.set(
            cursor,
            pos.Row(),
            cell.releaseEditText(),
            edittext_element_callbacks,
          );
          break;
        case CellType.CELLTYPE_VALUE:
          block.miCellPos = store.set(
            cursor,
            pos.Row(),
            cell.getDouble(),
            double_element_callbacks,
          );
          break;
        case CellType.CELLTYPE_FORMULA:
          if (!parameter)
            document.CheckLinkFormulaNeedingCheck((cell.getFormula() as ScFormulaCell).GetCode());
          block.miCellPos = store.set(
            cursor,
            pos.Row(),
            cell.releaseFormula(),
            formula_element_callbacks,
          );
          break;
        default:
          block.miCellPos = store.set_empty(cursor, pos.Row(), pos.Row());
      }
    } finally {
      cell.clear();
    }
  }
  /** Writes numeric content without a second import model. @param pos - Position. @param value - Number. @returns Nothing. */
  setNumericCell(pos: ScAddress, value: number): void {
    const table = this.getDoc().FetchTable(pos.Tab());
    if (!table) return;
    const block = this.impl.getBlockPosition(pos.Tab(), pos.Col());
    if (!block) return;
    block.miCellPos = table
      .CreateColumnIfNotExists(pos.Col())
      .GetCellStore()
      .set(
        block.miCellPos as NonNullable<ColumnBlockPosition["miCellPos"]>,
        pos.Row(),
        value,
        double_element_callbacks,
      );
  }
  /** Writes the actual raw shared string alternative. @param pos - Position. @param value - Literal text. @returns Nothing. */
  setStringCell(pos: ScAddress, value: OUStringConstReference): void {
    const document = this.getDoc(),
      table = document.FetchTable(pos.Tab());
    if (!table) return;
    const block = this.impl.getBlockPosition(pos.Tab(), pos.Col());
    if (!block) return;
    const shared = document.GetSharedStringPool().intern(value);
    try {
      if (!shared.getData()) return;
      block.miCellPos = table
        .CreateColumnIfNotExists(pos.Col())
        .GetCellStore()
        .set(
          block.miCellPos as NonNullable<ColumnBlockPosition["miCellPos"]>,
          pos.Row(),
          shared,
          string_element_callbacks,
        );
    } finally {
      shared.dispose();
    }
  }
  /** Source owned edit-object setter normalizes shared strings and transfers the object to storage. @param pos - Position. @param value - Transferred edit object. @returns Nothing. */
  setEditCell(pos: ScAddress, value: EditTextObject): void {
    const document = this.getDoc(),
      table = document.FetchTable(pos.Tab());
    if (!table) {
      value.dispose();
      return;
    }
    const block = this.impl.getBlockPosition(pos.Tab(), pos.Col());
    if (!block) {
      value.dispose();
      return;
    }
    value.NormalizeString(document.GetSharedStringPool());
    block.miCellPos = table
      .CreateColumnIfNotExists(pos.Col())
      .GetCellStore()
      .set(
        block.miCellPos as NonNullable<ColumnBlockPosition["miCellPos"]>,
        pos.Row(),
        value,
        edittext_element_callbacks,
      );
  }
  /** Original source formula with an optional numeric cache or mandatory string cache. @param pos - Destination. @param value - Formula source. @param grammar - Explicit grammar. @param result - Optional cached double or actual Unicode result. @returns Nothing. */
  setFormulaCell(
    pos: ScAddress,
    value: OUStringConstReference,
    grammar: Grammar,
    result?: number | OUStringConstReference,
  ): void;
  /** Original by-value unique token array transfer, including destruction on rejected destinations. @param pos - Destination. @param tokens - Transferred actual token array. @returns Nothing. */
  setFormulaCell(pos: ScAddress, tokens: ScTokenArray): void;
  /** Original raw formula pointer transfer on successful write; rejection leaves it caller-owned. @param pos - Destination. @param cell - Actual formula or native null pointer. @returns Nothing. */
  setFormulaCell(pos: ScAddress, cell: ScFormulaCell | null): void; // eslint-disable-line @typescript-eslint/unified-signatures -- Native raw-pointer and unique_ptr ownership differ.
  /** Dispatches the original overloads without a replacement formula/result model. @param pos - Destination. @param value - Source, owned tokens or raw cell. @param grammar - Source-string grammar. @param result - Cached source-string result. @returns Nothing. */
  setFormulaCell(
    pos: ScAddress,
    value: OUStringConstReference | ScTokenArray | ScFormulaCell | null,
    grammar?: Grammar,
    result?: number | OUStringConstReference,
  ): void {
    const document = this.getDoc(),
      table = document.FetchTable(pos.Tab());
    if (!table) {
      if (value instanceof ScTokenArray) value.Clear();
      return;
    }
    const block = this.impl.getBlockPosition(pos.Tab(), pos.Col());
    if (!block) {
      if (value instanceof ScTokenArray) value.Clear();
      return;
    }
    const raw = value === null || value instanceof ScFormulaCell;
    const cell = raw
      ? value
      : value instanceof ScTokenArray
        ? new ScFormulaCell(document, pos, value)
        : new ScFormulaCell(document, pos, value, grammar as Grammar);
    let transferred = false;
    try {
      if (cell !== null) document.CheckLinkFormulaNeedingCheck(cell.GetCode());
      if (!raw && !(value instanceof ScTokenArray) && result !== undefined) {
        if (typeof result === "number") (cell as ScFormulaCell).SetResultDouble(result);
        else {
          const shared = document.GetSharedStringPool().intern(result);
          try {
            (cell as ScFormulaCell).SetHybridString(shared);
          } finally {
            shared.dispose();
          }
        }
      }
      const cells = table.CreateColumnIfNotExists(pos.Col()).GetCellStore();
      if (raw) {
        const position = cells.position(pos.Row());
        if (
          !position.first.equals(cells.end()) &&
          position.first.get().type === element_type_formula
        ) {
          const old = formula_block.at(
            position.first.get().data as base_element_block,
            position.second,
          ) as ScFormulaCell;
          SharedFormulaUtil.unshareFormulaCell(position, old);
        }
      }
      transferred = true; // Native unique_ptr::release occurs before the storage call.
      block.miCellPos = cells.set(
        block.miCellPos as NonNullable<ColumnBlockPosition["miCellPos"]>,
        pos.Row(),
        cell,
        formula_element_callbacks,
      );
    } finally {
      // The native source/token overload owns a local unique_ptr until rCells.set takes it.
      if (!transferred && !raw) cell?.Dispose();
    }
  }
  /** Original numeric/string-only fill-down; formulas, rich text and empty sources deliberately do nothing. @param pos - Source cell. @param fillSize - Number of following rows. @returns Nothing. */
  fillDownCells(pos: ScAddress, fillSize: number): void {
    const table = this.getDoc().FetchTable(pos.Tab());
    if (!table) return;
    const block = this.impl.getBlockPosition(pos.Tab(), pos.Col());
    if (!block) return;
    const column = table.CreateColumnIfNotExists(pos.Col()),
      cells = column.GetCellStore(),
      source = column.GetCellValue(block, pos.Row()),
      count = fillSize | 0;
    if (source.getType() === CellType.CELLTYPE_VALUE) {
      const value = source.getDouble(),
        values = Array<number | undefined>(count).fill(undefined);
      for (let index = 0; index < count; ++index) values[index] = value;
      const storage = { values, size: count };
      block.miCellPos = cells.set(
        block.miCellPos as NonNullable<ColumnBlockPosition["miCellPos"]>,
        pos.Row() + 1,
        new delayed_delete_vector_iterator(storage, 0),
        new delayed_delete_vector_iterator(storage, count),
        double_element_callbacks,
      );
    } else if (source.getType() === CellType.CELLTYPE_STRING) {
      const shared = source.getSharedString() as SharedStringConstReference,
        values: SharedString[] = [];
      try {
        for (let index = 0; index < count; ++index) values.push(new SharedString(shared));
        const storage = { values, size: count };
        block.miCellPos = cells.set(
          block.miCellPos as NonNullable<ColumnBlockPosition["miCellPos"]>,
          pos.Row() + 1,
          new delayed_delete_vector_iterator(storage, 0),
          new delayed_delete_vector_iterator(storage, count),
          string_element_callbacks,
        );
      } finally {
        for (let index = values.length - 1; index >= 0; --index)
          (values[index] as SharedString).dispose();
      }
    }
  }
  /** Original initColumn regroups formulas, recreates text metadata and starts native group/individual listeners. Format-specific Latin hints, outline finalization and absent compute caches remain outside this slice. @param column - Stored column. @returns Nothing. */
  initColumn(column: ScColumn): void {
    column.RegroupFormulaCells();
    const attrs = new CellTextAttrStoreType(this.getDoc().GetMaxRowCount()),
      cells = column.GetCellStore();
    let attrPosition = attrs.begin();
    for (
      const iterator = cells.begin(), end = cells.end();
      !iterator.equals(end);
      iterator.increment()
    ) {
      const node = iterator.get();
      if (node.type === element_type_empty) continue;
      const initial = new CellTextAttr();
      if (node.type === element_type_numeric) initial.mnScriptType = this.impl.defaultScriptNumeric;
      const defaults = celltextattr_block.create_block(node.size);
      try {
        const first = celltextattr_block.begin(defaults),
          last = celltextattr_block.end(defaults);
        for (const value = first.copy(); !value.equals(last); value.advance(1))
          value.get().assign(initial);
        attrPosition = attrs.set(
          attrPosition,
          node.position,
          first,
          last,
          celltextattr_element_callbacks,
        );
      } finally {
        celltextattr_block.delete_block(defaults);
      }
      if (node.type !== element_type_formula) continue;
      const pointer = formula_block.begin(node.data as base_element_block),
        last = formula_block.end(node.data as base_element_block);
      for (; !pointer.equals(last); pointer.advance(1)) {
        const cell = pointer.get() as ScFormulaCell;
        if (cell.IsSharedTop()) {
          SharedFormulaUtil.startListeningAsGroup(this.impl.listenContext, pointer);
          pointer.advance(cell.GetSharedLength() - 1);
        } else cell.StartListeningTo(this.impl.listenContext);
      }
    }
    attrs.swap(column["maCellTextAttrs"]);
    attrs.clear();
  }
  /** Original whole-document post-import initialization, after all cells have been written. @returns Nothing. */
  finalize(): void {
    for (const table of this.getDoc()["maTabs"]) {
      if (!table) continue;
      const count = table["aCol"].length;
      for (let col = 0; col < count; col++) this.initColumn(table["aCol"][col] as ScColumn);
    }
  }
}

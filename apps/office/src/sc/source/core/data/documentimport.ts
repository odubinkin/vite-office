/** @fileoverview ScDocumentImport block-position writes and post-import formula/text-attribute initialization. */
import type { ScDocument } from "../../../inc/document";
import { ValidTab, type ScAddress } from "../../../inc/address";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { Grammar } from "../../../../formula/inc/grammar";
import { ScFormulaCell } from "../../../inc/formulacell";
import type { ScColumn } from "../../../inc/column";
import {
  TableColumnBlockPositionSet,
  CellTextAttrStoreType,
  celltextattr_block,
  celltextattr_element_callbacks,
  formula_block,
  formula_element_callbacks,
  string_element_callbacks,
  element_type_empty,
  element_type_numeric,
  element_type_formula,
  edittext_element_callbacks,
  type ColumnBlockPosition,
} from "../../../inc/mtvelements";
import { double_element_callbacks } from "../../../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
import { CellTextAttr } from "../../../inc/celltextattr";
import { StartListeningContext } from "../../../inc/listenercontext";
import { SharedFormulaUtil } from "../../../inc/sharedformula";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import type { EditTextObject } from "../../../../editeng/inc/editobj";

/** Original represented ScDocumentImportImpl cache and listening state. */
class ScDocumentImportImpl {
  readonly listenContext: StartListeningContext;
  readonly blockPositions: TableColumnBlockPositionSet[] = [];
  defaultScriptNumeric: SvtScriptType = SvtScriptType.UNKNOWN;
  /** Binds the actual import document. @param document - Document. */
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
  /** Sets the source default script for numeric blocks. @param script - Script flags. @returns Nothing. */
  setDefaultNumericScript(script: SvtScriptType): void {
    this.impl.defaultScriptNumeric = script;
  }
  /** Invalidates one existing sheet's cached iterators. @param tab - Sheet. @returns Nothing. */
  invalidateBlockPositionSet(tab: number): void {
    this.impl.blockPositions[tab]?.invalidate();
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
  /** Uses the native source-string formula overload,with explicit grammar and existing real token compilation. @param pos - Position. @param value - Formula. @param grammar - Grammar. @param result - Optional cached double. @returns Nothing. */
  setFormulaCell(
    pos: ScAddress,
    value: OUStringConstReference,
    grammar: Grammar,
    result?: number,
  ): void {
    const document = this.getDoc(),
      table = document.FetchTable(pos.Tab());
    if (!table) return;
    const block = this.impl.getBlockPosition(pos.Tab(), pos.Col());
    if (!block) return;
    const cell = new ScFormulaCell(document, pos, value, grammar);
    if (result !== undefined) cell.SetResultDouble(result);
    block.miCellPos = table
      .CreateColumnIfNotExists(pos.Col())
      .GetCellStore()
      .set(
        block.miCellPos as NonNullable<ColumnBlockPosition["miCellPos"]>,
        pos.Row(),
        cell,
        formula_element_callbacks,
      );
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

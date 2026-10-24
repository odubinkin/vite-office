/** @fileoverview Scalar/local-reference column storage and native single-cell broadcasters. Rich text,notes,area/group services remain unsupported. */
import { ParseBlock, ProcessBlock, type CellStoreNode } from "../../../inc/mtvfunctions";
import { SingleColumnSpanSet, type ColumnSpanSet } from "../../../inc/columnspanset";
import * as column3 from "./column3";
import * as column4 from "./column4";
import { SharedFormulaUtil } from "../../../inc/sharedformula";
import {
  ConvertToGroupListening,
  SingleCellListening,
  type StartListeningType,
} from "../../../inc/types";
import { HasAttrFlags } from "../../../inc/global";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types.ts";
import { celltextattr_block, element_type_celltextattr } from "../../../inc/mtvelements";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import type { ScLineFlags } from "../../../inc/attarray";
import type { SvxBoxItem, SvxBoxInfoItem } from "../../../../editeng/source/items/frmitems";
import {
  CellStoreType,
  element_type_empty,
  CellTextAttrStoreType,
  string_element_callbacks,
  string_value_type,
  formula_element_callbacks,
  element_type_formula,
  formula_block,
  CellStoreEvent,
} from "../../../inc/mtvelements";
import { double_element_callbacks } from "../../../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks.ts";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { RefUpdateContext, SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { SvtBroadcaster } from "../../../../svl/source/notify/broadcast";
import type { SvtListener } from "../../../../svl/source/notify/listener";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { ScHint } from "../../../inc/brdcst";
import {
  BroadcasterStoreType,
  broadcaster_element_callbacks,
  element_type_broadcaster,
  toRefCell,
} from "../../../inc/mtvelements";
import { ProcessFormula } from "../../../inc/mtvcellfunc";
import { ScFormulaCell } from "../../../inc/formulacell";
import {
  ColumnBlockPosition,
  ColumnBlockPositionSet,
  type ColumnBlockConstPosition,
} from "../../../inc/mtvelements";
import { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import { broadcaster_block } from "../../../inc/mtvelements";
import type { delayed_delete_vector_iterator } from "../../../../external/mdds/include/mdds/multi_type_vector/delayed_delete_vector";
import { ScAddress } from "../../../inc/address";
import type { Grammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { CellType, InsertDeleteFlags, UpdateRefMode } from "../../../inc/global";
import {
  element_type_numeric,
  element_type_string,
  celltextattr_element_callbacks,
} from "../../../inc/mtvelements";
import { CellTextAttr } from "../../../inc/celltextattr";
import type { ScDocument } from "../../../inc/document";
import type { ScMergePatternState } from "../../../inc/attarray";
import type { ScMarkData } from "../../../inc/markdata";
import { ScItemPoolCache } from "../../../inc/poolcach";
import { SV_COUNTRY_LANGUAGE_OFFSET } from "../../../../svl/inc/zforlist";
import type { ScInterpreterContext } from "../../../inc/interpretercontext";
import { CopyToDocContext } from "../../../inc/clipcontext";
import { ScMultiSelIter } from "../../../inc/markmulti";

import { ScAttrArray } from "./attarray";
import { ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
/** Attribute portion of native ScColumnData, also used for the real default column. */
export class ScColumnData {
  /** Original existing-line mutation traverses only actual multi marks. @param marks - Marks. @param line - Style or absence. @param colorOnly - Color mode. @returns Nothing. */
  ApplySelectionLineStyle(
    marks: ScMarkData,
    line: SvxBorderLine | undefined,
    colorOnly: boolean,
  ): void {
    if (colorOnly && !line) return;
    if (marks.IsMultiMarked()) {
      const iter = new ScMultiSelIter(marks.GetMultiSelData(), this.nCol);
      for (let span = iter.Next(0, 0); span[0]; span = iter.Next(0, 0))
        this.pAttrArray.ApplyLineStyleArea(span[1], span[2], line, colorOnly);
    }
  }
  /** Original native frame accumulation delegation. @param outer - Outer accumulator. @param inner - Inner accumulator. @param flags - Shared flags. @param first - First row. @param last - Last row. @param left - First column. @param right - Right distance. @returns Nothing. */
  MergeBlockFrame(
    outer: SvxBoxItem,
    inner: SvxBoxInfoItem,
    flags: ScLineFlags,
    first: number,
    last: number,
    left: boolean,
    right: number,
  ): void {
    this.pAttrArray.MergeBlockFrame(outer, inner, flags, first, last, left, right);
  }
  /** Original frame delegation to actual attribute runs. @param outer - Outer lines. @param inner - Inner lines. @param first - First row. @param last - Last row. @param left - Left column. @param distance - Distance to right edge. @returns Nothing. */
  ApplyBlockFrame(
    outer: SvxBoxItem,
    inner: SvxBoxInfoItem,
    first: number,
    last: number,
    left: boolean,
    distance: number,
  ): void {
    this.pAttrArray.ApplyBlockFrame(outer, inner, first, last, left, distance);
  }
  /** Original selection indentation delegates to actual attributes. @param first - First row. @param last - Last row. @param increment - Direction. @returns Nothing. */
  ChangeSelectionIndent(first: number, last: number, increment: boolean): void {
    this.pAttrArray.ChangeIndent(first, last, increment);
  }
  /** Original column.hxx forwarding to the actual attribute array. @param state - Selection accumulator. @param first - First row. @param last - Last row. @param deep - Include inherited items. @returns Nothing. */
  MergePatternArea(state: ScMergePatternState, first: number, last: number, deep: boolean): void {
    this.pAttrArray.MergePatternArea(first, last, state, deep);
  }
  protected nCol = 0;
  protected nTab = 0;
  /** Original column attribute query delegates to its actual row runs. @param first - First row. @param last - Last row. @param mask - Native mask. @returns Found. */
  HasAttrib(first: number, last: number, mask: HasAttrFlags): boolean {
    return this.pAttrArray.HasAttrib(first, last, mask);
  }
  protected pAttrArray: ScAttrArray;
  /** Creates an uninitialized-position attribute owner. @param rDocument - Document. @returns Owner. */
  constructor(protected readonly rDocument: ScDocument) {
    this.pAttrArray = new ScAttrArray(0, 0, rDocument);
  }
  /** Initializes native position and default-column inheritance. @param col - Column or sentinel. @param tab - Sheet. @param defaults - Real default column. @returns Nothing. */
  Init(col: number, tab: number, defaults?: ScColumnData): void {
    this.nCol = col;
    this.nTab = tab;
    this.pAttrArray.Dispose();
    this.pAttrArray = new ScAttrArray(col, tab, this.rDocument, defaults?.pAttrArray);
  }
  /** Updates source sheet position. @param tab - Sheet. @returns Nothing. */
  SetTabNo(tab: number): void {
    this.nTab = tab;
    this.pAttrArray.SetTab(tab);
  }
  /** Releases real canonical registrations. @returns Nothing. */
  DisposeAttributes(): void {
    this.pAttrArray.Dispose();
  }
  /** Borrows a canonical pattern. @param row - Row. @returns Pattern or null. */
  GetPattern(row: number): ScPatternAttr | null {
    return this.pAttrArray.GetPattern(row);
  }
  /** Original column.hxx number-format forwarding uses this column's actual canonical pattern. @param context - Actual interpreter context. @param row - Valid row. @returns Effective native format key. */
  GetNumberFormat(context: ScInterpreterContext, row: number): number {
    return (this.pAttrArray.GetPattern(row) as ScPatternAttr).GetNumberFormat(context);
  }
  /** Borrows a complete attribute run. @param start - First output. @param end - Last output. @param row - Query row. @returns Pattern or null. */
  GetPatternRange(start: [number], end: [number], row: number): ScPatternAttr | null {
    return this.pAttrArray.GetPatternRange(start, end, row);
  }
  /** Replaces actual run attributes. @param start - Ordered first row. @param end - Ordered last row. @param pattern - Canonical holder. @returns Nothing. */
  SetPatternArea(start: number, end: number, pattern: CellAttributeHolder): void {
    this.pAttrArray.SetPatternArea(start, end, pattern);
  }
  /** Original column.cxx itemset cache applies real canonical patterns and optional change output. @param first - First row. @param last - Last row. @param cache - Borrowed shared cache. @param changed - Original changed flag. @returns Nothing. */
  ApplyCacheArea(first: number, last: number, cache: ScItemPoolCache, changed?: [boolean]): void {
    this.pAttrArray.ApplyCacheArea(first, last, cache, changed);
  }
  /** Original ApplyPatternArea owns one actual native itemset cache. @param start - First row. @param end - Last row. @param delta - Borrowed actual pattern. @returns Stored attribute change. */
  ApplyPatternArea(start: number, end: number, delta: ScPatternAttr): boolean {
    const cache = new ScItemPoolCache(this.rDocument.getCellAttributeHelper(), delta.GetItemSet()),
      changed: [boolean] = [false];
    try {
      this.pAttrArray.ApplyCacheArea(start, end, cache, changed);
      return changed[0];
    } finally {
      cache.Dispose();
    }
  }
}
/** Numeric/string/formula column owner;cells are not stored in an application-side grid. */
export class ScColumn extends ScColumnData {
  /** Original reference-update dispatch skips empty and clipboard/undo columns. @param context - Native operation. @param undo - Optional native undo document. @returns Updated flag. */
  UpdateReference(context: RefUpdateContext, undo: ScDocument | null = null): boolean {
    if (this.IsEmptyData() || this.GetDoc().IsClipOrUndo()) return false;
    if (context.meMode !== UpdateRefMode.URM_COPY)
      throw new Error("Non-copy column reference updates are not implemented");
    return this.UpdateReferenceOnCopy(context, undo);
  }
  /** Original copy traversal updates real formulas then rejoins both previously split boundaries. @param context - Native copy operation. @param undo - Undo owner. @returns Native accumulated update flag. */
  private UpdateReferenceOnCopy(context: RefUpdateContext, undo: ScDocument | null): boolean {
    const handler = new UpdateRefOnCopy(context, undo),
      block = context.getBlockPosition(this.nTab, this.nCol),
      first = context.maRange.aStart.Row(),
      last = context.maRange.aEnd.Row();
    let position = block
      ? this.maCells.position(
          block.miCellPos as NonNullable<ColumnBlockPosition["miCellPos"]>,
          first,
        )
      : this.maCells.position(first);
    ProcessBlock(position.first, this.maCells, handler, first, last);
    SharedFormulaUtil.joinFormulaCellAbove(position);
    if (last < this.GetDoc().MaxRow()) {
      position = this.maCells.position(position.first, last + 1);
      SharedFormulaUtil.joinFormulaCellAbove(position);
    }
    return handler.isUpdated();
  }
  /** Original deferred clipboard dirty phase separates formula dirtiness from scalar broadcast spans. @param first - First row. @param last - Last row. @param spans - Deferred changed spans. @returns Nothing. */
  SetDirtyFromClip(first: number, last: number, spans: ColumnSpanSet): void {
    const old = this.rDocument.GetAutoCalc();
    this.rDocument.SetAutoCalc(false);
    try {
      const action = new SetDirtyOnRangeHandler(this);
      ProcessFormula(
        this.maCells.begin(),
        this.maCells,
        first,
        last,
        /** Original formula operator. @param row - Native row. @param cell - Formula. @returns Nothing. */ (
          row,
          cell,
        ) => {
          void row;
          cell.SetDirty();
        },
        /** Original non-formula operator. @param type - Store kind. @param row - First row. @param length - Count. @returns Nothing. */ (
          type,
          row,
          length,
        ) => action.other(type, row, length),
      );
      action.fillBroadcastSpans(spans);
    } finally {
      this.rDocument.SetAutoCalc(old);
    }
  }
  /** Original sparse broadcaster walk reuses one mutable native hint across the actual nonempty broadcaster blocks. @param first - First row. @param last - Last row. @param id - Hint ID. @returns Whether delivered. */
  BroadcastBroadcasters(first: number, last: number, id: SfxHintId): boolean {
    const hint = new ScHint(id, new ScAddress(this.nCol, 0, this.nTab));
    let delivered = false;
    ParseBlock(
      this.maBroadcasters.cbegin(),
      this.maBroadcasters,
      {
        /** Original broadcaster template only visits actual stored listeners. @param node - Actual block. @param offset - First element. @param length - Count. @returns Nothing. */
        call(node, offset, length) {
          if (node.type !== element_type_broadcaster) return;
          for (let index = 0; index < length; ++index) {
            hint.SetAddressRow(node.position + offset + index);
            (
              broadcaster_block.at(
                node.data as base_element_block,
                offset + index,
              ) as SvtBroadcaster<SfxHint>
            ).Broadcast(hint);
            delivered = true;
          }
        },
      },
      first,
      last,
    );
    return delivered;
  }
  /** Original mutable metadata-store borrow. @returns Actual native store. */
  GetCellAttrStore(): CellTextAttrStoreType {
    return this.maCellTextAttrs;
  }
  /** Original default-content general clipboard copy on this actual column. @param args - Native arguments. @returns Nothing. */
  CopyFromClip(...args: Parameters<typeof column3.CopyFromClip>): void {
    column3.CopyFromClip.apply(this, args);
  }
  /** Original pre-paste deletion forwards actual context/source/deferred spans. @param args - Native arguments. @returns Nothing. */
  DeleteBeforeCopyFromClip(...args: Parameters<typeof column4.DeleteBeforeCopyFromClip>): void {
    column4.DeleteBeforeCopyFromClip.apply(this, args);
  }
  /** Original cached typed-store deletion. @param args - Native deletion arguments. @returns Compact deletion result. */
  DeleteCells(...args: Parameters<typeof column3.DeleteCells>): column3.DeleteCellsResult {
    return column3.DeleteCells.apply(this, args);
  }
  /** Original column4 single-cell row repetition. @param args - Context,row bounds and source offset. @returns Nothing. */
  CopyOneCellFromClip(...args: Parameters<typeof column4.CopyOneCellFromClip>): void {
    column4.CopyOneCellFromClip.apply(this, args);
  }
  /** Original span-clone routing inserts native code/group owners into typed storage. @param args - Source,metadata,spans and optional cursor. @returns Nothing. */
  CloneFormulaCell(...args: Parameters<typeof column4.CloneFormulaCell>): void {
    column4.CloneFormulaCell.apply(this, args);
  }
  /** Original formula-block count query from column4.cxx. @returns Formulas present. */
  HasFormulaCell(): boolean {
    return this.mnBlkCountFormula > 0;
  }
  /** Original shared listening traversal. @param args - Actual contexts and row bounds. @returns Nothing. */
  StartListeningFormulaCells(...args: Parameters<typeof column4.StartListeningFormulaCells>): void {
    column4.StartListeningFormulaCells.apply(this, args);
  }
  /** Original column4 group flag traversal. @param row - Any represented row. @returns Nothing. */
  SetNeedsListeningGroup(row: number): void {
    const position = this.maCells.position(row),
      node = position.first.get();
    if (node.type !== element_type_formula) return;
    const data = node.data as base_element_block,
      cell = formula_block.at(data, position.second) as ScFormulaCell,
      group = cell.GetCellGroup();
    if (!group) {
      cell.SetNeedsListening(true);
      return;
    }
    const top = group.mpTopCell as ScFormulaCell,
      delta = cell.aPos.Row() - top.aPos.Row();
    if (delta < 0) throw new Error("Negative shared top delta.");
    const offset = position.second - delta;
    if (formula_block.at(data, offset) !== top) throw new Error("Shared top differs from store.");
    for (let index = 0; index < group.mnLength; index++)
      (formula_block.at(data, offset + index) as ScFormulaCell).SetNeedsListening(true);
  }
  /** Original neighboring joins inspect only this actual formula block. @param position - New cell's actual position. @param cell - New formula. @returns Nothing. */
  JoinNewFormulaCell(position: ReturnType<CellStoreType["position"]>, cell: ScFormulaCell): void {
    const node = position.first.get(),
      data = node.data as base_element_block;
    if (node.type === element_type_formula && position.second > 0) {
      const previous = formula_block.at(data, position.second - 1) as ScFormulaCell;
      SharedFormulaUtil.joinFormulaCells(
        { first: position.first, second: position.second - 1 },
        previous,
        cell,
      );
    }
    if (node.type === element_type_formula && position.second + 1 < node.size)
      SharedFormulaUtil.joinFormulaCells(
        position,
        cell,
        formula_block.at(data, position.second + 1) as ScFormulaCell,
      );
  }
  /** Original affected upper/lower spans restart using one actual shared cursor set. Actual native delay admission batches adjacent surviving spans. @param rows - Zero,two or four inclusive endpoints. @returns Nothing. */
  StartListeningUnshared(rows: readonly number[]): void {
    if (!rows.length || this.rDocument.IsDelayedFormulaGrouping()) return;
    const positions = new ColumnBlockPositionSet(this.rDocument),
      start = new StartListeningContext(this.rDocument, positions),
      end = new EndListeningContext(this.rDocument, positions);
    if (
      !this.rDocument.CanDelayStartListeningFormulaCells(this, rows[0] as number, rows[1] as number)
    )
      this.StartListeningFormulaCells(start, end, rows[0] as number, rows[1] as number);
    if (
      rows.length >= 4 &&
      !this.rDocument.CanDelayStartListeningFormulaCells(this, rows[2] as number, rows[3] as number)
    )
      this.StartListeningFormulaCells(start, end, rows[2] as number, rows[3] as number);
  }
  /** Original whole-column grouping functor on actual storage. @param positions - Optional changed-group positions. @returns Nothing. */
  RegroupFormulaCells(positions: ScAddress[] | null = null): void {
    column3.RegroupFormulaCells.call(this, positions);
  }

  /** Original const metadata lookup borrows a real store element or returns null for an empty block. @param row - Valid row. @returns Metadata or null. */
  GetCellTextAttr(row: number): CellTextAttr | null {
    const position = this.maCellTextAttrs.cposition(row),
      block = position.first.get();
    return block.type === element_type_celltextattr
      ? celltextattr_block.at(block.data as base_element_block, position.second)
      : null;
  }
  /** Original cached script getter;UNKNOWN is retained until a real classifier writes metadata. @param row - Row. @returns Cached flags or NONE for absent metadata. */
  GetScriptType(row: number): SvtScriptType {
    if (
      !this.rDocument.ValidRow(row) ||
      this.maCellTextAttrs.get_type(row) !== element_type_celltextattr
    )
      return SvtScriptType.NONE;
    const position = this.maCellTextAttrs.cposition(row);
    return celltextattr_block.at(position.first.get().data as base_element_block, position.second)
      .mnScriptType;
  }
  /** Original metadata-only script setter never creates a text-attribute slot. Native grouped-formula cache discard remains unported;no such cache is owned by this slice. @param row - Row. @param type - Native flags. @returns Nothing. */
  SetScriptType(row: number, type: SvtScriptType): void {
    if (!this.rDocument.ValidRow(row)) return;
    const position = this.maCellTextAttrs.position(row),
      block = position.first.get();
    if (block.type !== element_type_celltextattr) return;
    celltextattr_block.at(block.data as base_element_block, position.second).mnScriptType = type;
  }

  /** Original column.cxx cursor cache owns the old pattern until its canonical replacement is assigned. @param row - Native row. @param pattern - Borrowed delta. @returns Nothing. */
  ApplyPattern(row: number, pattern: ScPatternAttr): void {
    const cache = new ScItemPoolCache(
        this.rDocument.getCellAttributeHelper(),
        pattern.GetItemSet(),
      ),
      old = new CellAttributeHolder(this.pAttrArray.GetPattern(row));
    try {
      const next = cache.ApplyTo(old);
      if (!CellAttributeHolder.areSame(next, old)) this.pAttrArray.SetPattern(row, next);
    } finally {
      old.Dispose();
      cache.Dispose();
    }
  }
  /** Original column.hxx cursor pattern assignment. @param row - Native row. @param holder - Complete canonical pattern. @returns Nothing. */
  SetPattern(row: number, holder: CellAttributeHolder): void {
    this.pAttrArray.SetPattern(row, holder);
  }

  /** Existing STRING call binds the same native context and handler. @param first - First row. @param last - Last row. @param target - Actual destination. @returns Nothing. */
  CopyToColumn(first: number, last: number, target: ScColumn): void;
  /** Original default clone-copy contract over the actual context. @param context - Native destination context. @param first - First row. @param last - Last row. @param flags - Native mask. @param marked - Original multi-mark mode. @param target - Actual destination. @param marks - Original selection. @param asLink - Original default false. @returns Nothing. */
  CopyToColumn(
    context: CopyToDocContext,
    first: number,
    last: number,
    flags: InsertDeleteFlags,
    marked: boolean,
    target: ScColumn,
    marks?: ScMarkData | null,
    asLink?: boolean,
  ): void;
  /** Binds both consumed forms to one native handler and store graph. @param args - Original arguments or existing STRING binding. @returns Nothing. */
  CopyToColumn(
    ...args: [number, number, ScColumn] | Parameters<typeof column3.CopyToColumn>
  ): void {
    if (typeof args[0] === "number") {
      const target = args[2] as ScColumn;
      column3.CopyToColumn.call(
        this,
        new CopyToDocContext(target.GetDoc()),
        args[0],
        args[1] as number,
        InsertDeleteFlags.STRING,
        false,
        target,
      );
    } else column3.CopyToColumn.apply(this, args as Parameters<typeof column3.CopyToColumn>);
  }
  /** Original whole-group teardown with optional native row outputs. @param args - Original context,bounds and outputs. @returns Nothing. */
  EndListeningFormulaCells(...args: Parameters<typeof column4.EndListeningFormulaCells>): void {
    column4.EndListeningFormulaCells.apply(this, args);
  }
  /** Consumed native column3.cxx attribute-only deletion;unrepresented content/style deletion is rejected before mutation. Plain cells have no EditEngine attributes to strip. @param first - First row. @param last - Last row. @param flags - HARDATTR/EDITATTR and optional internal NOCAPTIONS. @returns Nothing. */
  DeleteArea(first: number, last: number, flags: InsertDeleteFlags): void {
    if (
      flags &
      ~(InsertDeleteFlags.HARDATTR | InsertDeleteFlags.EDITATTR | InsertDeleteFlags.NOCAPTIONS)
    )
      throw new Error("Only native hard-attribute deletion is implemented");
    if (flags & InsertDeleteFlags.HARDATTR) this.pAttrArray.DeleteHardAttr(first, last);
  }
  /** Original DeleteSelection visits only actual multi-mark row spans for this allocated column. @param flags - Consumed deletion flags. @param marks - Native marks. @returns Nothing. */
  DeleteSelection(flags: InsertDeleteFlags, marks: ScMarkData): void {
    if (marks.IsMultiMarked()) {
      const iterator = new ScMultiSelIter(marks.GetMultiSelData(), this.nCol);
      for (let result = iterator.Next(0, 0); result[0]; result = iterator.Next(0, 0))
        this.DeleteArea(result[1], result[2], flags);
    }
  }
  /** Original disjoint row-span traversal over native multi-selection data. @param state - Selection accumulator. @param marks - Actual marks. @param deep - Include inherited values. @returns Nothing. */
  MergeSelectionPattern(state: ScMergePatternState, marks: ScMarkData, deep: boolean): void {
    if (marks.IsMultiMarked()) {
      const multi = marks.GetMultiSelData();
      if (multi.HasMarks(this.nCol)) {
        const iterator = new ScMultiSelIter(multi, this.nCol);
        for (let result = iterator.Next(0, 0); result[0]; result = iterator.Next(0, 0))
          this.pAttrArray.MergePatternArea(result[1], result[2], state, deep);
      }
    }
  }
  /** Original column2.cxx whole-column/range emptiness query over actual typed blocks. @param first - Optional first row. @param last - Inclusive final row. @returns Whether the interval contains no payload. */
  IsEmptyData(first?: number, last?: number): boolean {
    if (this.maCells.block_size() === 1 && this.maCells.cbegin().get().type === element_type_empty)
      return true;
    if (first === undefined) return false;
    const position = this.maCells.cposition(first),
      iterator = position.first;
    if (iterator.equals(this.maCells.cend())) return false;
    const block = iterator.get();
    if (block.type !== element_type_empty) return false;
    return (last as number) < first + block.size - position.second;
  }
  /** Original uncached occupancy overload;notes/drawing extras remain unported. @param row - Valid row. @returns Actual payload presence. */
  HasDataAt(row: number): boolean {
    return this.maCells.get_type(row) !== element_type_empty;
  }
  /** Reads the first payload row from the leading native block. @returns Row or native empty zero. */
  GetFirstDataPos(): number {
    if (this.IsEmptyData()) return 0;
    const first = this.maCells.cbegin().get();
    return first.type !== element_type_empty ? 0 : first.size;
  }
  /** Original full-column and bounded last-payload queries. @param lastRow - Optional inclusive bound. @returns Row or native empty zero. */
  GetLastDataPos(lastRow?: number): number {
    if (lastRow !== undefined) {
      lastRow = Math.min(lastRow, this.rDocument.MaxRow());
      const position = this.maCells.cposition(lastRow).first,
        block = position.get();
      if (block.type !== element_type_empty) return lastRow;
      if (position.equals(this.maCells.cbegin())) return 0;
      return block.position - 1;
    }
    if (this.IsEmptyData()) return 0;
    const last = this.maCells.crbegin().get();
    return last.type !== element_type_empty
      ? this.rDocument.MaxRow()
      : this.rDocument.MaxRow() - last.size;
  }
  /** Native friend-visible logical counters used by CellStoreEvent; no lifetime accounting. */
  mnBlkCountFormula = 0;
  mnBlkCountCellNotes = 0;
  private readonly maBroadcasters: BroadcasterStoreType;
  private readonly maCells: CellStoreType;
  private readonly maCellTextAttrs: CellTextAttrStoreType;
  /** Creates empty stores spanning the document's actual row domain. @param rDocument - Owning document. @returns Column. */
  constructor(rDocument: ScDocument) {
    super(rDocument);
    this.maBroadcasters = new BroadcasterStoreType(rDocument.GetMaxRowCount());
    this.maCells = new CellStoreType(new CellStoreEvent(this));
    this.maCells.resize(rDocument.GetMaxRowCount());
    this.maCellTextAttrs = new CellTextAttrStoreType(rDocument.GetMaxRowCount());
  }
  /** Updates native sheet identity in every real formula cell after sheet insertion. Formatting attributes remain a declared gap. @param tab - Sheet. @returns Nothing. */
  override SetTabNo(tab: number): void {
    super.SetTabNo(tab);
    ProcessFormula(
      this.maCells,
      /** Updates the actual formula position. @param row - Row. @param cell - Cell. @returns Nothing. */ (
        row,
        cell,
      ) => {
        void row;
        cell.aPos.SetTab(tab);
      },
    );
  }
  /** Borrows the actual native typed store; callers preserve the iterator invalidation contract. @returns Cell store. */
  GetCellStore(): CellStoreType {
    return this.maCells;
  }
  /** Original column2.cxx formula pointer lookup borrows the existing mdds data iterator at the row offset. The validated full-row-domain column store cannot return end();no malformed-store test state is manufactured for that defensive native guard. @param row - Requested row. @param size - Original full typed-block size output,including any prefix before the returned pointer. @returns Actual borrowed pointer position or null. */
  GetFormulaCellBlockAddress(
    row: number,
    size: [number],
  ): delayed_delete_vector_iterator<ScFormulaCell | null> | null {
    if (!this.rDocument.ValidRow(row)) {
      size[0] = 0;
      return null;
    }
    const position = this.maCells.cposition(row),
      block = position.first.get();
    if (block.type !== element_type_formula) {
      size[0] = 0;
      return null;
    }
    size[0] = block.size;
    return formula_block.data(block.data as base_element_block).advance(position.second);
  }
  /** Original consumed const block-position initialization;note/sparkline stores are outside this scalar slice. @param position - Native position fields. @returns Nothing. */
  InitBlockPosition(position: ColumnBlockConstPosition | ColumnBlockPosition): void {
    if (position instanceof ColumnBlockPosition) {
      position.miCellPos = this.maCells.begin();
      position.miCellTextAttrPos = this.maCellTextAttrs.begin();
      position.miBroadcasterPos = this.maBroadcasters.begin();
    } else {
      position.miCellPos = this.maCells.cbegin();
      position.miCellTextAttrPos = this.maCellTextAttrs.cbegin();
    }
  }
  /** Original native broadcaster-span removal updates the real mutable cursor. @param position - Initialized cursor. @param first - First row. @param last - Last row. @returns Nothing. */
  DeleteBroadcasters(position: ColumnBlockPosition, first: number, last: number): void {
    position.miBroadcasterPos = this.maBroadcasters.set_empty(
      position.miBroadcasterPos as NonNullable<ColumnBlockPosition["miBroadcasterPos"]>,
      first,
      last,
    );
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
  /** Original numeric insertion without a position hint. @param row - Row. @param value - Number. @returns Nothing. */
  SetValue(row: number, value: number): void;
  /** Original cached numeric insertion with the native broadcast default. @param block - Actual cursors. @param row - Row. @param value - Number. @param broadcast - Broadcast flag. @returns Nothing. */
  SetValue(block: ColumnBlockPosition, row: number, value: number, broadcast?: boolean): void;
  /** Binds original scalar/hinted overloads to the same actual stores. @param first - Row or cursors. @param second - Value or row. @param third - Hinted value. @param broadcast - Native broadcast default. @returns Nothing. */
  SetValue(
    first: number | ColumnBlockPosition,
    second: number,
    third?: number,
    broadcast = true,
  ): void {
    const block = first instanceof ColumnBlockPosition ? first : null,
      row = block ? second : (first as number),
      value = block ? (third as number) : second;
    if (!this.rDocument.ValidRow(row)) return;
    const rows = this.DetachFormulaCell(row);
    if (block) {
      block.miCellPos = this.maCells.set(
        block.miCellPos as ReturnType<CellStoreType["begin"]>,
        row,
        value,
        double_element_callbacks,
      );
      block.miCellTextAttrPos = this.maCellTextAttrs.set(
        block.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
        row,
        new CellTextAttr(),
        celltextattr_element_callbacks,
      );
    } else {
      this.maCells.set(row, value, double_element_callbacks);
      this.maCellTextAttrs.set(row, new CellTextAttr(), celltextattr_element_callbacks);
    }
    this.StartListeningUnshared(rows);
    if (broadcast) this.BroadcastNewCell(row);
  }
  /** Original literal Unicode/shared-string insertion. @param row - Row. @param value - Literal text. @returns Nothing. */
  SetRawString(row: number, value: OUStringConstReference | SharedStringConstReference): void;
  /** Original cached shared-string insertion. @param block - Actual cursors. @param row - Row. @param value - Shared text. @param broadcast - Native broadcast default. @returns Nothing. */
  SetRawString(
    block: ColumnBlockPosition,
    row: number,
    value: SharedStringConstReference,
    broadcast?: boolean,
  ): void;
  /** Binds original string overloads to actual shared storage and deferred listeners. @param first - Row or cursors. @param second - Text or row. @param third - Hinted text. @param broadcast - Native broadcast default. @returns Nothing. */
  SetRawString(
    first: number | ColumnBlockPosition,
    second: number | OUStringConstReference | SharedStringConstReference,
    third?: SharedStringConstReference,
    broadcast = true,
  ): void {
    const block = first instanceof ColumnBlockPosition ? first : null,
      row = block ? (second as number) : (first as number),
      value = block
        ? (third as SharedStringConstReference)
        : (second as OUStringConstReference | SharedStringConstReference);
    if (!this.rDocument.ValidRow(row)) return;
    const shared =
        "getData" in value
          ? new SharedString(value)
          : this.rDocument.GetSharedStringPool().intern(value),
      rows = this.DetachFormulaCell(row);
    try {
      if (block) {
        block.miCellPos = this.maCells.set(
          block.miCellPos as ReturnType<CellStoreType["begin"]>,
          row,
          shared,
          string_element_callbacks,
        );
        block.miCellTextAttrPos = this.maCellTextAttrs.set(
          block.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
          row,
          new CellTextAttr(),
          celltextattr_element_callbacks,
        );
      } else {
        this.maCells.set(row, shared, string_element_callbacks);
        this.maCellTextAttrs.set(row, new CellTextAttr(), celltextattr_element_callbacks);
      }
    } finally {
      shared.dispose();
    }
    this.StartListeningUnshared(rows);
    if (broadcast) this.BroadcastNewCell(row);
  }
  /** Compiles and stores a supported formula in the actual typed block store. @param row - Row. @param formula - Source. @param grammar - ODFF grammar. @returns Nothing. */
  SetFormula(row: number, formula: OUStringConstReference, grammar: Grammar): void {
    if (!this.rDocument.ValidRow(row)) return;
    const cell = new ScFormulaCell(
      this.rDocument,
      new ScAddress(this.nCol, row, this.nTab),
      formula,
      grammar,
    );
    this.SetFormulaCell(row, cell);
  }
  /** Adopts an already compiled native formula owner without reparsing its input text. The cell position/document must match this column and row. @param row - Target row. @param cell - Compiled owner. @param listening - Original column listening mode. @param inheritNumFormatIfNeeded - Native default true. @returns Adopted cell or null for invalid row. */
  SetFormulaCell(
    row: number,
    cell: ScFormulaCell,
    listening?: StartListeningType,
    inheritNumFormatIfNeeded?: boolean,
  ): ScFormulaCell | null;
  /** Original hinted formula adoption returns void and inherits a requested general format. @param block - Cached cursors. @param row - Row. @param cell - Owned formula. @param listening - Native listening default. @param inheritNumFormatIfNeeded - Native default true. @returns Nothing. */
  SetFormulaCell(
    block: ColumnBlockPosition,
    row: number,
    cell: ScFormulaCell,
    listening?: StartListeningType,
    inheritNumFormatIfNeeded?: boolean,
  ): void;
  /** Binds both source formula adoption overloads to actual cell/group owners. @param first - Row or cursors. @param second - Formula or row. @param third - Listening mode or formula. @param fourth - Hinted listening mode or ordinary inheritance flag. @param fifth - Hinted inheritance flag. @returns Original nonhinted owner or void for the hinted overload. */
  SetFormulaCell(
    first: number | ColumnBlockPosition,
    second: ScFormulaCell | number,
    third?: StartListeningType | ScFormulaCell,
    fourth: StartListeningType | boolean = SingleCellListening,
    fifth = true,
  ): ScFormulaCell | null | void {
    const block = first instanceof ColumnBlockPosition ? first : null,
      row = block ? (second as number) : (first as number),
      cell = block ? (third as ScFormulaCell) : (second as ScFormulaCell),
      listening = block
        ? (fourth as StartListeningType)
        : ((third as StartListeningType) ?? SingleCellListening),
      inherit = block ? fifth : typeof fourth === "boolean" ? fourth : true;
    if (!this.rDocument.ValidRow(row)) return block ? undefined : null;
    const rows = this.DetachFormulaCell(row);
    const format = this.GetNumberFormat(this.rDocument.GetNonThreadedContext(), row);
    if (format % SV_COUNTRY_LANGUAGE_OFFSET === 0 && inherit) cell.SetNeedNumberFormat(true);
    if (block) {
      block.miCellPos = this.maCells.set<ScFormulaCell | null>(
        block.miCellPos as ReturnType<CellStoreType["begin"]>,
        row,
        cell,
        formula_element_callbacks,
      );
      block.miCellTextAttrPos = this.maCellTextAttrs.set(
        block.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
        row,
        new CellTextAttr(),
        celltextattr_element_callbacks,
      );
    } else {
      this.maCells.set<ScFormulaCell | null>(row, cell, formula_element_callbacks);
      this.maCellTextAttrs.set(row, new CellTextAttr(), celltextattr_element_callbacks);
    }
    this.JoinNewFormulaCell(this.maCells.position(row), cell);
    if (this.rDocument.IsClipOrUndo() || this.rDocument.IsInsertingFromOtherDoc())
      return block ? undefined : cell;
    if (listening === ConvertToGroupListening) {
      const positions = new ColumnBlockPositionSet(this.rDocument),
        start = new StartListeningContext(this.rDocument, positions),
        end = new EndListeningContext(this.rDocument, positions);
      let first = row,
        last = row;
      for (const bound of rows) {
        first = Math.min(first, bound);
        last = Math.max(last, bound);
      }
      this.StartListeningFormulaCells(start, end, first, last);
    } else if (listening === SingleCellListening) {
      cell.StartListeningTo(this.rDocument);
      this.StartListeningUnshared(rows);
    } else
      for (let index = 0; index < rows.length; index += 2) {
        const top = this.GetFormulaCell(rows[index] as number);
        if (!top) throw new Error("Missing surviving formula top.");
        if (!top.NeedsListening()) this.SetNeedsListeningGroup(rows[index] as number);
      }
    cell.SetDirty();
    return block ? undefined : cell;
  }
  /** Borrows an actual formula-cell identity. @param row - Valid row. @returns Formula cell or null. */
  GetFormulaCell(row: number): ScFormulaCell | null {
    if (this.maCells.get_type(row) !== element_type_formula) return null;
    const output: [ScFormulaCell | null] = [null];
    this.maCells.get(row, formula_element_callbacks, output);
    return output[0];
  }
  /** Reads a real formula error, with native nonformula NONE. @param row - Valid row. @returns Error. */
  GetErrCode(row: number): FormulaError {
    return this.GetFormulaCell(row)?.GetErrCode() ?? FormulaError.NONE;
  }
  /** Performs native default-context dirty marking and tree membership without tracking broadcasts. @param context - Dirty context. @returns Nothing. */
  SetAllFormulasDirty(context: SetFormulaDirtyContext): void {
    if (context.mbClearTabDeletedFlag)
      throw new Error("Deleted-sheet flag clearing is not implemented");
    ProcessFormula(
      this.maCells,
      /** Marks the actual cell. @param row - Row. @param cell - Formula. @returns Nothing. */ (
        row,
        cell,
      ) => {
        void row;
        cell.SetDirtyVar();
        if (!this.rDocument.IsInFormulaTree(cell)) this.rDocument.PutInFormulaTree(cell);
      },
    );
  }
  /** Borrows actual numeric/string/formula cell content without a second model. @param row - Valid row. @returns Cell view. */
  GetCellValue(row: number): ScRefCellValue {
    const position = this.maCells.cposition(row);
    return toRefCell(position.first, position.second);
  }
  /** Borrows an existing source broadcaster without allocating. @param row - Valid row. @returns Broadcaster or null. */
  GetBroadcaster(row: number): SvtBroadcaster<SfxHint> | null {
    if (this.maBroadcasters.get_type(row) !== element_type_broadcaster) return null;
    const value: [SvtBroadcaster<SfxHint> | null] = [null];
    this.maBroadcasters.get(row, broadcaster_element_callbacks, value);
    return value[0];
  }
  /** Registers with the actual row broadcaster, allocating it only when required. @param listener - Listener. @param row - Valid row. @returns Nothing. */
  StartListening(
    ...args:
      [SvtListener<SfxHint>, number] | [StartListeningContext, ScAddress, SvtListener<SfxHint>]
  ): void {
    if (args.length === 2) {
      this.startListeningAt(this.maBroadcasters.position(args[1]), args[1], args[0]);
      return;
    }
    const [context, address, listener] = args;
    if (!this.rDocument.ValidRow(address.Row())) return;
    const cursor = context.getBlockPosition(address.Tab(), address.Col());
    if (!cursor) return;
    const position = this.maBroadcasters.position(
      cursor.miBroadcasterPos as NonNullable<ColumnBlockPosition["miBroadcasterPos"]>,
      address.Row(),
    );
    cursor.miBroadcasterPos = this.startListeningAt(position, address.Row(), listener);
  }
  /** Original anonymous startListening helper updates the borrowed store position. Its trait permits only broadcaster/empty blocks,so the native wrong-type assertion is outside this initialized owner contract. @param position - Actual broadcaster block position. @param row - Row. @param listener - Native observer. @returns Updated iterator. */
  private startListeningAt(
    position: ReturnType<BroadcasterStoreType["position"]>,
    row: number,
    listener: SvtListener<SfxHint>,
  ): ReturnType<BroadcasterStoreType["begin"]> {
    if (position.first.get().type === element_type_broadcaster) {
      listener.StartListening(
        broadcaster_block.at(
          position.first.get().data as base_element_block,
          position.second,
        ) as SvtBroadcaster<SfxHint>,
      );
      return position.first;
    }
    const broadcaster = new SvtBroadcaster<SfxHint>();
    listener.StartListening(broadcaster);
    return this.maBroadcasters.set(position.first, row, broadcaster, broadcaster_element_callbacks);
  }
  /** Ends reciprocal registration and removes an empty broadcaster. @param listener - Listener. @param row - Valid row. @returns Nothing. */
  EndListening(
    ...args: [SvtListener<SfxHint>, number] | [EndListeningContext, ScAddress, SvtListener<SfxHint>]
  ): void {
    if (args.length === 3) {
      const [context, address, listener] = args,
        cursor = context.getBlockPosition(address.Tab(), address.Col());
      if (!cursor) return;
      const position = this.maBroadcasters.position(
        cursor.miBroadcasterPos as NonNullable<ColumnBlockPosition["miBroadcasterPos"]>,
        address.Row(),
      );
      cursor.miBroadcasterPos = position.first;
      const block = position.first.get();
      if (block.type !== element_type_broadcaster) return;
      const broadcaster = broadcaster_block.at(
        block.data as base_element_block,
        position.second,
      ) as SvtBroadcaster<SfxHint>;
      listener.EndListening(broadcaster);
      if (!broadcaster.HasListeners())
        context.addEmptyBroadcasterPosition(address.Tab(), address.Col(), address.Row());
      return;
    }
    const [listener, row] = args;
    const broadcaster = this.GetBroadcaster(row);
    if (!broadcaster) return;
    listener.EndListening(broadcaster);
    if (!broadcaster.HasListeners()) this.maBroadcasters.set_empty(row, row);
  }
  /** Original detach records surviving native group spans before unsharing the removed member. @param row - Valid row. @returns Inclusive surviving span pairs. */
  private DetachFormulaCell(row: number): number[] {
    const formula = this.GetFormulaCell(row),
      rows: number[] = [];
    if (!formula) return rows;
    if (formula.IsShared() && formula.GetSharedLength() > 1) {
      const top = formula.GetSharedTopRow(),
        length = formula.GetSharedLength();
      if (row === top) rows.push(top + 1, top + length - 1);
      else if (row === top + length - 1) rows.push(top, row - 1);
      else rows.push(top, row - 1, row + 1, top + length - 1);
    }
    formula.EndListeningTo(this.rDocument);
    SharedFormulaUtil.unshareFormulaCell(this.maCells.position(row), formula);
    this.rDocument.RemoveFromFormulaTrack(formula);
    this.rDocument.RemoveFromFormulaTree(formula);
    return rows;
  }
  /** Broadcasts the represented normal-document source write. Import/clipboard modes remain unsupported. @param row - Valid row. @returns Nothing. */
  private BroadcastNewCell(row: number): void {
    if (this.rDocument.IsClipOrUndo() || this.rDocument.IsInsertingFromOtherDoc()) return;
    this.Broadcast(row);
  }
  /** Dispatches actual native cell-change hints. @param row - Valid row. @returns Nothing. */
  private Broadcast(row: number): void {
    this.rDocument.Broadcast(
      new ScHint(SfxHintId.ScDataChanged, new ScAddress(this.nCol, row, this.nTab)),
    );
  }
  /** Reads the scalar discriminator;unsupported cell alternatives cannot be inserted in this store. @param row - Valid row. @returns Cell type. */
  GetCellType(row: number): CellType {
    const kind = this.maCells.get_type(row);
    return kind === element_type_numeric
      ? CellType.CELLTYPE_VALUE
      : kind === element_type_string
        ? CellType.CELLTYPE_STRING
        : kind === element_type_formula
          ? CellType.CELLTYPE_FORMULA
          : CellType.CELLTYPE_NONE;
  }
  /** Reads numeric or numeric-formula values with the native zero fallback. @param row - Valid row. @returns Value. */
  GetValue(row: number): number {
    return this.maCells.get_type(row) === element_type_numeric
      ? this.maCells.get(row, double_element_callbacks)
      : (this.GetFormulaCell(row)?.GetValue() ?? 0);
  }
  /** Returns an independent shared string value,or its native empty default. @param row - Valid row. @returns Shared text. */
  GetSharedString(row: number): SharedString {
    return this.maCells.get_type(row) === element_type_string
      ? this.maCells.get(row, string_element_callbacks, string_value_type)
      : new SharedString();
  }
  /** Clears content and its text metadata in the represented scalar stores. @param row - Valid row. @returns Nothing. */
  Delete(row: number): void {
    const rows = this.DetachFormulaCell(row);
    this.maCells.set_empty(row, row);
    this.maCellTextAttrs.set_empty(row, row);
    this.StartListeningUnshared(rows);
    this.Broadcast(row);
  }
}

/** Original SetDirtyOnRangeHandler owns compact non-formula changed spans. */
class SetDirtyOnRangeHandler {
  private readonly maValueRanges: SingleColumnSpanSet;
  /** Borrows the actual column and limits. @param column - Native owner. @returns Handler. */
  constructor(private readonly column: ScColumn) {
    this.maValueRanges = new SingleColumnSpanSet(column.GetDoc().GetSheetLimits());
  }
  /** Native non-formula dispatch excludes empty blocks. @param type - Store type. @param first - First row. @param length - Count. @returns Nothing. */
  other(type: number, first: number, length: number): void {
    if (type !== element_type_empty) this.maValueRanges.set(first, first + length - 1, true);
  }
  /** Transfers compact native true spans for the original post-insert broadcast. @param spans - Document operation owner. @returns Nothing. */
  fillBroadcastSpans(spans: ColumnSpanSet): void {
    spans.set(
      this.column.GetDoc(),
      this.column.GetTab(),
      this.column.GetCol(),
      this.maValueRanges,
      true,
    );
  }
}

/** Original UpdateRefOnCopy functor visits every borrowed formula,including shared members. */
class UpdateRefOnCopy {
  private mbUpdated = false;
  /** Borrows actual operation and undo owner. @param context - Context. @param undo - Undo document. @returns Handler. */
  constructor(
    private readonly context: RefUpdateContext,
    private readonly undo: ScDocument | null,
  ) {}
  /** Original result query. @returns Accumulated native flag. */
  isUpdated(): boolean {
    return this.mbUpdated;
  }
  /** Original non-short-circuit traversal consumes only formula blocks. @param node - Borrowed store block. @param offset - First element. @param size - Count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    if (node.type !== element_type_formula) return;
    for (let index = offset; index < offset + size; ++index) {
      const cell = formula_block.at(node.data as base_element_block, index) as ScFormulaCell;
      this.mbUpdated = cell.UpdateReference(this.context, this.undo) || this.mbUpdated;
    }
  }
}

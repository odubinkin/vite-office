/** @fileoverview Original column4.cxx group-listening block handler,including partial-span backtracking and excess-member teardown. */
import { ProcessBlock, type BlockFunction, type CellStoreNode } from "../../../inc/mtvfunctions";
import { formula_block, element_type_formula } from "../../../inc/mtvelements";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
import { ScFormulaCell, ScFormulaCellGroup, ScMatrixMode } from "../../../inc/formulacell";
import type { CopyFromClipContext } from "../../../inc/clipcontext";
import { CellType, InsertDeleteFlags } from "../../../inc/global";
import { RowSpan, type ColumnSpanSet } from "../../../inc/columnspanset";
import { string_element_callbacks } from "../../../inc/mtvelements";
import { double_element_callbacks } from "../../../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks";
import { ScAddress } from "../../../inc/address";
import { CellTextAttr } from "../../../inc/celltextattr";
import {
  type CellStoreType,
  type CellTextAttrStoreType,
  ColumnBlockPosition,
  formula_element_callbacks,
  celltextattr_element_callbacks,
} from "../../../inc/mtvelements";
import { delayed_delete_vector_iterator } from "../../../../external/mdds/include/mdds/multi_type_vector/delayed_delete_vector";
import type { ScColumn } from "../../../inc/column";
import { SharedFormulaUtil } from "../../../inc/sharedformula";
import type { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
/** Original handler subscribes actual groups without replacing areas with per-cell listeners. */
export class StartListeningFormulaCellsHandler implements BlockFunction {
  private mnStartRow = -1;
  /** Borrows actual contexts. @param start - Start context. @param end - End context. @returns Handler. */
  constructor(
    private readonly start: StartListeningContext,
    private readonly end: EndListeningContext,
  ) {}
  /** Original partial-block span may begin/end within a group. @param node - Actual store node. @param offset - Native offset. @param size - Native span count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    if (node.type !== element_type_formula) return;
    this.mnStartRow = node.position + offset;
    const data = node.data as base_element_block;
    let index = offset;
    const first = formula_block.at(data, index) as ScFormulaCell;
    if (first.IsShared() && !first.IsSharedTop()) {
      const back = first.aPos.Row() - first.GetSharedTopRow();
      if (back > 0) {
        if (back > offset) throw new Error("Shared top precedes formula block.");
        index -= back;
        for (let extra = index; extra < offset; extra++)
          (formula_block.at(data, extra) as ScFormulaCell).EndListeningTo(this.end);
        this.mnStartRow -= back;
      }
    }
    for (; index < offset + size; index++) {
      const cell = formula_block.at(data, index) as ScFormulaCell;
      if (!cell.IsSharedTop()) {
        if (cell.IsShared()) throw new Error("Expected singleton or shared top.");
        cell.StartListeningTo(this.start);
        continue;
      }
      const groupEnd = index - offset + cell.GetSharedLength();
      if (groupEnd > size) {
        const excess = groupEnd - size,
          end = index + cell.GetSharedLength();
        for (let extra = end - excess; extra < end; extra++)
          (formula_block.at(data, extra) as ScFormulaCell).EndListeningTo(this.end);
        SharedFormulaUtil.startListeningAsGroup(
          this.start,
          formula_block.data(data).advance(index),
        );
        index = offset + size - 1;
      } else {
        SharedFormulaUtil.startListeningAsGroup(
          this.start,
          formula_block.data(data).advance(index),
        );
        index += cell.GetSharedLength() - 1;
      }
    }
  }
}
/** Original whole-column block count avoids scanning absent formulas. @param this - Actual column. @param start - Start context. @param end - End context. @param first - First row. @param last - Last row. @returns Nothing. */
export function StartListeningFormulaCells(
  this: ScColumn,
  start: StartListeningContext,
  end: EndListeningContext,
  first: number,
  last: number,
): void {
  if (!this.HasFormulaCell()) return;
  const cells = this.GetCellStore();
  ProcessBlock(
    cells.begin(),
    cells,
    new StartListeningFormulaCellsHandler(start, end),
    first,
    last,
  );
}

/** Original CloneFormulaCell span insertion creates one real shared code owner per shareable span,then joins its boundaries. @param this - Destination column. @param args - Original block/source/metadata/spans or source/metadata/spans overload. @returns Nothing. */
export function CloneFormulaCell(
  this: ScColumn,
  ...args:
    | [ScFormulaCell, CellTextAttr, readonly RowSpan[]]
    | [ColumnBlockPosition, ScFormulaCell, CellTextAttr, readonly RowSpan[]]
): void {
  const hinted = args[0] instanceof ColumnBlockPosition,
    block = hinted ? (args[0] as ColumnBlockPosition) : undefined,
    source = args[hinted ? 1 : 0] as ScFormulaCell,
    attr = args[hinted ? 2 : 1] as CellTextAttr,
    spans = args[hinted ? 3 : 2] as readonly RowSpan[];
  if (source.GetMatrixFlag() !== ScMatrixMode.NONE)
    throw new Error("Matrix clipboard cloning is not implemented");
  const position = block ?? new ColumnBlockPosition();
  if (!block) this.InitBlockPosition(position);
  const doc = this.GetDoc();
  for (const span of spans) {
    const length = span.mnRow2 - span.mnRow1 + 1;
    if (length <= 0) throw new Error("Formula clone span must be nonempty");
    const formulas: ScFormulaCell[] = [],
      first = new ScAddress(this.GetCol(), span.mnRow1, this.GetTab());
    if (length === 1 || !source.GetCode().IsShareable()) {
      for (let index = 0; index < length; ++index) {
        formulas.push(new ScFormulaCell(source, doc, first));
        first.IncRow();
      }
    } else {
      const group = new ScFormulaCellGroup();
      group.setCode(source.GetCode());
      group.compileCode(doc, first, doc.GetGrammar());
      for (let index = 0; index < length; ++index) {
        const cell = new ScFormulaCell(doc, first, group, doc.GetGrammar());
        if (index === 0) {
          group.mpTopCell = cell;
          group.mnLength = length;
        }
        formulas.push(cell);
        first.IncRow();
      }
    }
    const storage = { values: formulas, size: length };
    position.miCellPos = this["maCells"].set(
      position.miCellPos as ReturnType<CellStoreType["begin"]>,
      span.mnRow1,
      new delayed_delete_vector_iterator(storage, 0),
      new delayed_delete_vector_iterator(storage, length),
      formula_element_callbacks,
    );
    let cellPosition = this["maCells"].position(position.miCellPos, span.mnRow1);
    this.JoinNewFormulaCell(cellPosition, this.GetFormulaCell(span.mnRow1) as ScFormulaCell);
    cellPosition = this["maCells"].position(cellPosition.first, span.mnRow2);
    this.JoinNewFormulaCell(cellPosition, this.GetFormulaCell(span.mnRow2) as ScFormulaCell);
    const attrs = {
      values: Array.from(
        { length },
        /** Copies native text metadata by value. @returns Metadata. */ () =>
          new CellTextAttr(attr),
      ),
      size: length,
    };
    position.miCellTextAttrPos = this["maCellTextAttrs"].set(
      position.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
      span.mnRow1,
      new delayed_delete_vector_iterator(attrs, 0),
      new delayed_delete_vector_iterator(attrs, length),
      celltextattr_element_callbacks,
    );
  }
}

/** Original single-row repetition into cleared typed stores;default CONTENTS preserves destination patterns. @param this - Destination column. @param context - Actual paste context. @param row1 - First row. @param row2 - Last row. @param offset - Source column offset. @returns Nothing. */
export function CopyOneCellFromClip(
  this: ScColumn,
  context: CopyFromClipContext,
  row1: number,
  row2: number,
  offset: number,
): void {
  if (row1 > row2) throw new Error("Clipboard row span is reversed");
  const block = context.getBlockPosition(this.GetTab(), this.GetCol());
  if (!block) return;
  const source = context.getSingleCell(offset),
    attr = context.getSingleCellAttr(offset),
    length = row2 - row1 + 1;
  if (source.getType() === CellType.CELLTYPE_FORMULA) {
    this.CloneFormulaCell(block, source.getFormula(), attr, [new RowSpan(row1, row2)]);
    return;
  }
  if (source.getType() === CellType.CELLTYPE_NONE) return;
  if (source.getType() === CellType.CELLTYPE_VALUE) {
    const storage = { values: Array<number>(length).fill(source.getDouble()), size: length };
    block.miCellPos = this["maCells"].set(
      block.miCellPos as ReturnType<CellStoreType["begin"]>,
      row1,
      new delayed_delete_vector_iterator(storage, 0),
      new delayed_delete_vector_iterator(storage, length),
      double_element_callbacks,
    );
  } else {
    const samePool = context.getClipDoc().GetPool() === this.GetDoc().GetPool(),
      interned = samePool
        ? null
        : this.GetDoc().GetSharedStringPool().intern(source.getSharedString().getString()),
      str = interned ?? source.getSharedString();
    const storage = {
      values: Array.from(
        { length },
        /** Borrows the source vector element until storage copies it. @returns Shared string. */ () =>
          str,
      ),
      size: length,
    };
    try {
      block.miCellPos = this["maCells"].set(
        block.miCellPos as ReturnType<CellStoreType["begin"]>,
        row1,
        new delayed_delete_vector_iterator(storage, 0),
        new delayed_delete_vector_iterator(storage, length),
        string_element_callbacks,
      );
    } finally {
      interned?.dispose();
    }
  }
  const attrs = {
    values: Array.from(
      { length },
      /** Copies native text metadata by value. @returns Metadata. */ () => new CellTextAttr(attr),
    ),
    size: length,
  };
  block.miCellTextAttrPos = this["maCellTextAttrs"].set(
    block.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
    row1,
    new delayed_delete_vector_iterator(attrs, 0),
    new delayed_delete_vector_iterator(attrs, length),
    celltextattr_element_callbacks,
  );
}

/** Original default-content pre-paste deletion records broadcasts and surviving formula extents;unrepresented note/sparkline/edit stores contain no entries. @param this - Actual column. @param context - Native paste context. @param clipColumn - Actual source column. @param broadcasts - Deferred changed spans. @returns Nothing. */
export function DeleteBeforeCopyFromClip(
  this: ScColumn,
  context: CopyFromClipContext,
  clipColumn: ScColumn,
  broadcasts: ColumnSpanSet,
): void {
  const range = context.getDestRange(),
    doc = this.GetDoc();
  if (!doc.ValidRow(range.mnRow1) || !doc.ValidRow(range.mnRow2)) return;
  const position = context.getBlockPosition(this.GetTab(), this.GetCol());
  if (!position) return;
  const flags = context.getDeleteFlag();
  if (context.isSkipEmptyCells() || flags !== InsertDeleteFlags.CONTENTS)
    throw new Error("Nondefault pre-paste deletion is not implemented");
  // CONTENTS does not delete patterns. Rich edit,notes and sparklines cannot be inserted in this represented store.
  void clipColumn;
  const result = this.DeleteCells(position, range.mnRow1, range.mnRow2, flags);
  broadcasts.set(doc, this.GetTab(), this.GetCol(), result.aDeletedRows, true);
  for (const [first, last] of result.aFormulaRanges)
    context.setListeningFormulaSpans(this.GetTab(), this.GetCol(), first, this.GetCol(), last);
}

/** Original block handler ends whole intersected groups and retains source output sentinel behavior. */
export class EndListeningFormulaCellsHandler implements BlockFunction {
  private mnStartRow = -1;
  private mnEndRow = -1;
  /** Borrows the actual teardown context. @param mrEndCxt - Actual end-listening context. @returns Handler. */
  constructor(private readonly mrEndCxt: EndListeningContext) {}
  /** Original singleton/group traversal backtracks the first group and tears down excess end members. @param node - Actual store block. @param offset - First requested member. @param size - Requested count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    if (node.type !== element_type_formula) return;
    this.mnStartRow = node.position + offset;
    const data = node.data as base_element_block;
    let index = offset;
    const first = formula_block.at(data, index) as ScFormulaCell;
    if (first.IsShared() && !first.IsSharedTop()) {
      const back = Math.max(0, first.aPos.Row() - first.GetSharedTopRow());
      index -= back;
      this.mnStartRow -= back;
    }
    for (; index < offset + size; ++index) {
      const cell = formula_block.at(data, index) as ScFormulaCell;
      if (!cell.IsSharedTop()) {
        cell.EndListeningTo(this.mrEndCxt);
        continue;
      }
      const endGroup = index - offset + cell.GetSharedLength();
      this.mnEndRow = node.position + offset + endGroup - 1;
      for (let member = index; member < index + cell.GetSharedLength(); ++member)
        (formula_block.at(data, member) as ScFormulaCell).EndListeningTo(this.mrEndCxt);
      if (endGroup > size) index = offset + size - 1;
      else index += cell.GetSharedLength() - 1;
    }
  }
  /** Original last visited block's start output. @returns Row or minus one. */
  getStartRow(): number {
    return this.mnStartRow;
  }
  /** Original last visited group's end output;singletons do not assign it. @returns Row or minus one. */
  getEndRow(): number {
    return this.mnEndRow;
  }
}
/** Original column4 group-aware end listening;an entirely formula-free column leaves output arguments untouched. @param this - Actual column. @param context - Actual teardown owner. @param first - First row. @param last - Last row. @param startRow - Optional native output. @param endRow - Optional native output. @returns Nothing. */
export function EndListeningFormulaCells(
  this: ScColumn,
  context: EndListeningContext,
  first: number,
  last: number,
  startRow: [number] | null = null,
  endRow: [number] | null = null,
): void {
  if (!this.HasFormulaCell()) return;
  const action = new EndListeningFormulaCellsHandler(context),
    cells = this.GetCellStore();
  ProcessBlock(cells.begin(), cells, action, first, last);
  if (startRow) startRow[0] = action.getStartRow();
  if (endRow) endRow[0] = action.getEndRow();
}

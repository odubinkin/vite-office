/** @fileoverview Original column3.cxx GroupFormulaCells functor and whole-column regrouping over actual typed storage. */
import {
  formula_block,
  element_type_formula,
  element_type_numeric,
  element_type_string,
  ColumnBlockPosition,
  numeric_block,
  string_block,
  celltextattr_block,
  element_type_celltextattr,
  celltextattr_element_callbacks,
  type CellStoreType,
  type CellTextAttrStoreType,
} from "../../../inc/mtvelements";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
import { ScFormulaCell, type ScFormulaCellGroup, CompareState } from "../../../inc/formulacell";
import { ScAddress } from "../../../inc/address";
import type { ScColumn } from "../../../inc/column";
import {
  ParseBlock,
  ProcessBlock,
  type BlockFunction,
  type CellStoreNode,
} from "../../../inc/mtvfunctions";
import { SingleColumnSpanSet, RowSpan } from "../../../inc/columnspanset";
import { InsertDeleteFlags } from "../../../inc/global";
import type { ScDocument } from "../../../inc/document";
import type { CopyFromClipContext } from "../../../inc/clipcontext";
import type { SharedStringPool } from "../../../../svl/inc/sharedstringpool";
import { ScMatrixMode } from "../../../inc/formulacell";
import { SharedFormulaUtil } from "../../../inc/sharedformula";
/** Original block functor retains existing groups and joins adjacent compatible owners. */
export class GroupFormulaCells {
  /** Borrows optional actual changed-group positions. @param mpGroupPos - Native output or null. @returns Functor. */
  constructor(private readonly mpGroupPos: ScAddress[] | null) {}
  /** Consumes the actual formula block. @param node - Store node. @returns Nothing. */
  call(node: CellStoreNode): void {
    if (node.type !== element_type_formula) return;
    const data = node.data as base_element_block,
      iterator = formula_block.begin(data),
      end = formula_block.end(data);
    let previous = iterator.get() as ScFormulaCell,
      previousGroup = previous.GetCellGroup(),
      row = node.position;
    const initial = previousGroup?.mnLength ?? 1;
    iterator.advance(initial);
    row += initial;
    while (!iterator.equals(end)) {
      const current = iterator.get() as ScFormulaCell,
        currentGroup = current.GetCellGroup(),
        state = previous.CompareByTokenArray(current);
      if (state === CompareState.NotEqual) {
        const length = currentGroup?.mnLength ?? 1;
        if (currentGroup && length > node.position + node.size - row)
          throw new Error("Shared group exceeds formula block.");
        iterator.advance(length);
        row += length;
        previous = current;
        previousGroup = currentGroup;
        continue;
      }
      if (previousGroup) {
        if (currentGroup) {
          previousGroup.mnLength += currentGroup.mnLength;
          current.SetCellGroup(previousGroup);
          const length = currentGroup.mnLength;
          if (length > node.position + node.size - row)
            throw new Error("Shared group exceeds formula block.");
          for (let offset = 1; offset < length; offset++)
            (iterator.copy().advance(offset).get() as ScFormulaCell).SetCellGroup(previousGroup);
          iterator.advance(length);
          row += length;
        } else {
          current.SetCellGroup(previousGroup);
          ++previousGroup.mnLength;
          ++row;
          iterator.advance(1);
        }
      } else if (currentGroup) {
        if (currentGroup.mnLength > node.position + node.size - row)
          throw new Error("Shared group exceeds formula block.");
        row += currentGroup.mnLength;
        iterator.advance(currentGroup.mnLength);
        previous.SetCellGroup(currentGroup);
        currentGroup.mpTopCell = previous;
        ++currentGroup.mnLength;
        previousGroup = currentGroup;
      } else {
        if (previous.aPos.Row() !== row - 1)
          throw new Error("Previous formula row differs from storage.");
        previousGroup = previous.CreateCellGroup(
          2,
          state === CompareState.EqualInvariant,
        ) as ScFormulaCellGroup;
        current.SetCellGroup(previousGroup);
        ++row;
        iterator.advance(1);
      }
      this.mpGroupPos?.push(new ScAddress(current.aPos));
      // Native pCur=pPrev;xCurGrp=xPrevGrp keeps the surviving group's top.
    }
  }
}
/** Original whole-column regroup does not rebuild formulas or subscriptions. @param this - Actual column. @param positions - Optional changed-group positions. @returns Nothing. */
export function RegroupFormulaCells(this: ScColumn, positions: ScAddress[] | null): void {
  const cells = this.GetCellStore(),
    action = new GroupFormulaCells(positions);
  for (
    const iterator = cells.begin(), end = cells.end();
    !iterator.equals(end);
    iterator.increment()
  )
    action.call(iterator.get());
}

/** Original DeleteCellsResult retains compact deleted spans and pre-teardown group extents. */
export class DeleteCellsResult {
  readonly aDeletedRows: SingleColumnSpanSet;
  aFormulaRanges: [number, number][] = [];
  /** Uses the actual source document's limits. @param doc - Document. @returns Result. */
  constructor(doc: ScDocument) {
    this.aDeletedRows = new SingleColumnSpanSet(doc.GetSheetLimits());
  }
}
/** Original block deletion classifier for represented default CONTENTS;selective date/number formatting remains unavailable. */
class DeleteAreaHandler implements BlockFunction {
  private readonly maFormulaCells: ScFormulaCell[] = [];
  private readonly maDeleteRanges: SingleColumnSpanSet;
  /** Borrows source document and original deletion mask. @param doc - Actual document. @param flags - Original flags. @returns Handler. */
  constructor(
    private readonly doc: ScDocument,
    private readonly flags: InsertDeleteFlags,
  ) {
    const numeric = !!(flags & InsertDeleteFlags.VALUE),
      dateTime = !!(flags & InsertDeleteFlags.DATETIME);
    if (numeric !== dateTime)
      throw new Error("Selective date/number deletion requires the native formatter");
    this.maDeleteRanges = new SingleColumnSpanSet(doc.GetSheetLimits());
  }
  /** Tags genuine nonempty blocks without walking empty rows. @param node - Store node. @param offset - Span offset. @param size - Span length. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    switch (node.type) {
      case element_type_numeric:
        if (!(this.flags & InsertDeleteFlags.VALUE)) return;
        break;
      case element_type_string:
        if (!(this.flags & InsertDeleteFlags.STRING)) return;
        break;
      case element_type_formula:
        if (!(this.flags & InsertDeleteFlags.FORMULA)) return;
        for (let index = offset; index < offset + size; ++index)
          this.maFormulaCells.push(
            formula_block.at(node.data as base_element_block, index) as ScFormulaCell,
          );
        break;
      default:
        return;
    }
    const first = node.position + offset;
    this.maDeleteRanges.set(first, first + size - 1, true);
  }
  /** Captures original full group bounds before any listener or grouping mutation. @returns Inclusive pairs. */
  getFormulaRanges(): [number, number][] {
    return this.maFormulaCells.map(
      /** Reads the actual shared top and length. @param cell - Actual member. @returns Original extent. */ (
        cell,
      ) => {
        const group = cell.GetCellGroup(),
          first = group ? (group.mpTopCell as ScFormulaCell).aPos.Row() : cell.aPos.Row();
        return [first, group ? first + group.mnLength - 1 : first];
      },
    );
  }
  /** Original bulk end and explicit purge. @returns Nothing. */
  endFormulas(): void {
    this.doc.EndListeningFormulaCells(this.maFormulaCells);
  }
  /** Borrows original deletion owner. @returns Span owner. */
  getSpans(): SingleColumnSpanSet {
    return this.maDeleteRanges;
  }
}
/** Original typed-store deletion splits only top/bottom grouping boundaries and empties spans in reverse order. @param this - Actual column. @param position - Original cached cursors. @param first - First row. @param last - Last row. @param flags - Original flags. @returns Original result. */
export function DeleteCells(
  this: ScColumn,
  position: ColumnBlockPosition,
  first: number,
  last: number,
  flags: InsertDeleteFlags,
): DeleteCellsResult {
  const result = new DeleteCellsResult(this.GetDoc()),
    action = new DeleteAreaHandler(this.GetDoc(), flags),
    cells = this.GetCellStore();
  ProcessBlock(
    cells.position(position.miCellPos as ReturnType<CellStoreType["begin"]>, first).first,
    cells,
    action,
    first,
    last,
  );
  result.aFormulaRanges = action.getFormulaRanges();
  action.endFormulas();
  const spans: RowSpan[] = [];
  action.getSpans().getSpans(spans);
  for (let index = spans.length - 1; index >= 0; --index) {
    const span = spans[index] as RowSpan;
    let at = cells.position(position.miCellPos as ReturnType<CellStoreType["begin"]>, span.mnRow1);
    splitFormulaGrouping(at);
    at = cells.position(at.first, span.mnRow2);
    splitFormulaGrouping(at);
    position.miCellPos = cells.set_empty(
      position.miCellPos as ReturnType<CellStoreType["begin"]>,
      span.mnRow1,
      span.mnRow2,
    );
    position.miCellTextAttrPos = this["maCellTextAttrs"].set_empty(
      position.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
      span.mnRow1,
      span.mnRow2,
    );
  }
  action.getSpans().swap(result.aDeletedRows);
  return result;
}
/** Original EmptyCells boundary split consumes the actual store node. @param position - Actual block position. @returns Nothing. */
function splitFormulaGrouping(position: ReturnType<CellStoreType["position"]>): void {
  const node = position.first.get();
  if (node.type === element_type_formula)
    SharedFormulaUtil.unshareFormulaCell(
      position,
      formula_block.at(node.data as base_element_block, position.second) as ScFormulaCell,
    );
}

/** Copies native iterator values rather than aliasing mutable JavaScript cursor objects. @param target - Existing value. @param source - Initialized native value. @returns Nothing. */
function assignBlockPosition(target: ColumnBlockPosition, source: ColumnBlockPosition): void {
  target.miCellPos = (source.miCellPos as ReturnType<CellStoreType["begin"]>).copy();
  target.miCellTextAttrPos = (
    source.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>
  ).copy();
  target.miBroadcasterPos = (
    source.miBroadcasterPos as NonNullable<ColumnBlockPosition["miBroadcasterPos"]>
  ).copy();
}
/** Original default CONTENTS block functor;unrepresented note/edit/sparkline services and number-format inheritance remain explicit boundaries. */
export class CopyCellsFromClipHandler implements BlockFunction {
  private readonly maDestBlockPos = new ColumnBlockPosition();
  private readonly mpDestBlockPos: ColumnBlockPosition | null;
  /** Borrows actual native context,column and optional foreign shared-string pool. @param context - Native context. @param source - Source column. @param destination - Destination column. @param mnTab - Destination tab. @param mnCol - Destination column. @param mnRowOffset - Row displacement. @param mpSharedStringPool - Foreign-copy destination pool. @returns Handler. */
  constructor(
    context: CopyFromClipContext,
    source: ScColumn,
    private readonly destination: ScColumn,
    private readonly mnTab: number,
    private readonly mnCol: number,
    private readonly mnRowOffset: number,
    private readonly mpSharedStringPool: SharedStringPool | null,
  ) {
    // Default CONTENTS copies every represented cell alternative;the source column supplies genuine blocks.
    void source;
    this.mpDestBlockPos = context.getBlockPosition(mnTab, mnCol);
    if (this.mpDestBlockPos) {
      const temporary = new ColumnBlockPosition();
      destination.InitBlockPosition(temporary);
      this.mpDestBlockPos.miBroadcasterPos = temporary.miBroadcasterPos as NonNullable<
        ColumnBlockPosition["miBroadcasterPos"]
      >;
      assignBlockPosition(this.maDestBlockPos, this.mpDestBlockPos);
    } else destination.InitBlockPosition(this.maDestBlockPos);
  }
  /** Original handler destruction writes actual cached positions back to the operation. @returns Nothing. */
  Dispose(): void {
    if (this.mpDestBlockPos) assignBlockPosition(this.mpDestBlockPos, this.maDestBlockPos);
  }
  /** Original default-content block dispatch retains native numeric/string/formula insertion order. @param node - Actual source node. @param offset - First element. @param size - Element count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    const first = node.position + offset;
    switch (node.type) {
      case element_type_numeric:
        for (let index = 0; index < size; ++index)
          this.destination.SetValue(
            this.maDestBlockPos,
            first + index + this.mnRowOffset,
            numeric_block.at(node.data as base_element_block, offset + index),
          );
        break;
      case element_type_string:
        for (let index = 0; index < size; ++index) {
          const source = string_block.at(node.data as base_element_block, offset + index),
            interned = this.mpSharedStringPool?.intern(source.getString());
          try {
            this.destination.SetRawString(
              this.maDestBlockPos,
              first + index + this.mnRowOffset,
              interned ?? source,
            );
          } finally {
            interned?.dispose();
          }
        }
        break;
      case element_type_formula:
        for (let index = 0; index < size; ++index) {
          const source = formula_block.at(
              node.data as base_element_block,
              offset + index,
            ) as ScFormulaCell,
            row = first + index + this.mnRowOffset;
          if (source.GetMatrixFlag() !== ScMatrixMode.NONE)
            throw new Error("Matrix clipboard copying is not implemented");
          this.destination.SetFormulaCell(
            this.maDestBlockPos,
            row,
            new ScFormulaCell(
              source,
              this.destination.GetDoc(),
              new ScAddress(this.mnCol, row, this.mnTab),
            ),
          );
        }
        break;
      // Empty source runs copy no content;pre-deletion owns removal of the old destination.
      default:
        return;
    }
  }
}
/** Original separate text-metadata functor copies original source widths/script types after content insertion. */
export class CopyTextAttrsFromClipHandler implements BlockFunction {
  private readonly maDestBlockPos = new ColumnBlockPosition();
  private readonly mpDestBlockPos: ColumnBlockPosition | null;
  /** Borrows actual attribute storage and cached positions. @param context - Context. @param mrAttrs - Destination metadata store. @param destination - Destination column. @param tab - Destination tab. @param col - Destination column. @param mnDelta - Row displacement. @returns Handler. */
  constructor(
    context: CopyFromClipContext,
    private readonly mrAttrs: CellTextAttrStoreType,
    destination: ScColumn,
    tab: number,
    col: number,
    private readonly mnDelta: number,
  ) {
    this.mpDestBlockPos = context.getBlockPosition(tab, col);
    if (this.mpDestBlockPos)
      this.maDestBlockPos.miCellTextAttrPos = (
        this.mpDestBlockPos.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>
      ).copy();
    else destination.InitBlockPosition(this.maDestBlockPos);
  }
  /** Original destructor saves only its text-attribute hint. @returns Nothing. */
  Dispose(): void {
    if (this.mpDestBlockPos)
      this.mpDestBlockPos.miCellTextAttrPos = this.maDestBlockPos.miCellTextAttrPos as ReturnType<
        CellTextAttrStoreType["begin"]
      >;
  }
  /** Copies one original metadata block span by value through actual mdds storage. @param node - Source block. @param offset - First element. @param size - Count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    if (node.type !== element_type_celltextattr) return;
    const iterator = celltextattr_block.begin(node.data as base_element_block).advance(offset),
      end = iterator.copy().advance(size);
    this.maDestBlockPos.miCellTextAttrPos = this.mrAttrs.set(
      this.maDestBlockPos.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
      node.position + offset + this.mnDelta,
      iterator,
      end,
      celltextattr_element_callbacks,
    );
  }
}
/** Original column3 general clipboard path for admitted CONTENTS. It preserves the separate content/metadata passes and cached operation cursors. @param this - Actual destination column. @param context - Native context. @param first - Destination first row. @param last - Destination last row. @param delta - Original source-to-destination row displacement. @param source - Actual source column. @returns Nothing. */
export function CopyFromClip(
  this: ScColumn,
  context: CopyFromClipContext,
  first: number,
  last: number,
  delta: number,
  source: ScColumn,
): void {
  if (!context.getBlockPosition(this.GetTab(), this.GetCol())) return;
  const pool =
    source.GetDoc().GetPool() !== this.GetDoc().GetPool()
      ? this.GetDoc().GetSharedStringPool()
      : null;
  const cells = new CopyCellsFromClipHandler(
      context,
      source,
      this,
      this.GetTab(),
      this.GetCol(),
      delta,
      pool,
    ),
    sourceCells = source.GetCellStore();
  try {
    ParseBlock(sourceCells.cbegin(), sourceCells, cells, first - delta, last - delta);
  } finally {
    cells.Dispose();
  }
  const attributes = new CopyTextAttrsFromClipHandler(
      context,
      this["maCellTextAttrs"],
      this,
      this.GetTab(),
      this.GetCol(),
      delta,
    ),
    sourceAttrs = source["maCellTextAttrs"];
  try {
    ParseBlock(sourceAttrs.cbegin(), sourceAttrs, attributes, first - delta, last - delta);
  } finally {
    attributes.Dispose();
  }
}

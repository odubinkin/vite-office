/** @fileoverview Original column3.cxx GroupFormulaCells functor and whole-column regrouping over actual typed storage. */
import {
  formula_block,
  element_type_formula,
  element_type_numeric,
  element_type_string,
  type ColumnBlockPosition,
  type CellStoreType,
  type CellTextAttrStoreType,
} from "../../../inc/mtvelements";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
import { ScFormulaCell, type ScFormulaCellGroup, CompareState } from "../../../inc/formulacell";
import { ScAddress } from "../../../inc/address";
import type { ScColumn } from "../../../inc/column";
import { ProcessBlock, type BlockFunction, type CellStoreNode } from "../../../inc/mtvfunctions";
import { SingleColumnSpanSet, RowSpan } from "../../../inc/columnspanset";
import { InsertDeleteFlags } from "../../../inc/global";
import type { ScDocument } from "../../../inc/document";
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

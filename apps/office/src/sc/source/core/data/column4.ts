/** @fileoverview Original column4.cxx group-listening block handler,including partial-span backtracking and excess-member teardown. */
import { ProcessBlock, type BlockFunction, type CellStoreNode } from "../../../inc/mtvfunctions";
import { formula_block, element_type_formula } from "../../../inc/mtvelements";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
import type { ScFormulaCell } from "../../../inc/formulacell";
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

/** @fileoverview Original column3.cxx GroupFormulaCells functor and whole-column regrouping over actual typed storage. */
import { formula_block, element_type_formula } from "../../../inc/mtvelements";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
import { ScFormulaCell, type ScFormulaCellGroup, CompareState } from "../../../inc/formulacell";
import { ScAddress } from "../../../inc/address";
import type { ScColumn } from "../../../inc/column";
import type { CellStoreNode } from "../../../inc/mtvfunctions";
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
export function RegroupFormulaCells(this: ScColumn, positions: ScAddress[] | null = null): void {
  const cells = this.GetCellStore(),
    action = new GroupFormulaCells(positions);
  for (
    const iterator = cells.begin(), end = cells.end();
    !iterator.equals(end);
    iterator.increment()
  )
    action.call(iterator.get());
}

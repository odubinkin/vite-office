/** @fileoverview Native default range SUM block accumulator and column action from interpr6.cxx. Number-format services and other aggregate range actions remain separate native consumers. */
import { KahanSum } from "../../../inc/kahan";
import { sumArray } from "../../../inc/arraysumfunctor";
import { ParseBlock, type CellStoreNode, type BlockFunction } from "../../../inc/mtvfunctions";
import {
  numeric_block,
  formula_block,
  element_type_numeric,
  element_type_formula,
  type ColumnBlockConstPosition,
  type CellStoreType,
} from "../../../inc/mtvelements";
import type { ScColumn } from "../../../inc/column";
import type { ColumnAction } from "../../../inc/columnspanset";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { ScInterpreterContext } from "../../../inc/interpretercontext";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
/** Original block-wise numeric and formula accumulator,retaining source array partition and error behavior. */
export class NumericCellAccumulator implements BlockFunction {
  private readonly maSum = new KahanSum(0);
  private mnError = FormulaError.NONE;
  /** Original functor call over an actual native store node. @param node - Borrowed node. @param offset - Data offset. @param size - Data count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    switch (node.type) {
      case element_type_numeric:
        if (size === 0) return;
        this.maSum.add(
          sumArray(numeric_block.data(node.data as base_element_block).advance(offset), size),
        );
        break;
      case element_type_formula:
        for (let i = offset; i < offset + size; i++) {
          const cell = formula_block.at(node.data as base_element_block, i) as ScFormulaCell,
            output = { error: FormulaError.NONE, value: 0 };
          if (!cell.GetErrorOrValue(output)) continue;
          if (output.error !== FormulaError.NONE) {
            this.mnError = output.error;
            return;
          }
          this.maSum.add(output.value);
        }
        break;
      default:
        break;
    }
  }
  /** Reads original accumulated error. @returns Error. */
  getError(): FormulaError {
    return this.mnError;
  }
  /** Borrows the actual accumulator as the native const result. @returns Sum. */
  getResult(): KahanSum {
    return this.maSum;
  }
}
/** Original default SUM column action using native block positions and ParseBlock. Formatter metadata remains outside this numeric slice. */
export class FuncSum implements ColumnAction {
  private mpCol: ScColumn | null = null;
  private readonly maPos: ColumnBlockConstPosition = {};
  private readonly mfSum = new KahanSum(0);
  private mnError = FormulaError.NONE;
  /** Retains the actual native interpreter context binding. @param mrContext - Context. @returns Action. */
  constructor(readonly mrContext: ScInterpreterContext) {}
  /** Initializes original column-block cursors. @param column - Actual allocated column. @returns Nothing. */
  startColumn(column: ScColumn): void {
    this.mpCol = column;
    column.InitBlockPosition(this.maPos);
  }
  /** Executes original numeric range accumulation after flag/error gates. @param first - First row. @param last - Last row. @param value - Native span flag. @returns Nothing. */
  execute(first: number, last: number, value: boolean): void {
    if (!value) return;
    if (this.mnError !== FormulaError.NONE) return;
    const action = new NumericCellAccumulator();
    this.maPos.miCellPos = ParseBlock(
      this.maPos.miCellPos as ReturnType<CellStoreType["cbegin"]>,
      (this.mpCol as ScColumn).GetCellStore(),
      action,
      first,
      last,
    );
    this.mnError = action.getError();
    if (this.mnError !== FormulaError.NONE) return;
    this.mfSum.add(action.getResult());
  }
  /** Reads the original range error. @returns Error. */
  getError(): FormulaError {
    return this.mnError;
  }
  /** Borrows the original compensated range result. @returns Sum. */
  getSum(): KahanSum {
    return this.mfSum;
  }
}

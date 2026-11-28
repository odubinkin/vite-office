/** @fileoverview Native TableValues sparse content swap used by Formula to Value and its undo. */
import { SharedString } from "../../../../svl/inc/sharedstring";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import { ProcessFormula } from "../../../inc/mtvcellfunc";
import { AutoCalcSwitch } from "../../../inc/scopetools";
import { FormulaResultValue } from "../tool/formularesult";

/** Sparse snapshot entry in sheet, column and row order. */
interface ValueSlot {
  readonly position: ScAddress;
  value: ScCellValue;
}

/** Holds sparse cell content and exchanges it with the same workbook range. */
export class TableValues {
  private readonly cells: ValueSlot[] = [];
  /** Captures the range independently of the current view. @param range - Selected cell range. @returns Table values. */
  constructor(private readonly range: ScRange) {
    this.range = new ScRange(range);
  }

  /** Captures cached or calculated formula results using the source conversion types. @param doc - Active workbook. @param range - Native selection. @returns Values ready for the first swap. */
  static FromFormulaResults(doc: ScDocument, range: ScRange): TableValues {
    const result = new TableValues(range);
    for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab(); ++tab) {
      const sheet = doc.FetchTable(tab);
      if (!sheet) continue;
      for (
        let column = range.aStart.Col();
        column <= Math.min(range.aEnd.Col(), sheet.GetAllocatedColumnsCount() - 1);
        ++column
      ) {
        const store = sheet.CreateColumnIfNotExists(column).GetCellStore();
        ProcessFormula(
          store.begin(),
          store,
          range.aStart.Row(),
          range.aEnd.Row(),
          /** Snapshots a formula result as a scalar cell value for conversion. @param row - Source cell row. @param cell - Native formula cell. @returns Nothing. */ (
            row,
            cell,
          ) => {
            const value = new ScCellValue();
            const formula = cell.GetResult();
            try {
              if (formula.meType === FormulaResultValue.Value) value.set(formula.mfValue);
              else if (formula.meType === FormulaResultValue.String && formula.mbMultiLine) {
                const engine = doc.GetEditEngine();
                engine.SetTextCurrentDefaults(formula.maString.getString());
                const content = engine.CreateTextObject();
                if (content) {
                  try {
                    value.set(content);
                  } finally {
                    content.dispose();
                  }
                } else value.set(formula.maString);
              } else
                value.set(
                  formula.meType === FormulaResultValue.String
                    ? formula.maString
                    : SharedString.getEmptyString(),
                );
              result.cells.push({ position: new ScAddress(column, row, tab), value });
            } finally {
              formula.dispose();
            }
          },
        );
      }
    }
    return result;
  }

  /** Exchanges the sparse snapshot with current cell content, preserving literal empty strings and formats. @param doc - Active workbook. @returns Nothing. */
  SwapNonEmpty(doc: ScDocument): void {
    const calc = new AutoCalcSwitch(doc, false);
    try {
      for (const entry of this.cells) {
        const position = entry.position;
        const column = doc.FetchTable(position.Tab())?.CreateColumnIfNotExists(position.Col());
        if (!column) continue;
        const current = new ScCellValue();
        current.assign(doc, position);
        if (entry.value.getType() === CellType.CELLTYPE_STRING)
          column.SetRawString(position.Row(), entry.value.getSharedString());
        else entry.value.commit(doc, position);
        entry.value.clear();
        entry.value = current;
      }
    } finally {
      calc.Dispose();
    }
  }

  /** Returns the original affected block. @returns Boundaries. */
  GetRange(): ScRange {
    return new ScRange(this.range);
  }

  /** Releases the owned sparse cell values. @returns Nothing. */
  Dispose(): void {
    for (const entry of this.cells) entry.value.clear();
    this.cells.length = 0;
  }
}

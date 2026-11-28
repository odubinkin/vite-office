/** @fileoverview Native Writer table formula source and calculation context from cellfml.cxx. */
import type { SwCalc } from "../bastyp/calc";
import type { SwTable, SwTableBox } from "../table/swtable";

/** Original double sentinel for a faulty Writer table expression. */
export const SW_TABLE_FORMULA_ERROR = Number.MAX_VALUE;

/** Active table calculation state, shared while resolving referenced boxes. */
export class SwTableCalcPara {
  private readonly stack = new Set<SwTableBox>();

  /** Binds the native calculator and the table for cross-table name lookup. @param calculator - Calculation variable and expression owner. @param tables - Document table owners. */
  public constructor(
    public readonly calculator: SwCalc,
    private readonly tables: ReadonlyMap<string, SwTable>,
  ) {}

  /** Resolves a table reference, using the original current-table fallback. @param name - Authored table name. @param current - Table enclosing the formula. @returns Referenced table. */
  public FindTable(name: string, current: SwTable): SwTable {
    return this.tables.get(name) ?? current;
  }

  /** Reads one referenced box using the original bounded recursion and circular-reference guard. @param box - Native table box. @returns Numeric value, or undefined for nonnumeric text. */
  public GetBoxValue(box: SwTableBox): number | undefined {
    if (this.stack.size >= 49 || this.stack.has(box)) return SW_TABLE_FORMULA_ERROR;
    this.stack.add(box);
    try {
      return box.GetValue(this);
    } finally {
      this.stack.delete(box);
    }
  }
}

/** Original authored box formula and validity state used by its item owner. */
export class SwTableFormula {
  private valid = false;

  /** Creates a formula from its native external spelling. @param source - Authored formula. */
  public constructor(public readonly source: string) {}

  /** Reports whether its current result is valid. @returns Native valid flag. */
  public IsValid(): boolean {
    return this.valid;
  }

  /** Sets the original validity flag. @param valid - Whether the cached value may be reused. */
  public ChgValid(valid: boolean): void {
    this.valid = valid;
  }

  /** Builds the calculator expression from native box values. @param table - Current table. @param parameter - Shared calculation state. @returns Calculator expression, or absence on a reference error. */
  public MakeFormula(table: SwTable, parameter: SwTableCalcPara): string | undefined {
    let output = "";
    let position = 0;
    for (;;) {
      let start = this.source.indexOf("<", position);
      while (start >= 0 && (this.source[start + 1] === " " || this.source[start + 1] === "="))
        start = this.source.indexOf("<", start + 1);
      const end = start < 0 ? -1 : this.source.indexOf(">", start + 1);
      if (end < 0) return output + this.source.slice(position);
      output += this.source.slice(position, start);
      let name = this.source.slice(start + 1, end);
      let target = table;
      const fragments = name.split(".");
      if ((fragments.length - 1) % 2 !== 0) {
        const tableName = fragments[0] ?? "";
        target = parameter.FindTable(tableName, table);
        name = name.slice(tableName.length + 1);
      }
      const separator = name.indexOf(":");
      const first = target.GetTableBox(separator < 0 ? name : name.slice(0, separator));
      if (!first) return undefined;
      const last = separator < 0 ? undefined : target.GetTableBox(name.slice(separator + 1));
      if (separator >= 0 && !last) return undefined;
      const boxes = last ? GetBoxes(target, first, last) : [first];
      if (!boxes) return undefined;
      const numericOnly =
        /AVERAGE|COUNT/i.test(output) || (last !== undefined && /PRODUCT/i.test(output));
      const values: number[] = [];
      for (const box of boxes) {
        if (box.getRowSpan() < 1) continue;
        const value = parameter.GetBoxValue(box);
        if (value === SW_TABLE_FORMULA_ERROR) return undefined;
        if (value !== undefined || !numericOnly) values.push(value ?? 0);
      }
      output += " (" + values.join("|") + ") ";
      position = end + 1;
    }
  }
}

/** Selects an inclusive rectangle of native row boxes in a shared table or nested box. @param table - Table owner. @param first - Beginning content box. @param last - Ending content box. @returns Native boxes in row order. */
function GetBoxes(table: SwTable, first: SwTableBox, last: SwTableBox): SwTableBox[] | undefined {
  const firstRow = first.GetUpper();
  const lastRow = last.GetUpper();
  if (!firstRow || !lastRow || firstRow.GetUpper() !== lastRow.GetUpper()) return undefined;
  const rows = firstRow.GetUpper()?.GetTabLines() ?? table.GetTabLines();
  const row1 = rows.indexOf(firstRow),
    row2 = rows.indexOf(lastRow);
  const column1 = firstRow.GetTabBoxes().indexOf(first),
    column2 = lastRow.GetTabBoxes().indexOf(last);
  if (Math.min(row1, row2, column1, column2) < 0) return undefined;
  const boxes: SwTableBox[] = [];
  for (let row = Math.min(row1, row2); row <= Math.max(row1, row2); ++row)
    for (const box of rows[row]
      ?.GetTabBoxes()
      .slice(Math.min(column1, column2), Math.max(column1, column2) + 1) ?? [])
      if (box.GetSttNd()) boxes.push(box);
  return boxes;
}

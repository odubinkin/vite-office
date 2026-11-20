/** @fileoverview Calc ODF cell format ranges and the source's deferred default-style resolution. */
import { ScRange } from "../../../inc/address";
import type { ScXMLImport } from "./xmlimprt";

/** Parsed range attributes, before applying the row and column style defaults. */
interface CellStyleRange {
  readonly range: ScRange;
  readonly style: string | null;
  readonly type: number;
  readonly currency: string | null;
}
/** A native destination range with a resolved style name. */
type ResolvedCellStyleRange = CellStyleRange & { readonly style: string };

/** ScMyStylesImportHelper owns transient style ranges for the current sheet. */
export class ScMyStylesImportHelper {
  private readonly columnDefaults: string[] = [];
  private rowDefault = "";
  private pending: CellStyleRange | undefined;
  private readonly ranges: ResolvedCellStyleRange[] = [];

  /** Binds the importer which applies the ranges through the actual document. @param owner - Import owner. @returns The range helper. */
  constructor(private readonly owner: ScXMLImport) {}

  /** Records declared defaults over the source's repeated columns. @param name - XML cell style. @param count - Clipped width. @returns Nothing. */
  AddColumnStyle(name: string, count: number): void {
    for (let i = 0; i < count; i++) this.columnDefaults.push(name);
  }

  /** Selects the current row default for subsequent range resolution. @param name - Row cell-style name. @returns Nothing. */
  SetRowStyle(name: string): void {
    this.rowDefault = name;
  }

  /** Batches adjacent ranges with the same authored style, type and currency. @param range - Cell coordinates. @param style - Authored style or absent. @param type - ODF value type. @param currency - Optional currency symbol. @returns Nothing. */
  AddRange(range: ScRange, style: string | null, type: number, currency: string | null): void {
    const previous = this.pending;
    if (
      previous &&
      previous.style === style &&
      previous.type === type &&
      previous.currency === currency
    ) {
      const start = previous.range.aStart,
        end = previous.range.aEnd;
      if (
        start.Row() === range.aStart.Row() &&
        end.Row() === range.aEnd.Row() &&
        end.Col() + 1 === range.aStart.Col()
      ) {
        end.SetCol(range.aEnd.Col());
        return;
      }
      if (
        start.Col() === range.aStart.Col() &&
        end.Col() === range.aEnd.Col() &&
        end.Row() + 1 === range.aStart.Row()
      ) {
        end.SetRow(range.aEnd.Row());
        return;
      }
    }
    this.FlushRange();
    this.pending = { range, style, type, currency };
  }

  /** Resolves a pending rectangle against the current row and declared column defaults. @returns Nothing. */
  private FlushRange(): void {
    const pending = this.pending;
    if (!pending) return;
    const style = pending.style || this.rowDefault;
    const first = pending.range.aStart.Col(),
      last = pending.range.aEnd.Col();
    if (style) {
      this.ranges.push({ ...pending, style });
      return;
    }
    if (first >= this.columnDefaults.length) return;
    let start = first,
      name = this.columnDefaults[first] as string;
    for (let col = start + 1; col <= last && col < this.columnDefaults.length; col++) {
      const next = this.columnDefaults[col] as string;
      if (name === next) continue;
      this.AddDefaultRange(pending, name, start, col - 1);
      name = next;
      start = col;
    }
    this.AddDefaultRange(pending, name, start, last);
  }

  /** Records an original range fragment with one column default. @param pending - Source rectangle. @param style - Resolved style. @param first - First column. @param last - Last column. @returns Nothing. */
  private AddDefaultRange(
    pending: CellStyleRange,
    style: string,
    first: number,
    last: number,
  ): void {
    const range = new ScRange(pending.range);
    range.aStart.SetCol(first);
    range.aEnd.SetCol(last);
    this.ranges.push({ ...pending, range, style });
  }

  /** Flushes the last sheet range and applies the resolved cell styles. @returns Nothing. */
  EndTable(): void {
    this.FlushRange();
    for (const { range, style, type, currency } of this.ranges)
      this.owner.SetStyleToRange(range, style, type, currency);
  }
}

/** @fileoverview Native ODF row and column group boundaries for the repeated-axis writer. */
import type { ScOutlineArray, ScOutlineEntry } from "../../core/data/olinetab";
import type { ScRange } from "../../../inc/address";

/** Orders same-start opens from outer to inner, and closes all groups ending at the same index. */
export class ScMyOpenCloseColumnRowGroup {
  private readonly starts = new Map<number, ScOutlineEntry[]>();
  private readonly ends = new Map<number, number>();
  private readonly boundaries: number[];
  private boundary = 0;
  private last = -1;
  private readonly titleStart: number;
  private readonly titleEnd: number;
  private titleOpen = false;

  /** Projects the native outline and repeat interval into ODF element boundaries. @param array - Native outline axis. @param rows - Whether to use row elements. @param title - Repeated title interval. @returns Export buffer. */
  constructor(
    array: ScOutlineArray | undefined,
    private readonly rows: boolean,
    title?: ScRange,
  ) {
    const boundaries = new Set<number>();
    this.titleStart = title ? (rows ? title.aStart.Row() : title.aStart.Col()) : Infinity;
    this.titleEnd = title ? (rows ? title.aEnd.Row() : title.aEnd.Col()) : -1;
    if (title) {
      boundaries.add(this.titleStart);
      boundaries.add(this.titleEnd + 1);
      this.last = this.titleEnd;
    }
    if (array)
      for (let level = 0; level < array.GetDepth(); ++level)
        for (const entry of array.GetEntries(level)) {
          let starting = this.starts.get(entry.start);
          if (!starting) this.starts.set(entry.start, (starting = []));
          starting.push(entry);
          this.ends.set(entry.end, (this.ends.get(entry.end) ?? 0) + 1);
          boundaries.add(entry.start);
          boundaries.add(entry.end + 1);
          this.last = Math.max(this.last, entry.end);
        }
    this.boundaries = [...boundaries].sort(
      /** Orders boundaries along the native axis. @param a - First position. @param b - Second position. @returns Difference. */
      (a, b) => a - b,
    );
  }

  /** Gives the last grouped position, including otherwise empty rows. @returns Last position or -1. */
  GetLast(): number {
    return this.last;
  }

  /** Truncates repetition at the next opening or closing point. @param start - Current position. @param last - Candidate repeated end. @returns Inclusive end. */
  ClipRange(start: number, last: number): number {
    while ((this.boundaries[this.boundary] ?? Infinity) <= start) ++this.boundary;
    return Math.min(last, (this.boundaries[this.boundary] ?? Infinity) - 1);
  }

  /** Opens groups and the active title wrapper inside them. @param position - Current position. @returns XML starts. */
  OpenGroups(position: number): string {
    const name = this.rows ? "table:table-row-group" : "table:table-column-group";
    let result = "";
    for (const entry of this.starts.get(position) ?? [])
      result += `<${name}${entry.hidden ? ' table:display="false"' : ""}>`;
    if (!this.titleOpen && position >= this.titleStart && position <= this.titleEnd) {
      result += this.rows ? "<table:table-header-rows>" : "<table:table-header-columns>";
      this.titleOpen = true;
    }
    return result;
  }

  /** Closes titles before any group closes or opens at the next coordinate. @param position - Inclusive end. @returns XML ends. */
  CloseGroups(position: number): string {
    const name = this.rows ? "table:table-row-group" : "table:table-column-group";
    const count = this.ends.get(position) ?? 0;
    let result = "";
    if (this.titleOpen && (position === this.titleEnd || count || this.starts.has(position + 1))) {
      result += this.rows ? "</table:table-header-rows>" : "</table:table-header-columns>";
      this.titleOpen = false;
    }
    return result + `</${name}>`.repeat(count);
  }
}

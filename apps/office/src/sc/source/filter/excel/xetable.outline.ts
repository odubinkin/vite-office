/** @fileoverview XclExpOutlineBuffer transitions shared by native row and column exports. */
import { SC_OL_MAXDEPTH, type ScOutlineArray } from "../../core/data/olinetab";

/** XLSX attributes over a contiguous inclusive axis range. */
interface OutlineRun {
  last: number;
  level: number;
  collapsed: boolean;
}

/** Native level end and collapse cache at consecutive export positions, evaluated at sparse transitions. */
export class XclExpOutlineBuffer {
  private readonly runs: OutlineRun[] = [];

  /** Builds the original transition cache at every group boundary. @param array - The sheet's native outline axis. @param last - Last valid sheet index. @returns Buffer. */
  constructor(array: ScOutlineArray | undefined, last: number) {
    const boundaries = new Set([0, last + 1]);
    const levels = Array.from(
      { length: SC_OL_MAXDEPTH },
      /** Seeds the source end position while leaving the initial hidden flag false. @param _unused - Slot. @param level - Calc level. @returns Level cache. */
      (_unused, level) => ({ end: array?.GetEntryByPos(level, 0)?.end ?? 0, hidden: false }),
    );
    if (array)
      for (let level = 0; level < array.GetDepth(); ++level)
        for (const entry of array.GetEntries(level)) {
          boundaries.add(entry.start);
          boundaries.add(entry.end + 1);
          if (entry.end < last) boundaries.add(entry.end + 2);
        }
    const ordered = [...boundaries].sort(
      /** Sorts native positions. @param a - Left. @param b - Right. @returns Difference. */
      (a, b) => a - b,
    );
    let previous = 0;
    for (let index = 0; index + 1 < ordered.length; ++index) {
      const position = ordered[index] as number;
      const touched = array?.FindTouchedLevel(position, position);
      const level = touched === undefined ? 0 : touched + 1;
      let collapsed = false;
      if (level >= previous) {
        for (let current = 0; current <= (touched ?? 0); ++current) {
          const cache = levels[current] as { end: number; hidden: boolean };
          if (cache.end >= position) continue;
          const entry = array?.GetEntryByPos(current, position);
          if (entry) {
            cache.end = entry.end;
            cache.hidden = entry.hidden;
          }
        }
      } else {
        // Keep the source lower bound, including the zero fallback when all levels close.
        for (let current = (touched ?? 0) + 1; !collapsed && current < previous; ++current)
          collapsed = levels[current]?.hidden === true;
      }
      this.runs.push({ last: (ordered[index + 1] as number) - 1, level, collapsed });
      previous = level;
    }
  }

  /** Reads native attributes at a valid position, including the next transition. @param position - Row or column. @returns Outline state. */
  GetRange(position: number): OutlineRun {
    let low = 0,
      high = this.runs.length - 1;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if ((this.runs[middle] as OutlineRun).last < position) low = middle + 1;
      else high = middle;
    }
    return this.runs[low] as OutlineRun;
  }
}

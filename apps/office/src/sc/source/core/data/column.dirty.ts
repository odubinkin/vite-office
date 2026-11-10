/** @fileoverview Original column.cxx non-formula dirty-span functor, separated without changing the owning column or operation state. */
import type { ScColumn } from "../../../inc/column";
import { SingleColumnSpanSet, type ColumnSpanSet } from "../../../inc/columnspanset";
import { element_type_empty } from "../../../inc/mtvelements";
/** Original SetDirtyOnRangeHandler owns compact non-formula changed spans. */
export class SetDirtyOnRangeHandler {
  private readonly maValueRanges: SingleColumnSpanSet;
  /** Borrows the actual column and limits. @param column - Native owner. @returns Handler. */
  constructor(private readonly column: ScColumn) {
    this.maValueRanges = new SingleColumnSpanSet(column.GetDoc().GetSheetLimits());
  }
  /** Native non-formula dispatch excludes empty blocks. @param type - Store type. @param first - First row. @param length - Count. @returns Nothing. */
  other(type: number, first: number, length: number): void {
    if (type !== element_type_empty) this.maValueRanges.set(first, first + length - 1, true);
  }
  /** Transfers compact native true spans for the original post-insert broadcast. @param spans - Document operation owner. @returns Nothing. */
  fillBroadcastSpans(spans: ColumnSpanSet): void {
    spans.set(
      this.column.GetDoc(),
      this.column.GetTab(),
      this.column.GetCol(),
      this.maValueRanges,
      true,
    );
  }
}

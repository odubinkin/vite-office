/** @fileoverview Native XLSX manual page-break records collected from the actual Calc sheet. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { MAXCOL, MAXROW } from "../../../inc/address";
import type { ScTable } from "../../../inc/table";
import type { XclExpXmlStream } from "./xestream";

/** Original XLSX page-break record with ordered positions and a UInt16 cross-axis maximum. */
export class XclExpPageBreaks {
  /** Binds the source axis and collected positions. @param rows - Horizontal breaks. @param breaks - Original ordered manual break set. @param maximum - Cross-axis limit. @returns Record. */
  constructor(
    private readonly rows: boolean,
    private readonly breaks: ReadonlySet<number>,
    private readonly maximum: number,
  ) {}

  /** Writes the first 1023 manual positions using the original schema tokens. @param stream - Active worksheet stream. @returns Nothing. */
  SaveXml(stream: XclExpXmlStream): void {
    if (!this.breaks.size) return;
    const count = Math.min(1023, this.breaks.size);
    const serializer = stream.GetCurrentStream();
    const element = token(this.rows ? "rowBreaks" : "colBreaks");
    serializer.startElement(
      element,
      token("count"),
      String(count),
      token("manualBreakCount"),
      String(count),
    );
    let index = 0;
    for (const position of this.breaks) {
      if (index++ === count) break;
      serializer.singleElement(
        token("brk"),
        token("id"),
        String(position),
        token("man"),
        "true",
        token("max"),
        String(this.maximum),
        token("min"),
        "0",
      );
    }
    serializer.endElement(element);
  }
}

/** Collects the two original page settings records after sheet content. @param stream - Worksheet stream. @param table - Native sheet. @returns Nothing. */
export function SaveXmlPageBreaks(stream: XclExpXmlStream, table: ScTable): void {
  const rowBreaks = new Set<number>();
  table.GetAllRowBreaks(rowBreaks, false, true);
  const horizontal = new Set<number>();
  for (const row of rowBreaks) {
    if (row > 0xffff || horizontal.size === 1026) break;
    horizontal.add(row);
  }
  new XclExpPageBreaks(true, horizontal, MAXCOL & 0xffff).SaveXml(stream);
  const columns = new Set<number>();
  table.GetAllColBreaks(columns, false, true);
  new XclExpPageBreaks(false, columns, MAXROW & 0xffff).SaveXml(stream);
}

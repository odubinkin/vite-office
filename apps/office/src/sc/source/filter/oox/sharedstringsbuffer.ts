/** @fileoverview Original workbook-wide indexed owner for SpreadsheetML rich strings. */
import { RichString } from "../inc/richstring";

/** Keeps the original shared string indices, including empty items. */
export class SharedStringsBuffer {
  private readonly maStrings: RichString[] = [];

  /** Adds one source item and borrows it to its import context. @returns Appended item. */
  createRichString(): RichString {
    const value = new RichString();
    this.maStrings.push(value);
    return value;
  }

  /** Borrows the indexed item. @param index - Source shared string index. @returns Item or absence. */
  getString(index: number): RichString | undefined {
    return this.maStrings[index];
  }

  /** Releases the workbook's text portion owners. @returns Nothing. */
  dispose(): void {
    for (const value of this.maStrings) value.dispose();
    this.maStrings.length = 0;
  }
}

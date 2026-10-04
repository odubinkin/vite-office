/** @fileoverview Implements the native internet text-attribute construction boundary from pinned sw/source/core/txtnode/txtatr2.cxx. */
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextAttrNesting } from "./txatbase";

/** Concrete native internet attribute with locked nesting defaults and an item backlink. */
export class SwTextINetFormat extends SwTextAttrNesting<SwFormatINetFormat> {
  /** Initializes one native internet range. @param format - Owned internet item. @param start - Start offset. @param end - End offset. @returns Nothing. */
  public constructor(format: SwFormatINetFormat, start: number, end: number) {
    super(format, start, end);
    format.mpTextAttr = this;
    this.SetCharFormatAttr(true);
  }

  /** Retains concrete identity and an independent backlink in portable snapshots. @param format - Independent item. @param start - Start. @param end - End. @returns Detached snapshot. */
  protected override createRangeClone(
    format: SwFormatINetFormat,
    start: number,
    end: number,
  ): SwTextINetFormat {
    return new SwTextINetFormat(format, start, end);
  }
}

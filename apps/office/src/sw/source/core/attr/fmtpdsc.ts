/** @fileoverview Bounded SwFormatPageDesc from pinned sw/inc/fmtpdsc.hxx. */

import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_PAGEDESC } from "../../../inc/hintids";

/** Paragraph-owned reference to a page descriptor and optional page-number restart. */
export class SwFormatPageDesc extends SfxPoolItem {
  /** Creates one page-style reference. @param name - Referenced master page, empty for inherited follow. @param numOffset - Explicit first page number. @returns Nothing. */
  public constructor(
    private readonly name = "",
    private readonly numOffset?: number,
  ) {
    super(RES_PAGEDESC);
    if (
      numOffset !== undefined &&
      (!Number.isInteger(numOffset) || numOffset < 1 || numOffset > 65535)
    )
      throw new Error("Writer page-number offset is invalid.");
  }

  /** Returns the referenced page-style name. @returns Name or empty inheritance marker. */
  public GetPageDescName(): string {
    return this.name;
  }

  /** Returns the optional first physical page number. @returns Restart number. */
  public GetNumOffset(): number | undefined {
    return this.numOffset;
  }

  /** Clones the page descriptor reference. @returns Independent item. */
  public Clone(): SwFormatPageDesc {
    return new SwFormatPageDesc(this.name, this.numOffset);
  }

  /** Compares page descriptor identity and offset. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatPageDesc &&
      other.Which() === this.Which() &&
      other.name === this.name &&
      other.numOffset === this.numOffset
    );
  }

  /** Persists the page-style reference without a document pointer. @returns Name and offset pair. */
  public QueryValue(): readonly [string, number] {
    return [this.name, this.numOffset ?? 0];
  }
}

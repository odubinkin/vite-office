/**
 * @fileoverview Reimplements bounded SwFormatColl and SwTextFormatColl hierarchy from pinned `sw/source/core/doc/fmtcol.cxx`.
 */

import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { WRITER_TEXT_FORMAT_COLL_WHICH_RANGES } from "../../../inc/hintids";
import { SwFormat } from "../attr/format";
import type { SwAttrPool } from "../attr/swatrset";

/** Programmatic paragraph-style identities currently exposed by the browser UI. */
export const WRITER_PARAGRAPH_STYLES = ["default", "heading-1"] as const;

/** Identifies one current Writer paragraph-style collection. */
export type WriterParagraphStyle = (typeof WRITER_PARAGRAPH_STYLES)[number];

/** Persisted paragraph-style collection definition. */
export interface SwTextFormatCollSnapshot {
  /** Programmatic collection identity. */
  readonly id: WriterParagraphStyle;
  /** Direct collection attribute deltas. */
  readonly items: readonly SfxPoolItemSnapshot[];
  /** User-facing format name. */
  readonly name: string;
  /** Optional parent collection identity. */
  readonly parentId?: WriterParagraphStyle;
}

/** Named Writer format collection; unlike SwFormat it is not automatic. */
export class SwFormatColl extends SwFormat {
  /** Creates a named format collection. @param pool - Owning Writer pool. @param name - UI name. @param parent - Optional parent collection. @returns Nothing. */
  public constructor(pool: SwAttrPool, name: string, parent?: SwFormatColl) {
    super(pool, name, WRITER_TEXT_FORMAT_COLL_WHICH_RANGES, parent);
    this.SetAuto(false);
  }
}

/** Identity-bearing Writer paragraph style with follow-style linkage. */
export class SwTextFormatColl extends SwFormatColl {
  private nextTextFormatColl: SwTextFormatColl;

  /** Creates a paragraph style. @param pool - Owning Writer pool. @param id - Programmatic identity. @param name - UI name. @param parent - Optional parent style. @returns Nothing. */
  public constructor(
    pool: SwAttrPool,
    public readonly id: WriterParagraphStyle,
    name: string,
    parent?: SwTextFormatColl,
  ) {
    super(pool, name, parent);
    this.nextTextFormatColl = this;
  }

  /** Changes the follow-style collection. @param next - New follow style. @returns Nothing. */
  public SetNextTextFormatColl(next: SwTextFormatColl): void {
    this.nextTextFormatColl = next;
  }

  /** Returns the follow-style collection. @returns Next paragraph style. */
  public GetNextTextFormatColl(): SwTextFormatColl {
    return this.nextTextFormatColl;
  }

  /** Creates a persisted collection definition. @returns Style snapshot. */
  public toSnapshot(): SwTextFormatCollSnapshot {
    const parent = this.DerivedFrom();
    return {
      id: this.id,
      items: this.GetAttrSet().toSnapshot(),
      name: this.GetName(),
      ...(parent instanceof SwTextFormatColl ? { parentId: parent.id } : {}),
    };
  }
}

/** Checks one runtime paragraph-style identity. @param value - Unknown value. @returns True for a supported style ID. */
export function isWriterParagraphStyle(value: unknown): value is WriterParagraphStyle {
  return WRITER_PARAGRAPH_STYLES.includes(value as WriterParagraphStyle);
}

/**
 * @fileoverview Reimplements bounded SwFormatColl and SwTextFormatColl hierarchy from pinned `sw/source/core/doc/fmtcol.cxx`.
 */

import { WRITER_TEXT_FORMAT_COLL_WHICH_RANGES } from "../../../inc/hintids";
import { SwFormat } from "../attr/format";
import type { SwAttrPool } from "../attr/swatrset";
import {
  WRITER_PARAGRAPH_STYLE_POOL,
  type WriterParagraphStyleDefinition,
  type WriterParagraphStyleGroup,
} from "../../../inc/poolfmt";

/** Programmatic paragraph-style identities currently exposed by the browser UI. */
export const WRITER_PARAGRAPH_STYLES: readonly string[] = WRITER_PARAGRAPH_STYLE_POOL.map(
  /** Projects a stable identity. @param definition - Pool metadata. @returns ID. */ (definition) =>
    definition.id,
);

/** Identifies one current Writer paragraph-style collection. */
export type WriterParagraphStyle = string;

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
  private assignedOutlineLevel: number | undefined;

  /** Creates a paragraph style. @param pool - Owning Writer pool. @param id - Programmatic identity. @param name - UI name. @param parent - Optional parent style. @param poolId - Built-in pool ID. @param group - Built-in group. @returns Nothing. */
  public constructor(
    pool: SwAttrPool,
    public readonly id: WriterParagraphStyle,
    name: string,
    parent?: SwTextFormatColl,
    public readonly poolId = 0,
    public readonly group: WriterParagraphStyleGroup = "text",
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

  /** Assigns this collection to Writer's outline rule. @param level - Zero-based outline level. @returns Nothing. */
  public AssignToListLevelOfOutlineStyle(level: number): void {
    if (!Number.isInteger(level) || level < 0 || level > 9)
      throw new Error("Writer outline level is outside 0-9.");
    this.assignedOutlineLevel = level;
  }

  /** Returns the assigned outline level. @returns Zero-based level when assigned. */
  public GetAssignedOutlineStyleLevel(): number | undefined {
    return this.assignedOutlineLevel;
  }
}

/** Checks one runtime paragraph-style identity. @param value - Unknown value. @returns True for a supported style ID. */
export function isWriterParagraphStyle(value: unknown): value is WriterParagraphStyle {
  return typeof value === "string" && WRITER_PARAGRAPH_STYLES.includes(value);
}

/** Creates a collection from pinned pool metadata. @param pool - Attribute pool. @param definition - Style metadata. @param parent - Parent collection. @returns Collection. */
export function createWriterTextFormatColl(
  pool: SwAttrPool,
  definition: WriterParagraphStyleDefinition,
  parent?: SwTextFormatColl,
): SwTextFormatColl {
  const collection = new SwTextFormatColl(
    pool,
    definition.id,
    definition.name === "Standard" ? "Default Paragraph Style" : definition.name,
    parent,
    definition.poolId,
    definition.group,
  );
  const heading = /^heading-(10|[1-9])$/.exec(definition.id);
  if (heading !== null) {
    const level = Number(heading[1]) - 1;
    collection.AssignToListLevelOfOutlineStyle(level);
  }
  return collection;
}

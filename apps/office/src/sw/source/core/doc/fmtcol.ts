/**
 * @fileoverview Reimplements bounded SwFormatColl and SwTextFormatColl hierarchy from pinned `sw/source/core/doc/fmtcol.cxx`.
 */

import {
  RES_PARATR_NUMRULE,
  RES_PARATR_OUTLINELEVEL,
  WRITER_TEXT_FORMAT_COLL_WHICH_RANGES,
} from "../../../inc/hintids";
import type { WhichRangesContainer } from "../../../../svl/inc/whichranges";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import type { SwNumRuleItem } from "../para/paratr";
import type { SwNumRule } from "./number";
import { SfxItemState, type SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SwFormat } from "../attr/format";
import type { SwAttrPool } from "../attr/swatrset";
import {
  WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL,
  SwPoolFormatId,
  type WriterParagraphStyleDefinition,
  type WriterParagraphStyleGroup,
} from "../../../inc/poolfmt";

/** Programmatic paragraph-style identities currently exposed by the browser UI. */
export const WRITER_PARAGRAPH_STYLES: readonly string[] = WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.map(
  /** Projects a stable identity. @param definition - Pool metadata. @returns ID. */ (definition) =>
    definition.id,
);

/** Identifies one current Writer paragraph-style collection. */
export type WriterParagraphStyle = string;

/** Named Writer format collection; unlike SwFormat it is not automatic. */
export class SwFormatColl extends SwFormat {
  /** Creates a named format collection. @param pool - Owning Writer pool. @param name - UI name. @param parent - Optional parent collection. @param ranges - Original admitted style ranges. @returns Nothing. */
  public constructor(
    pool: SwAttrPool,
    name: string,
    parent?: SwFormatColl,
    ranges: WhichRangesContainer = WRITER_TEXT_FORMAT_COLL_WHICH_RANGES,
  ) {
    super(pool, name, ranges, parent);
    this.SetAuto(false);
  }
}

/** Identity-bearing Writer paragraph style with follow-style linkage. */
export class SwTextFormatColl extends SwFormatColl {
  private nextTextFormatColl: SwTextFormatColl;
  private mbAssignedToOutlineStyle = false;

  /** Creates a paragraph style. @param pool - Owning Writer pool. @param id - Programmatic identity. @param name - UI name. @param parent - Optional parent style. @param poolId - Built-in pool ID. @param group - Built-in group. @returns Nothing. */
  public constructor(
    pool: SwAttrPool,
    public readonly id: WriterParagraphStyle,
    name: string,
    parent?: SwTextFormatColl,
    poolId: number = SwPoolFormatId.UNKNOWN,
    public readonly group: WriterParagraphStyleGroup = "text",
  ) {
    super(pool, name, parent);
    this.nextTextFormatColl = this;
    this.SetPoolFormatId(poolId);
  }

  /** Existing browser readonly identity view delegates to the original shared format field. @returns Pool identity. */
  public get poolId(): number {
    return this.GetPoolFormatId();
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
    this.mbAssignedToOutlineStyle = true;
    this.SetAttrOutlineLevel(level + 1);
  }

  /** Reports assignment to the outline rule. @returns Assignment flag. */
  public IsAssignedToListLevelOfOutlineStyle(): boolean {
    return this.mbAssignedToOutlineStyle;
  }

  /** Reads the pooled outline attribute. @returns One-based outline level or zero. */
  public GetAttrOutlineLevel(): number {
    return (this.GetAttrSet().Get(RES_PARATR_OUTLINELEVEL) as SfxUInt16Item).GetValue();
  }

  /** Stores an outline attribute. @param level - Level from zero through ten. @returns Nothing. */
  public SetAttrOutlineLevel(level: number): void {
    if (!Number.isInteger(level) || level < 0 || level > 10)
      throw new Error("Writer outline level is outside 0-10.");
    this.SetFormatAttr(new SfxUInt16Item(RES_PARATR_OUTLINELEVEL, level));
  }

  /** Native single-item mutation detaches and reattaches the direct numbering-style client even for an unchanged value. @param item - Incoming direct item. @returns Whether the base attributes changed. */
  public override SetFormatAttr(item: SfxPoolItem): boolean {
    const affected = item.Which() === RES_PARATR_NUMRULE;
    if (affected) GetNumRuleForParagraphStyle(this)?.RemoveParagraphStyle(this);
    const changed = super.SetFormatAttr(item);
    if (affected) GetNumRuleForParagraphStyle(this)?.AddParagraphStyle(this);
    return changed;
  }
  /** Native set overload checks direct SET state before transferring numbering registration. @param set - Incoming item set. @returns Whether base attributes changed. */
  public override SetFormatAttrSet(set: SfxItemSet): boolean {
    const affected = set.GetItemState(RES_PARATR_NUMRULE, false) === SfxItemState.SET;
    if (affected) GetNumRuleForParagraphStyle(this)?.RemoveParagraphStyle(this);
    const changed = super.SetFormatAttrSet(set);
    if (affected) GetNumRuleForParagraphStyle(this)?.AddParagraphStyle(this);
    return changed;
  }
  /** Native reset unregisters the direct rule when the supplied inclusive range covers its identity; inherited rules are not registered. @param which - First identity. @param last - Optional inclusive last identity. @returns Whether attributes changed. */
  public override ResetFormatAttr(which: number, last = 0): boolean {
    const affected =
      last !== 0 && last > which
        ? which <= RES_PARATR_NUMRULE && RES_PARATR_NUMRULE <= last
        : which === RES_PARATR_NUMRULE;
    if (affected) GetNumRuleForParagraphStyle(this)?.RemoveParagraphStyle(this);
    return super.ResetFormatAttr(which, last);
  }

  /** Returns the outline rule's zero-based level. @returns Attribute value minus one. */
  public GetAssignedOutlineStyleLevel(): number {
    return this.GetAttrOutlineLevel() - 1;
  }

  /** Removes outline assignment and its direct attribute. @returns Nothing. */
  public DeleteAssignmentToListLevelOfOutlineStyle(): void {
    this.mbAssignedToOutlineStyle = false;
    this.ResetFormatAttr(RES_PARATR_OUTLINELEVEL);
  }

  /** Reads the style's numbering item. @param inParent - Whether parent styles participate. @returns Rule item. */
  public GetNumRule(inParent = true): SwNumRuleItem {
    return this.GetAttrSet().Get(RES_PARATR_NUMRULE, inParent) as SwNumRuleItem;
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

/** Source TextFormatCollFunc::GetNumRule resolves only an explicit nonempty numbering item through its owning document. @param collection - Paragraph style. @returns Existing native numbering rule. */
function GetNumRuleForParagraphStyle(collection: SwTextFormatColl): SwNumRule | undefined {
  const item = collection.GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false) as
    SwNumRuleItem | undefined;
  return item !== undefined && item.GetValue().length !== 0
    ? collection.GetDoc().FindNumRulePtr(item.GetValue())
    : undefined;
}

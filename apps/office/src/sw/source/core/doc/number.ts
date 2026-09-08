/**
 * @fileoverview Calculates browser-visible Writer list markers at the `sw/source/core/doc/number.cxx` ownership boundary without changing editable paragraph text.
 */

import type { WriterParagraphList, WriterParagraphListKind } from "./list";

/** Internal rule name used by the bounded default-bullet command. */
export const DEFAULT_BULLET_RULE_NAME = "__WriterDefaultBullet";

/** Internal rule name used by the bounded default-numbering command. */
export const DEFAULT_NUMBERING_RULE_NAME = "__WriterDefaultNumbering";

/** Persisted definition of one bounded Writer numbering rule. */
export interface SwNumRuleSnapshot {
  /** Browser-supported marker family. */
  readonly kind: Exclude<WriterParagraphListKind, "none">;
  /** Default list identity used when the rule is applied. */
  readonly listId: string;
  /** Document-unique rule name referenced by SwNumRuleItem. */
  readonly name: string;
}

/** Document-owned numbering rule referenced by paragraph item sets. */
export class SwNumRule {
  /** Creates one bounded numbering rule. @param name - Document-unique rule name. @param kind - Bullet or numbering marker family. @param defaultListId - Default list identity. @returns Nothing. */
  public constructor(
    private readonly name: string,
    private readonly kind: Exclude<WriterParagraphListKind, "none">,
    private readonly defaultListId = name,
  ) {
    if (name.trim().length === 0 || defaultListId.trim().length === 0)
      throw new Error("SwNumRule name and list id must not be blank.");
    if (kind !== "bullet" && kind !== "numbered")
      throw new Error("SwNumRule kind must be bullet or numbered.");
  }

  /** Returns the document-unique rule name. @returns Rule name. */
  public GetName(): string {
    return this.name;
  }

  /** Returns the browser-supported marker family. @returns Bullet or numbered kind. */
  public GetKind(): Exclude<WriterParagraphListKind, "none"> {
    return this.kind;
  }

  /** Returns the default list identity. @returns List identity. */
  public GetDefaultListId(): string {
    return this.defaultListId;
  }

  /** Creates an independent numbering rule. @returns Cloned rule. */
  public clone(): SwNumRule {
    return new SwNumRule(this.name, this.kind, this.defaultListId);
  }

  /** Creates a persisted numbering-rule record. @returns Rule snapshot. */
  public toSnapshot(): SwNumRuleSnapshot {
    return { kind: this.kind, listId: this.defaultListId, name: this.name };
  }

  /** Restores a validated bounded numbering rule. @param snapshot - Persisted rule definition. @returns Restored rule. */
  public static fromSnapshot(snapshot: SwNumRuleSnapshot): SwNumRule {
    if (snapshot.kind !== "bullet" && snapshot.kind !== "numbered")
      throw new Error("Stored SwNumRule kind is invalid.");
    return new SwNumRule(snapshot.name, snapshot.kind, snapshot.listId);
  }
}

/** Describes the list subset of a Writer paragraph needed for deterministic marker calculation. */
export interface WriterNumberingParagraph {
  /** Stable paragraph identity used to locate a marker request. */
  readonly id: string;
  /** Serializable list state applied to the paragraph. */
  readonly list: WriterParagraphList;
}

/**
 * Produces the visible marker for one current Writer paragraph without changing its plain editable text.
 *
 * @param paragraphs - Ordered list-capable Writer paragraphs rendered in the browser document body.
 * @param paragraphId - Stable identity of the paragraph whose marker is requested.
 * @returns A bullet, one-based numbering marker, or undefined when the paragraph is not a list item.
 */
export function getWriterParagraphListMarker(
  paragraphs: readonly WriterNumberingParagraph[],
  paragraphId: string,
): string | undefined {
  const paragraphIndex = paragraphs.findIndex(
    /** Finds the numbered paragraph owning paragraphId. @param paragraph - Current list-capable paragraph. @returns True only for the requested identity. */
    function hasParagraphId(paragraph): boolean {
      return paragraph.id === paragraphId;
    },
  );
  const paragraph = paragraphs[paragraphIndex];
  if (paragraph === undefined || paragraph.list.kind === "none") return undefined;
  if (paragraph.list.kind === "bullet") return "•";
  let itemNumber = 1;
  for (let index = paragraphIndex - 1; index >= 0; index -= 1) {
    const previousParagraph = paragraphs[index] as WriterNumberingParagraph;
    if (
      previousParagraph.list.kind !== "numbered" ||
      previousParagraph.list.level !== paragraph.list.level
    )
      break;
    itemNumber += 1;
  }
  return `${itemNumber}.`;
}

/** @fileoverview Implements the native internet text-attribute construction boundary from pinned sw/source/core/txtnode/txtatr2.cxx. */
import {
  UpdateAttrHint,
  SwUpdateAttr,
  type SwFormatChangeHint,
  type AttrSetChangeHint,
  type ObjectDyingHint,
} from "../../../inc/hints";
import type { LegacyModifyHint } from "../../../inc/calbck";
import {
  RES_UPDATEATTR_FMT_CHG,
  RES_UPDATEATTR_ATTRSET_CHG,
  RES_UPDATEATTR_OBJECTDYING,
} from "../../../inc/hintids";
import type { SwTextNode } from "./ndtxt";
import { SwFormatCharFormat, SwFormatINetFormat } from "./fmtatr2";
import { SwTextAttrEnd, SwTextAttrNesting } from "./txatbase";

/** Concrete native internet attribute with locked nesting defaults and an item backlink. */
export class SwTextINetFormat extends SwTextAttrNesting<SwFormatINetFormat> {
  private m_pTextNode: SwTextNode | undefined;

  /** Returns the optional owning text node. @returns Native nullable node backlink. */
  public GetpTextNode(): SwTextNode | undefined {
    return this.m_pTextNode;
  }

  /** Requires the bound text node, matching the native assertion contract. @returns Owning text node. */
  public GetTextNode(): SwTextNode {
    if (this.m_pTextNode === undefined) throw new Error("Internet attribute has no text node.");
    return this.m_pTextNode;
  }

  /** Changes the native node backlink. @param node - New owner or detached state. @returns Nothing. */
  public ChgTextNode(node: SwTextNode | undefined): void {
    this.m_pTextNode = node;
  }

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

/** Native character-style text attribute, distinct from automatic formatting and nesting links. */
export class SwTextCharFormat extends SwTextAttrEnd<SwFormatCharFormat> {
  private m_pTextNode: SwTextNode | undefined;
  private m_nSortNumber = 0;
  /** Creates native source flags and backlink. @param format - Owned item. @param start - Inclusive offset. @param end - Exclusive offset. @returns Attribute. */
  constructor(format: SwFormatCharFormat, start: number, end: number) {
    super(format, start, end);
    format.m_pTextAttribute = this;
    this.SetCharFormatAttr(true);
  }
  /** Changes the owning text-node backlink. @param node - Owner or detached state. @returns Nothing. */
  ChgTextNode(node: SwTextNode | undefined): void {
    this.m_pTextNode = node;
  }
  /** Returns the nullable original node. @returns Owner if bound. */
  GetpTextNode(): SwTextNode | undefined {
    return this.m_pTextNode;
  }
  /** Returns the original order among same-boundary character formats. @returns Unsigned16 sort number. */
  GetSortNumber(): number {
    return this.m_nSortNumber;
  }
  /** Writes the native unsigned16 sort number. @param value - New order. @returns Nothing. */
  SetSortNumber(value: number): void {
    this.m_nSortNumber = value & 0xffff;
  }
  /** Converts the source style notification into the original range-update value. @param hint - Original represented format hint. @returns Nothing. */
  TriggerNodeUpdate(
    hint: SwFormatChangeHint | AttrSetChangeHint | ObjectDyingHint | LegacyModifyHint,
  ): void {
    if (this.m_pTextNode === undefined) return;
    const which =
      hint.kind === "format-change"
        ? RES_UPDATEATTR_FMT_CHG
        : hint.kind === "attr-set-change"
          ? RES_UPDATEATTR_ATTRSET_CHG
          : hint.kind === "object-dying"
            ? RES_UPDATEATTR_OBJECTDYING
            : hint.GetWhich();
    const update = new SwUpdateAttr(this.GetStart(), this.GetEnd(), which);
    this.m_pTextNode.TriggerNodeUpdate(new UpdateAttrHint(update, update));
  }
  /** Retains concrete identity and sort number for the existing snapshot boundary. @param format - Copied item. @param start - Start. @param end - End. @returns Detached attribute. */
  protected override createRangeClone(
    format: SwFormatCharFormat,
    start: number,
    end: number,
  ): SwTextCharFormat {
    const clone = new SwTextCharFormat(format, start, end);
    clone.SetSortNumber(this.GetSortNumber());
    return clone;
  }
}

/** @fileoverview Implements the native internet text-attribute construction boundary from pinned sw/source/core/txtnode/txtatr2.cxx. */
import type { SwTextNode } from "./ndtxt";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextAttrNesting } from "./txatbase";

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

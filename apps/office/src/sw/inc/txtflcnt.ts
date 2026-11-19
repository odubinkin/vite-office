/** @fileoverview Native point text hint for line-bound Writer fly formats. */
import { RndStdIds } from "../../svx/inc/swframetypes";
import { SwPosition } from "../source/core/crsr/pam";
import type { SwTextNode } from "../source/core/txtnode/ndtxt";
import { SwTextAttr } from "../source/core/txtnode/txatbase";
import { SwFormatAnchor } from "./fmtanchr";
import type { SwFormatFlyCnt } from "./fmtflcnt";
import { RES_TXTATR_FLYCNT } from "./hintids";

/** The real fly-content hint owns a dummy-character position with no end. */
export class SwTextFlyCnt extends SwTextAttr<SwFormatFlyCnt> {
  /** Sets the item backlink and the source dummy-character flag. @param format - Owned non-shareable item. @param start - Native UTF-16 offset. @returns Point text hint. */
  constructor(format: SwFormatFlyCnt, start: number) {
    super(format, start);
    format.SetTextFlyCnt(this);
    this.SetHasDummyChar(true);
  }

  /** Returns the native point-hint identity. @returns WhichId. */
  override Which(): typeof RES_TXTATR_FLYCNT {
    return RES_TXTATR_FLYCNT;
  }

  /** Writes the as-character anchor back to its format for a same-document insertion or move. @param node - Text node holding the dummy character. @returns Nothing. */
  SetAnchor(node: SwTextNode): void {
    const format = this.GetAttr().GetFrameFormat();
    if (!format || format.GetDoc() !== node.GetDoc())
      throw new Error("Writer fly anchor requires a format in the destination document.");
    const position = new SwPosition(node, this.GetStart());
    const anchor = new SwFormatAnchor(format.GetAnchor());
    try {
      anchor.SetType(RndStdIds.FLY_AS_CHAR);
      anchor.SetAnchor(position);
      format.SetFormatAttr(anchor);
    } finally {
      anchor.Dispose();
      position.Dispose();
    }
  }
}

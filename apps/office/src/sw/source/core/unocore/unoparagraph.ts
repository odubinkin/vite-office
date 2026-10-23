/** @fileoverview SwXParagraph range identity from pinned unoparagraph.cxx; text and attributes stay on its actual SwTextNode. */
import { SwXTextRange, type SwXTextOwner } from "./unoobj2";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
/** Paragraph API ranges reflect the complete current paragraph instead of retaining a stale terminal offset. */
export class SwXParagraph extends SwXTextRange {
  /** Binds the represented native owner and its declared inputs. @param node - Canonical text node. @param parent - Borrowed parent text owner. @returns Nothing. */
  constructor(
    private readonly node: SwTextNode,
    parent: SwXTextOwner,
  ) {
    const point = new SwPosition(node, node.Len()),
      mark = new SwPosition(node, 0),
      range = new SwPaM(point, mark);
    super(range, parent, false);
    range.Dispose();
    point.Dispose();
    mark.Dispose();
  }
  /** Borrows current canonical range positions. @returns The represented native operation result. */
  override GetPaM(): SwPaM {
    const p = super.GetPaM();
    p.GetPoint().Assign(this.node, this.node.Len());
    p.SetMark();
    p.GetMark().Assign(this.node, 0);
    return p;
  }
}

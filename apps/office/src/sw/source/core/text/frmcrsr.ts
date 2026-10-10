/** @fileoverview Native text-frame margin movement from frmcrsr.cxx. */
import type { SwPaM } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwTextFrame } from "./txtfrm";
import { SwTextSizeInfo } from "./inftxt";
import { SwTextCursor } from "./itrtxt";

/** Moves the actual native point through formatted frame lines. @param frame - Current master/follow frame. @param pam - Actual native cursor. @param left - Beginning direction. @param api - API includes trailing spaces. @returns Native admission result. */
export function MoveTextFrameMargin(
  frame: SwTextFrame,
  pam: SwPaM,
  left: boolean,
  api = false,
): boolean {
  if (frame.GetPara() === undefined) return false;
  const point = pam.GetPoint(),
    node = point.GetNode() as SwTextNode,
    iterator = new SwTextCursor(frame, new SwTextSizeInfo(frame)),
    line = iterator.CharCursorToLine(point.GetContentIndex());
  let offset = left ? iterator.GetStart() : iterator.GetEnd();
  if (!left) {
    if (line.GetLen() > 0 && node.GetText()[offset - 1] === "\n") offset--;
    else if (!api && (iterator.GetNext() || frame.end < node.Len()))
      while (offset > iterator.GetStart() && node.GetText()[offset - 1] === " ") offset--;
  }
  point.Assign(node, offset);
  SwTextCursor.SetRightMargin(!left && !api);
  return true;
}

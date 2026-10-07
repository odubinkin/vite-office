/** @fileoverview Native text-frame margin movement from frmcrsr.cxx. */
import type { SwPaM } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwTextFrame, SwTextLine } from "./txtfrm";
import { SwTextCursor } from "./itrtxt";

/** Moves the actual native point through formatted frame lines. @param frame - Current master/follow frame. @param lines - Device-shaped frame lines. @param pam - Actual native cursor. @param left - Beginning direction. @param api - API includes trailing spaces. @returns Native admission result. */
export function MoveTextFrameMargin(
  frame: SwTextFrame,
  lines: readonly SwTextLine[],
  pam: SwPaM,
  left: boolean,
  api = false,
): boolean {
  const point = pam.GetPoint(),
    node = point.GetNode() as SwTextNode,
    iterator = new SwTextCursor(lines, node.GetText()),
    line = iterator.CharCursorToLine(point.GetContentIndex());
  if (line === undefined) return false;
  let offset = left ? line.start : line.end;
  if (!left) {
    if (line.end > line.start && node.GetText()[offset - 1] === "\n") offset--;
    else if (!api && (iterator.GetNext() || frame.end < node.Len()))
      while (offset > line.start && node.GetText()[offset - 1] === " ") offset--;
  }
  point.Assign(node, offset);
  SwTextCursor.SetRightMargin(!left && !api);
  return true;
}

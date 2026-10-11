/** @fileoverview Native text-frame margin movement from frmcrsr.cxx. */
import type { SwPaM, SwPosition } from "../crsr/pam";
import type { SwTextFrame } from "./txtfrm";
import { SwTextSizeInfo } from "./inftxt";
import { SwTextCursor } from "./itrtxt";

/** Resolves source no-scroll adjacency over already device-formatted unmerged frames. Native formatting/re-entrant stabilization and forced scrolling remain unrepresented. @param frame - Original frame. @param position - Actual model position. @param rightMargin - Native preceding-frame affinity. @returns Original adjacent frame or source lost-master fallback. */
export function GetAdjFrameAtPos(
  frame: SwTextFrame,
  position: SwPosition,
  rightMargin: boolean,
): SwTextFrame {
  const offset = frame.MapModelToViewPos(position);
  let current = frame;
  let atPosition: SwTextFrame | undefined =
    frame.GetFollow() !== undefined ? frame.GetFrameAtPos(position) : frame;
  while (current !== atPosition) {
    current = atPosition;
    atPosition = current.GetFrameAtPos(position);
  }
  if (offset !== 0 && rightMargin) {
    while (atPosition !== undefined) {
      const mapped = atPosition.MapViewToModelPos(atPosition.GetOffset());
      let same: boolean;
      try {
        same =
          mapped.GetNode() === position.GetNode() &&
          mapped.GetContentIndex() === position.GetContentIndex();
      } finally {
        mapped.Dispose();
      }
      if (!same || !atPosition.IsFollow()) break;
      atPosition = atPosition.FindMaster();
    }
  }
  return atPosition ?? current;
}

/** Moves the actual native point through formatted frame lines. @param frame - Current master/follow frame. @param pam - Actual native cursor. @param left - Beginning direction. @param api - API includes trailing spaces. @returns Native admission result. */
export function MoveTextFrameMargin(
  frame: SwTextFrame,
  pam: SwPaM,
  left: boolean,
  api = false,
): boolean {
  frame = GetAdjFrameAtPos(frame, pam.GetPoint(), SwTextCursor.IsRightMargin());
  if (frame.GetPara() === undefined) return false;
  const point = pam.GetPoint(),
    node = frame.GetTextNodeFirst(),
    iterator = new SwTextCursor(frame, new SwTextSizeInfo(frame)),
    line = iterator.CharCursorToLine(frame.MapModelToViewPos(point));
  let offset = left ? iterator.GetStart() : iterator.GetEnd();
  if (!left) {
    if (line.GetLen() > 0 && node.GetText()[offset - 1] === "\n") offset--;
    else if (!api && (iterator.GetNext() || frame.GetFollow()))
      while (offset > iterator.GetStart() && node.GetText()[offset - 1] === " ") offset--;
  }
  const mapped = frame.MapViewToModelPos(offset);
  try {
    point.Assign(mapped.GetNode(), mapped.GetContentIndex());
  } finally {
    mapped.Dispose();
  }
  SwTextCursor.SetRightMargin(!left && !api);
  return true;
}

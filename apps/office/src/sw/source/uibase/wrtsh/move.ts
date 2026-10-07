/** @fileoverview Native shell movement lifecycle from move.cxx. */
import type { SwWrtShell } from "./wrtsh1";

/** Applies supported ShellMoveCursor selection/stack lifecycle before native margin movement. @param shell - Persistent editing shell. @param left - Beginning direction. @param select - Extend current mark. @param basic - API basic call for right margin. @returns Native movement admission. */
export function MoveShellMargin(
  shell: SwWrtShell,
  left: boolean,
  select: boolean,
  basic: boolean,
): boolean {
  shell.ResetCursorStack();
  if (!select) shell.EnterStdMode();
  else if (!shell.getShellCursor().HasMark()) shell.getShellCursor().SetMark();
  return shell.LRMargin(left, !left && basic);
}

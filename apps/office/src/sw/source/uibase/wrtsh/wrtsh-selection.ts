/** @fileoverview Implements represented text/table/NumberList GetSelectionType from native wrtsh1.cxx. */
import type { SwWrtShell } from "./wrtsh1";
import { SelectionType } from "../inc/wrtsh";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SwCursor, SwTableCursor } from "../../core/crsr/swcrsr";
import type { SwPosition } from "../../core/crsr/pam";
import { SwTableBoxStartNode, type SwTableNode } from "../../core/docnode/node";

/** Resolves actual selected-box or point table context for native shell queries. @param shell - Current display cursor owner. @returns Current native table. */
export function IsCursorInTable(
  shell: Pick<SwWrtShell, "getShellCursor">,
): SwTableNode | undefined {
  const cursor = shell.getShellCursor(),
    node =
      (cursor instanceof SwTableCursor
        ? cursor.GetSelectedBoxes()[0]?.GetStartNode()
        : undefined) ?? cursor.GetPoint().GetNode(),
    section = node instanceof SwTableBoxStartNode ? node : node.StartOfSectionNode();
  return section instanceof SwTableBoxStartNode
    ? (section.StartOfSectionNode() as SwTableNode)
    : undefined;
}

/** Recognizes the represented native cross-cell table-mode condition. @param point - Moving position. @param mark - Optional fixed position. @returns Whether distinct sections share one table. */
export function IsTableSelection(point: SwPosition, mark?: SwPosition): boolean {
  const section = point.GetNode().StartOfSectionNode(),
    other = mark?.GetNode().StartOfSectionNode();
  return (
    section instanceof SwTableBoxStartNode &&
    other instanceof SwTableBoxStartNode &&
    section !== other &&
    section.StartOfSectionNode() === other.StartOfSectionNode()
  );
}

/** Restricts a table-mode hit in a repeated headline as native UpdateCursor does. @param shell - Actual cursor owner. @param point - Moving hit. @param mark - Fixed hit. @returns Whether cursor changed. */
export function RejectRepeatedHeadlineSelection(
  shell: SwWrtShell,
  point: SwPosition,
  mark: SwPosition,
): boolean {
  if (!shell.HasBoxSelection()) return shell.SetPaM(mark);
  const cursor = new SwCursor(shell.getShellCursor().GetMark());
  try {
    cursor.SetMark();
    cursor.MoveSection(point.compare(mark) < 0);
    return shell.SetPaM(cursor.GetPoint(), cursor.GetMark());
  } finally {
    cursor.Dispose();
  }
}
/** Reads actual point list context and represented native text/table flags. @param shell - Existing cursor/table owner. @returns Native represented flags; draw/fly/row-col subtypes remain unrepresented. */
export function GetSelectionType(
  shell: Pick<SwWrtShell, "GetCursor" | "IsCursorInTable" | "HasBoxSelection">,
): SelectionType {
  const node = shell.GetCursor().GetPoint().GetNode();
  let type = node instanceof SwTextNode ? SelectionType.Text : SelectionType.NONE;
  if (shell.IsCursorInTable() !== undefined) type |= SelectionType.Table;
  if (shell.HasBoxSelection()) type |= SelectionType.Table | SelectionType.TableCell;
  if (node instanceof SwTextNode) {
    const rule = node.GetNumRule();
    if (rule !== undefined && node.IsInList()) {
      const level = Math.max(0, Math.min(WRITER_MAX_LIST_LEVEL, node.GetActualListLevel()));
      if (rule.Get(level).GetNumberingType() !== SvxNumType.SVX_NUM_NUMBER_NONE)
        type |= SelectionType.NumberList;
    }
  }
  return type;
}

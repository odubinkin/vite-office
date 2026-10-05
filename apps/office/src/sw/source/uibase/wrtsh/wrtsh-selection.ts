/** @fileoverview Implements represented text/table/NumberList GetSelectionType from native wrtsh1.cxx. */
import type { SwWrtShell } from "./wrtsh1";
import { SelectionType } from "../inc/wrtsh";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
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

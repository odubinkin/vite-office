/** @fileoverview Native frame-name allocation from doclay.cxx over the actual special-format collection. The current English resource binding matches existing table/style naming; other native fly-name families remain unported. */
import type { SwDoc } from "./doc";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import type { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SwPosition } from "../crsr/pam";
import type { SwFrameFormat } from "../layout/atrfrm";
import {
  RES_ANCHOR,
  RES_CNTNT,
  RES_FRAMEDIR,
  RES_FLYFRMFMT,
  RES_FRM_SIZE,
} from "../../../inc/hintids";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { SwNodeRange } from "../../../inc/ndindex";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { SwFormatContent } from "../../../inc/fmtcntnt";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SfxItemState, type SfxItemSet } from "../../../../svl/source/items/itemset";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { DateTimeToOUString } from "../../../../tools/source/datetime/datetimeutils";

const DEF_FLY_WIDTH = 2268;
/** Original frame branch of lcl_GetUniqueFlyName, including actual mail-merge state and first unused sorted numeric suffix. @param document - Actual document owner. @returns Original unique frame name in the current English resource environment. */
export function GetUniqueFrameName(document: SwDoc): string {
  const formats = document.GetSpzFrameFormats();
  if (document.IsInMailMerge())
    return (
      "MailMergeFly" +
      DateTimeToOUString(new DateTime(DateTime.SYSTEM)) +
      String(formats.size() + 1)
    );
  const name = "Frame",
    used: number[] = [];
  for (const format of formats) {
    if (format.Which() !== RES_FLYFRMFMT) continue;
    if (format.GetName().startsWith(name)) {
      const number = toInt32(format.GetName().slice(name.length)) - 1;
      if (number >= 0) used.push(number);
    }
  }
  used.sort(
    /** Original unsigned integer ordering. @param first - First source number. @param second - Second source number. @returns Numeric order. */ (
      first,
      second,
    ) => first - second,
  );
  const numbers = [...new Set(used)];
  let number = numbers.length;
  for (let index = 0; index < numbers.length; index++)
    if (numbers[index] !== index) {
      number = index;
      break;
    }
  return name + String(number + 1);
}

/** Creates the original text fly section for the HTML import caller with an actual anchor and item set. @param doc - Actual document. @param type - Requested native anchor. @param position - Actual tracked anchor. @param items - Borrowed native frame attributes. @returns Registered native fly format. */
export function MakeFlySection(
  doc: SwDoc,
  type: RndStdIds,
  position: SwPosition,
  items: SfxItemSet,
) {
  const parent = doc.getIDocumentStylePoolAccess().GetFrameFormatFromPool(SwPoolFormatId.FRM_FRAME);
  if (!parent) throw new Error("assert(Writer pooled Frame style)");
  const nodes = doc.GetNodes();
  const end = nodes.GetEndOfAutotext();
  const style = doc.GetDocumentSettingManager().get("HTML_MODE") ? "text-body" : "frame-contents";
  const text = nodes.MakeTextNode(end, doc.GetTextFormatColl(style));
  const format = doc.MakeFlyFrameFormat(doc.GetUniqueFrameName(), parent);
  const range = new SwNodeRange(text, end);
  try {
    nodes.SectionDown(range, SwStartNodeType.SwFlyStartNode);
  } finally {
    range.Dispose();
  }
  const content = new SwFormatContent(text.StartOfSectionNode());
  try {
    format.SetFormatAttr(content);
    if (items.GetItemState(RES_CNTNT, false) === SfxItemState.SET) {
      const flyItems = items.Clone();
      try {
        flyItems.ClearItem(RES_CNTNT);
        format.SetFormatAttrSet(flyItems);
      } finally {
        flyItems.Dispose();
      }
    } else format.SetFormatAttrSet(items);
  } finally {
    content.Dispose();
  }
  const anchor = items.GetItemIfSet(RES_ANCHOR, false);
  if (
    !(anchor instanceof SwFormatAnchor) ||
    (!anchor.GetAnchorNode() &&
      (anchor.GetAnchorId() !== RndStdIds.FLY_AT_PAGE || !anchor.GetPageNum()))
  ) {
    const next = new SwFormatAnchor(format.GetAnchor());
    try {
      if (anchor instanceof SwFormatAnchor && anchor.GetAnchorId() === RndStdIds.FLY_AT_FLY) {
        const start = position.GetNode().FindFlyStartNode();
        if (!start) throw new Error("assert(enclosing fly start)");
        const flyPosition = new SwPosition(start);
        try {
          next.SetAnchor(flyPosition);
        } finally {
          flyPosition.Dispose();
        }
      } else {
        if (
          type !== next.GetAnchorId() &&
          format.GetAttrSet().GetItemState(RES_ANCHOR) !== SfxItemState.SET
        )
          next.SetType(type);
        if (next.GetAnchorId() !== RndStdIds.FLY_AT_PAGE || !anchor || !next.GetPageNum())
          next.SetAnchor(position);
      }
      format.SetFormatAttr(next);
    } finally {
      next.Dispose();
    }
  }
  if (format.GetAttrSet().GetItemState(RES_FRM_SIZE) !== SfxItemState.SET)
    format.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, 0, DEF_FLY_WIDTH));
  return format;
}

/** Native anchor walk shared with the Word exporter. @param fly - Actual current fly or frame format. @returns First non-environment item or absent at the end of the chain. */
export function GetFlyFrameDirection(
  fly: SwFrameFormat | undefined,
): SvxFrameDirectionItem | undefined {
  while (fly !== undefined) {
    const item = fly.GetFrameDir();
    if (item.GetValue() !== SvxFrameDirection.Environment) return item;
    const anchor = fly.GetAnchor();
    fly =
      anchor.GetAnchorId() !== RndStdIds.FLY_AT_PAGE
        ? anchor.GetAnchorNode()?.GetFlyFormat()
        : undefined;
  }
  return undefined;
}

/** Original layout-first document direction with fly/page/pool fallback for the represented graph. @param document - Actual document. @param position - Actual positioned node. @returns Original direction result. */
export function GetTextDirection(document: SwDoc, position: SwPosition): SvxFrameDirection {
  const node = position.GetNode().GetTextNode();
  if (node !== null) {
    const direction = node.GetTextDirection(position);
    if (direction !== SvxFrameDirection.Unknown) return direction;
    const item =
      GetFlyFrameDirection(node.GetFlyFormat()) ?? node.FindPageDesc()?.GetMaster().GetFrameDir();
    if (item !== undefined) return item.GetValue();
  }
  return (
    document.GetAttrPool().GetUserOrPoolDefaultItem(RES_FRAMEDIR) as SvxFrameDirectionItem
  ).GetValue();
}

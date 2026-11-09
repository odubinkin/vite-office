/** @fileoverview Native MSWord text snippets, frame direction and paragraph numbering from wrtw8nds.cxx. */
/** MSWord attribute iterator text extraction; script/bidi iteration remains on its separate producer frontier. */
export class SwWW8AttrIter {
  /** Original code-unit slice, control substitutions and content-control marker removal. RES_CHRATR_CASEMAP is not represented by the current Writer item pool, so the source title-case branch is not admitted here. @param text - Original node text. @param start - Native UTF16 offset. @param length - Native UTF16 length. @returns Export snippet. */
  public GetSnippet(text: string, start: number, length: number): string {
    if (!length) return "";
    return text
      .slice(start, start + length)
      .replaceAll("\n", "\v")
      .replaceAll("\u2011", "\u001e")
      .replaceAll("\u00ad", "\u001f")
      .replaceAll("\u0001", "");
  }
}

/** Original Out_SwTextNode direction and numbering item-set preparation. The caller owns the returned set. @param node - Actual text node. @returns Native copied item set or no required copy. */
export function PrepareParagraphProperties(node: SwTextNode): SwAttrSet | undefined {
  const position = new SwPosition(node);
  let paragraphRTL: boolean;
  try {
    paragraphRTL = node.GetDoc().GetTextDirection(position) === SvxFrameDirection.Horizontal_RL_TB;
  } finally {
    position.Dispose();
  }
  const attributes = node.GetSwAttrSet();
  let set: SwAttrSet | undefined;
  const rule = node.GetNumRule();
  const numberLevel = node.IsNumbered() ? node.GetActualListLevel() : -1;
  if (numberLevel >= 0 && numberLevel < 10 && rule !== undefined) {
    const format = rule.GetNumFormat(numberLevel) ?? rule.Get(numberLevel);
    set = attributes.Clone(true) as SwAttrSet;
    const first = new SvxFirstLineIndentItem(
      set.Get(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem,
    );
    const left = new SvxTextLeftMarginItem(set.Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem);
    if (format.GetPositionAndSpaceMode() === "label-width-and-position") {
      left.SetTextLeft(SvxIndentValue.twips(left.ResolveTextLeft() + format.GetAbsLSpace()));
      if (node.IsCountedInList()) {
        const offset = paragraphRTL
          ? format.GetAbsLSpace() - format.GetFirstLineOffset()
          : GetWordFirstLineOffset(format);
        first.SetTextFirstLineOffset(
          SvxIndentValue.twips(first.ResolveTextFirstLineOffset() + offset),
        );
      }
    }
    if (!node.IsCountedInList()) set.ClearItem(RES_PARATR_NUMRULE);
    else if (set.GetItemIfSet(RES_PARATR_NUMRULE, false) === undefined) {
      set.Put(new SwNumRuleItem(rule.GetName()));
      if (format.GetPositionAndSpaceMode() === "label-alignment") {
        const indents = node.AreListLevelIndentsApplicable();
        if (indents & ListLevelIndents.FirstLine) set.Put(first);
        if (indents & ListLevelIndents.LeftMargin) set.Put(left);
      }
    }
    if (format.GetPositionAndSpaceMode() === "label-width-and-position") {
      set.Put(first);
      set.Put(left);
      const tabs = new SvxTabStopItem(set.Get(RES_PARATR_TABSTOP) as SvxTabStopItem);
      tabs.Insert(new SvxTabStop(format.GetAbsLSpace()));
      set.Put(tabs);
      MSWordExportBase.CorrectTabStopInSet(set, format.GetAbsLSpace());
    }
  }
  const direction = attributes.GetItem(RES_FRAMEDIR) as SvxFrameDirectionItem | undefined;
  if (
    (direction === undefined || direction.GetValue() === SvxFrameDirection.Environment) &&
    node.GetTextFormatColl().GetFrameDir().GetValue() === SvxFrameDirection.Environment
  ) {
    set ??= attributes.Clone(true) as SwAttrSet;
    set.Put(
      new SvxFrameDirectionItem(
        paragraphRTL ? SvxFrameDirection.Horizontal_RL_TB : SvxFrameDirection.Horizontal_LR_TB,
        RES_FRAMEDIR,
      ),
    );
    const adjust = attributes.GetItem(RES_PARATR_ADJUST) as SvxAdjustItem | undefined;
    if (adjust && (adjust.GetAdjust() === SvxAdjust.Left || adjust.GetAdjust() === SvxAdjust.Right))
      set.Put(adjust);
  }
  if (!node.IsCountedInList() && rule !== undefined) {
    set ??= attributes.Clone(true) as SwAttrSet;
    const firstItem = set.GetItemIfSet(RES_MARGIN_FIRSTLINE, true) as
      SvxFirstLineIndentItem | undefined;
    const leftItem = set.GetItemIfSet(RES_MARGIN_TEXTLEFT, true) as
      SvxTextLeftMarginItem | undefined;
    const first =
      firstItem === undefined
        ? new SvxFirstLineIndentItem(RES_MARGIN_FIRSTLINE)
        : new SvxFirstLineIndentItem(firstItem);
    const left =
      leftItem === undefined
        ? new SvxTextLeftMarginItem(SvxIndentValue.zero(), RES_MARGIN_TEXTLEFT)
        : new SvxTextLeftMarginItem(leftItem);
    const level = Math.max(0, Math.min(node.GetActualListLevel(), 9)),
      format = rule.Get(level);
    left.SetTextLeft(
      SvxIndentValue.twips(
        left.ResolveLeft(first, new SvxFontUnitMetrics()) +
          (format.GetPositionAndSpaceMode() === "label-width-and-position"
            ? format.GetAbsLSpace()
            : format.GetIndentAt()),
      ),
    );
    if (!paragraphRTL) first.SetTextFirstLineOffset(SvxIndentValue.zero());
    set.Put(first);
    set.Put(left);
    if (set.GetItemIfSet(RES_PARATR_NUMRULE, false) === undefined)
      set.Put(new SwNumRuleItem(rule.GetName()));
  }
  return set;
}
import { MsLangId } from "../../../../i18nlangtag/inc/mslangid";
import { GetFlyFrameDirection } from "../../core/doc/doclay";
import type { SwDoc } from "../../core/doc/doc";
import { SwContentNode } from "../../core/docnode/node";
import type { SwPageDesc } from "../../core/layout/pagedesc";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import { SwPosition } from "../../core/crsr/pam";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import type { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwAttrSet } from "../../core/attr/swatrset";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
  SvxIndentValue,
  SvxFontUnitMetrics,
} from "../../../../editeng/inc/lrspitem";
import { SvxTabStop, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_NUMRULE,
  RES_PARATR_ADJUST,
  RES_FRAMEDIR,
  RES_PARATR_TABSTOP,
} from "../../../inc/hintids";
import { SwNumRuleItem, ListLevelIndents } from "../../core/para/paratr";
import { GetWordFirstLineOffset } from "./wrtw8num";

import { MSWordExportBase } from "./wrtww8";

/** Original current page master direction. @param document - Actual export document. @param page - Actual current descriptor if selected. @returns Native direction. */
export function GetCurrentPageDirection(document: SwDoc, page?: SwPageDesc): SvxFrameDirection {
  return (page ?? document.GetPageDesc(0)).GetMaster().GetFrameDir().GetValue();
}

/** Original paragraph/page/style defaults. Fly-shape output context remains unrepresented. @param owner - Actual export owner. @returns Native default direction. */
export function GetDefaultFrameDirection(owner: MSWordExportBase): SvxFrameDirection {
  let direction = SvxFrameDirection.Environment;
  if (owner.m_bOutPageDescs) direction = owner.GetCurrentPageDirection();
  else if (owner.m_pOutFormatNode instanceof SwContentNode) {
    const position = new SwPosition(owner.m_pOutFormatNode);
    try {
      direction = owner.m_rDoc.GetTextDirection(position);
    } finally {
      position.Dispose();
    }
  }
  if (direction !== SvxFrameDirection.Environment) return direction;
  // The browser's application data locale comes from the existing system-language binding.
  return MsLangId.isRightToLeft(MsLangId.getConfiguredSystemLanguage())
    ? SvxFrameDirection.Horizontal_RL_TB
    : SvxFrameDirection.Horizontal_LR_TB;
}

/** Original frame item and anchor-chain query with page master fallback. @param owner - Actual export owner. @param format - Actual frame format. @returns Native direction. */
export function TrueFrameDirection(
  owner: MSWordExportBase,
  format: SwFrameFormat,
): SvxFrameDirection {
  return GetFlyFrameDirection(format)?.GetValue() ?? owner.GetCurrentPageDirection();
}

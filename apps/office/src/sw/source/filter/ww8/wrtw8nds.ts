/** @fileoverview Native MSWord text snippets and non-RTL paragraph numbering item preparation from wrtw8nds.cxx. */
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

/** Original Out_SwTextNode numbering item-set preparation for the represented non-RTL paragraph profile. Writer frame-direction/layout owners are not admitted in this slice; no synthetic direction provider is introduced. The caller owns the returned set. @param node - Actual text node. @returns Native copied item set or no required copy. */
export function PrepareParagraphNumbering(node: SwTextNode): SwAttrSet | undefined {
  let set: SwAttrSet | undefined;
  const rule = node.GetNumRule();
  const numberLevel = node.IsNumbered() ? node.GetActualListLevel() : -1;
  if (numberLevel >= 0 && numberLevel < 10 && rule !== undefined) {
    const format = rule.GetNumFormat(numberLevel) ?? rule.Get(numberLevel);
    set = node.GetSwAttrSet().Clone(true) as SwAttrSet;
    const first = new SvxFirstLineIndentItem(
      set.Get(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem,
    );
    const left = new SvxTextLeftMarginItem(set.Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem);
    if (format.GetPositionAndSpaceMode() === "label-width-and-position") {
      left.SetTextLeft(SvxIndentValue.twips(left.ResolveTextLeft() + format.GetAbsLSpace()));
      first.SetTextFirstLineOffset(
        SvxIndentValue.twips(first.ResolveTextFirstLineOffset() + GetWordFirstLineOffset(format)),
      );
    }
    if (set.GetItemIfSet(RES_PARATR_NUMRULE, false) === undefined) {
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
  if (!node.IsCountedInList() && rule !== undefined) {
    set ??= node.GetSwAttrSet().Clone(true) as SwAttrSet;
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
    first.SetTextFirstLineOffset(SvxIndentValue.zero());
    set.Put(first);
    set.Put(left);
    if (set.GetItemIfSet(RES_PARATR_NUMRULE, false) === undefined)
      set.Put(new SwNumRuleItem(rule.GetName()));
  }
  return set;
}
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
  RES_PARATR_TABSTOP,
} from "../../../inc/hintids";
import { SwNumRuleItem, ListLevelIndents } from "../../core/para/paratr";
import { GetWordFirstLineOffset } from "./wrtw8num";

import { MSWordExportBase } from "./wrtww8";

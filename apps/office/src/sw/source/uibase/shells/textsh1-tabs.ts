/** @fileoverview Native Writer paragraph-dialog input, tab stop context and typed paragraph formatting from textsh1.cxx. */
import {
  XATTR_FILLCOLOR,
  XATTR_FILLSTYLE,
  XATTR_FILLTRANSPARENCE,
  XATTR_FILLUSESLIDEBACKGROUND,
} from "../../../../svx/inc/xdef";
import { getParagraphFillItems } from "../../core/attr/paragraph-fill";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { MIN_BORDER_DIST } from "../../../inc/swtypes";
import { FN_NUMBER_NEWSTART, FN_NUMBER_NEWSTART_AT } from "../../../inc/cmdid";
import {
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags,
} from "../../../../editeng/source/items/frmitems";
import { SID_ATTR_BORDER_INNER } from "../../../../svx/inc/svxids";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { GetTabDist } from "../utlui/uitool";
import type { SwTextShell } from "./textsh1";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import { SfxUInt16Item, SfxInt32Item } from "../../../../svl/inc/intitem";
import {
  SID_ATTR_TABSTOP_DEFAULTS as D,
  SID_ATTR_TABSTOP_POS as P,
  SID_ATTR_TABSTOP_OFFSET as O,
} from "../../../../editeng/inc/editids";
import {
  RES_PARATR_TABSTOP as T,
  RES_FRAMEDIR,
  RES_BOX,
  RES_SHADOW,
  RES_PARATR_CONNECT_BORDER,
  RES_LINENUMBER,
  RES_PARATR_ADJUST,
  RES_PARATR_OUTLINELEVEL,
  RES_PARATR_NUMRULE,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_AUTOFRAMEDIR,
  RES_PARATR_SNAPTOGRID,
  RES_PARATR_HYPHENZONE,
  RES_PARATR_SCRIPTSPACE,
  RES_PARATR_HANGINGPUNCTUATION,
  RES_PARATR_FORBIDDEN_RULES,
  RES_PARATR_VERTALIGN,
  RES_LR_SPACE as L,
  RES_MARGIN_TEXTLEFT,
} from "../../../inc/hintids";
import type { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxFontUnitMetrics, type SvxTextLeftMarginItem } from "../../../../editeng/inc/lrspitem";
/** Builds the original page input over the actual document pool and uniform selection. @param shell - Actual command owner. @returns Native item set. */
export function createWriterParagraphDialogInput(shell: SwTextShell): SfxItemSet {
  const paragraph = shell.GetActiveParagraph(),
    doc = paragraph.GetDoc(),
    pool = doc.GetAttrPool();
  const set = new SfxItemSet(pool, [
    [RES_PARATR_ADJUST, RES_PARATR_ADJUST],
    [T, RES_PARATR_HYPHENZONE],
    [RES_PARATR_NUMRULE, RES_PARATR_CONNECT_BORDER],
    [RES_PARATR_OUTLINELEVEL, RES_PARATR_OUTLINELEVEL],
    [RES_PARATR_AUTOFRAMEDIR, RES_PARATR_AUTOFRAMEDIR],
    [RES_PARATR_LIST_LEVEL, RES_PARATR_LIST_LEVEL],
    [L, L],
    [RES_BOX, RES_SHADOW],
    [RES_LINENUMBER, RES_LINENUMBER],
    [RES_FRAMEDIR, RES_FRAMEDIR],
    [XATTR_FILLSTYLE, XATTR_FILLCOLOR],
    [XATTR_FILLTRANSPARENCE, XATTR_FILLTRANSPARENCE],
    [XATTR_FILLUSESLIDEBACKGROUND, XATTR_FILLUSESLIDEBACKGROUND],
    [D, O],
    [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
    [FN_NUMBER_NEWSTART, FN_NUMBER_NEWSTART_AT],
  ]);
  const tabs = shell.GetUniformParagraphItem(
    /** Borrows each real paragraph item for native equality. @param node - Selected node. @returns Tab item. */
    (node) => node.GetAttr(T) as SvxTabStopItem,
  );
  if (tabs) set.Put(tabs);
  else set.InvalidateItem(T);
  for (const which of [
    RES_PARATR_ADJUST,
    RES_PARATR_HYPHENZONE,
    RES_PARATR_OUTLINELEVEL,
    RES_PARATR_NUMRULE,
    RES_PARATR_LIST_LEVEL,
    RES_PARATR_SCRIPTSPACE,
    RES_PARATR_HANGINGPUNCTUATION,
    RES_PARATR_FORBIDDEN_RULES,
    RES_PARATR_VERTALIGN,
    RES_PARATR_SNAPTOGRID,
    RES_PARATR_AUTOFRAMEDIR,
    RES_LINENUMBER,
    RES_FRAMEDIR,
    RES_BOX,
    RES_SHADOW,
    RES_PARATR_CONNECT_BORDER,
  ]) {
    const item = shell.GetUniformParagraphItem(
      /** Reads the typed item across the selection. @param node - Selected paragraph. @returns Native item. */
      (node) => node.GetAttr(which),
    );
    if (item) set.Put(item);
    else set.InvalidateItem(which);
  }
  const fillByParagraph = new Map<SwTextNode, ReturnType<typeof getParagraphFillItems>>();
  for (const [which, field] of [
    [XATTR_FILLSTYLE, "style"],
    [XATTR_FILLCOLOR, "color"],
    [XATTR_FILLTRANSPARENCE, "transparency"],
  ] as const) {
    const item = shell.GetUniformParagraphItem(
      /** Reuses each paragraph's effective native fill values during aggregation. @param node - Selected text node. @returns One native fill item. */
      (node) => {
        let fill = fillByParagraph.get(node);
        if (!fill) {
          fill = getParagraphFillItems(node.GetSwAttrSet());
          fillByParagraph.set(node, fill);
        }
        return fill[field];
      },
    );
    if (item) set.Put(item);
    else set.InvalidateItem(which);
  }
  const borderInfo = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
  borderInfo.SetDist(true);
  borderInfo.SetMinDist(true);
  borderInfo.SetDefDist(MIN_BORDER_DIST);
  borderInfo.SetValid(SvxBoxInfoItemValidFlags.DISABLE, true);
  set.Put(borderInfo);
  if (paragraph.GetNumRule() !== undefined) {
    set.Put(new SfxBoolItem(FN_NUMBER_NEWSTART, paragraph.IsListRestart()));
    const start = paragraph.HasAttrListRestartValue()
      ? paragraph.GetAttrListRestartValue() & 0xffff
      : 0xffff;
    set.Put(new SfxUInt16Item(FN_NUMBER_NEWSTART_AT, start));
  }
  const lr = shell.GetParagraphLRSpace();
  if (lr) {
    lr.SetWhich(L);
    set.Put(lr);
  } else set.InvalidateItem(L);
  const defaults = pool.GetUserOrPoolDefaultItem(T) as SvxTabStopItem;
  set.Put(new SfxUInt16Item(D, GetTabDist(defaults) & 0xffff));
  set.Put(new SfxUInt16Item(P, 0));
  const left =
    shell.GetUniformParagraphItem(
      /** Uses the original selection state before pool-default fallback. @param node - Real selected paragraph. @returns Native left item. */
      (node) => node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem,
    ) ?? (pool.GetUserOrPoolDefaultItem(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem);
  set.Put(
    new SfxInt32Item(
      O,
      doc.GetDocumentSettingManager().get("TABS_RELATIVE_TO_INDENT")
        ? left.ResolveTextLeft(new SvxFontUnitMetrics())
        : 0,
    ),
  );
  return set;
}

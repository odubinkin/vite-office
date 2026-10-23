/** @fileoverview Native Writer paragraph-dialog tab defaults, current position and indent offset from textsh1.cxx. */
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
  RES_LR_SPACE as L,
  RES_MARGIN_TEXTLEFT,
} from "../../../inc/hintids";
import type { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxFontUnitMetrics, type SvxTextLeftMarginItem } from "../../../../editeng/inc/lrspitem";
/** Builds the original page input over the actual document pool and uniform selection. @param shell - Actual command owner. @returns Native item set. */
export function createWriterTabulatorInput(shell: SwTextShell): SfxItemSet {
  const paragraph = shell.GetActiveParagraph(),
    doc = paragraph.GetDoc(),
    pool = doc.GetAttrPool();
  const set = new SfxItemSet(pool, [
    [T, T],
    [L, L],
    [D, O],
  ]);
  const tabs = shell.GetUniformParagraphItem(
    /** Borrows each real paragraph item for native equality. @param node - Selected node. @returns Tab item. */
    (node) => node.GetAttr(T) as SvxTabStopItem,
  );
  if (tabs) set.Put(tabs);
  else set.InvalidateItem(T);
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

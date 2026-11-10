/** @fileoverview Native GetPageDescFromPool branches consumed by HTML page-break insertion, from DocumentStylePoolManager.cxx. */
import type { SwDoc } from "./doc";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { UseOnPage, type SwPageDesc } from "../layout/pagedesc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxLRSpaceItem, SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { RES_LR_SPACE, RES_UL_SPACE } from "../../../inc/hintids";

/** Current represented page-pool names; Standard retains the established browser document's canonical name. */
const names = new Map<number, string>([
  [P.PAGE_STANDARD, "Standard"],
  [P.PAGE_FIRST, "First Page"],
  [P.PAGE_LEFT, "Left Page"],
  [P.PAGE_RIGHT, "Right Page"],
  [P.PAGE_HTML, "HTML"],
]);

/** Original pool-ID lookup and pre-recursion registration, followed by consumed native defaults. Valid unrepresented page-pool branches are explicit rather than silently using another style. @param doc - Actual document. @param id - Source pool ID. @param regardLanguage - Original creation selector; frame-direction item is outside the represented core. @returns Borrowed document page. */
export function GetPageDescFromPool(doc: SwDoc, id: number, regardLanguage = true): SwPageDesc {
  for (let index = 0; index < doc.GetPageDescCnt(); ++index)
    if (doc.GetPageDesc(index).GetPoolFormatId() === id) return doc.GetPageDesc(index);
  // Native invalid-ID fallback differs from valid but unrepresented pool branches.
  if (id < 5120 || id >= 5130) id = P.PAGE_STANDARD;
  const name = names.get(id);
  if (name === undefined) throw new Error("GetPageDescFromPool: unrepresented native page pool ID");
  void regardLanguage;
  const page = doc.MakePageDesc(name);
  page.SetPoolFormatId(id as P);
  const items = new SfxItemSet(doc.GetAttrPool(), page.GetMaster().GetAttrSet().GetRanges()),
    lr = new SvxLRSpaceItem(RES_LR_SPACE),
    ul = new SvxULSpaceItem(RES_UL_SPACE);
  let setLeft = true;
  lr.SetLeft(SvxIndentValue.twips(1134));
  lr.SetRight(lr.GetLeft());
  ul.SetUpper(1134);
  ul.SetLower(1134);
  try {
    if (id !== P.PAGE_STANDARD) {
      const standard = GetPageDescFromPool(doc, P.PAGE_STANDARD),
        size = standard.GetMaster().GetFrameSize().Clone();
      try {
        if (standard.GetLandscape()) {
          const height = size.GetHeight();
          size.SetHeight(size.GetWidth());
          size.SetWidth(height);
        }
        items.Put(size);
      } finally {
        size.Dispose();
      }
    }
    if (id === P.PAGE_STANDARD) page.SetUseOn(UseOnPage.All | UseOnPage.FirstShare);
    else if (id === P.PAGE_FIRST) {
      page.SetUseOn(UseOnPage.All);
      page.SetFollow(GetPageDescFromPool(doc, P.PAGE_STANDARD));
    } else if (id === P.PAGE_LEFT || id === P.PAGE_RIGHT) {
      setLeft = false;
      page.SetUseOn(id === P.PAGE_LEFT ? UseOnPage.Left : UseOnPage.Right);
      page.SetFollow(GetPageDescFromPool(doc, id === P.PAGE_LEFT ? P.PAGE_RIGHT : P.PAGE_LEFT));
    } else {
      lr.SetRight(SvxIndentValue.twips(567));
      ul.SetUpper(567);
      ul.SetLower(567);
      page.SetUseOn(UseOnPage.All);
    }
    items.Put(lr);
    items.Put(ul);
    if (setLeft) {
      page.GetLeft().SetFormatAttrSet(items);
      page.GetFirstLeft().SetFormatAttrSet(items);
    }
    page.GetMaster().SetFormatAttrSet(items);
    page.GetFirstMaster().SetFormatAttrSet(items);
  } finally {
    items.Dispose();
    lr.Dispose();
    ul.Dispose();
  }
  return page;
}

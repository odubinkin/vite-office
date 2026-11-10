/** @fileoverview Native SwCSS1Parser page descriptor creation/following and SetFormatBreak from htmlcss1.cxx. */
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import type { SwDoc } from "../../core/doc/doc";
import { SwPageDesc } from "../../core/layout/pagedesc";
import type { SwHTMLParser } from "./swhtml";
import { SvxCSS1PageBreak as B } from "./svxcss1.enums";
import type { SvxCSS1PropertyInfo } from "./svxcss1.types";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SvxBreak } from "../../../../editeng/inc/svxenum";
import { RES_BREAK, RES_KEEP } from "../../../inc/hintids";
import type { SwCSS1Parser } from "./htmlcss1";

/** Original linear pool-ID lookup, independent of style names. @param doc - Native document. @param id - Pool identity. @returns Borrowed page or null. */
function FindPageDesc(doc: SwDoc, id: P): SwPageDesc | null {
  for (let index = 0; index < doc.GetPageDescCnt(); ++index) {
    const page = doc.GetPageDesc(index);
    if (page.GetPoolFormatId() === id) return page;
  }
  return null;
}

/** Original ContainsPageDesc-to-index change entry. @param doc - Native document. @param page - Registered target. @param changed - Native changed copy. @returns Nothing. */
function ChgPageDesc(doc: SwDoc, page: SwPageDesc, changed: SwPageDesc): void {
  const position: [number] = [0];
  if (doc.ContainsPageDesc(page, position)) doc.ChgPageDesc(position[0], changed);
}

/** Original native creation uses the pool first, then CopyPageDesc(false), then source first/left/right follow transitions. @param doc - Native owner. @param html - Actual reader. @param id - Native pool ID. @param create - Source admission flag. @returns Borrowed page or null. */
export function GetPageDesc(
  doc: SwDoc,
  html: SwHTMLParser,
  id: P,
  create: boolean,
): SwPageDesc | null {
  const pool = doc.getIDocumentStylePoolAccess();
  if (id === P.PAGE_HTML) return pool.GetPageDescFromPool(P.PAGE_HTML, false);
  let page = FindPageDesc(doc, id);
  if (!page && create) {
    if (html.IsReadingHeaderOrFooter()) return null;
    const master =
      (id === P.PAGE_FIRST ? FindPageDesc(doc, P.PAGE_RIGHT) : null) ??
      pool.GetPageDescFromPool(P.PAGE_HTML, false);
    const created = pool.GetPageDescFromPool(id, false);
    doc.CopyPageDesc(master, created, false);
    let follow: SwPageDesc | null = null,
      setFollowFollow = false;
    if (id === P.PAGE_FIRST) follow = GetPageDesc(doc, html, P.PAGE_LEFT, false) ?? master;
    else if (id === P.PAGE_RIGHT) GetPageDesc(doc, html, P.PAGE_LEFT, true);
    else if (id === P.PAGE_LEFT) {
      follow = GetPageDesc(doc, html, P.PAGE_RIGHT, true);
      setFollowFollow = true;
      const first = GetPageDesc(doc, html, P.PAGE_FIRST, false);
      if (first) {
        const changed = new SwPageDesc(first);
        try {
          changed.SetFollow(created);
          ChgPageDesc(doc, first, changed);
        } finally {
          changed.DisposeModify();
        }
      }
    }
    if (follow) {
      const changed = new SwPageDesc(created);
      try {
        changed.SetFollow(follow);
        ChgPageDesc(doc, created, changed);
      } finally {
        changed.DisposeModify();
      }
      if (setFollowFollow) {
        const changedFollow = new SwPageDesc(follow);
        try {
          changedFollow.SetFollow(created);
          ChgPageDesc(doc, follow, changedFollow);
        } finally {
          changedFollow.DisposeModify();
        }
      }
    }
    page = created;
  }
  return page;
}

/** Original switch ordering and write flags for the current core's break/bool/name-reference bindings. AUTO does not erase a break or page pointer set by the preceding BEFORE switch. @param parser - Actual CSS owner. @param items - Actual target set. @param info - Native parsed pending state. @returns Source bSetBreak, not whether any attribute was written. */
export function SetFormatBreak(
  parser: SwCSS1Parser,
  items: SfxItemSet,
  info: SvxCSS1PropertyInfo,
): boolean {
  let value = SvxBreak.NONE,
    keep = false,
    setKeep = false,
    setBreak = false,
    setPageDesc = false;
  let page: SwPageDesc | null = null;
  switch (info.m_ePageBreakBefore) {
    case B.ALWAYS:
      value = SvxBreak.PageBefore;
      setBreak = true;
      break;
    case B.LEFT:
      page = parser.GetLeftPageDesc(true);
      setPageDesc = true;
      break;
    case B.RIGHT:
      page = parser.GetRightPageDesc(true);
      setPageDesc = true;
      break;
    case B.AUTO:
      setBreak = setPageDesc = true;
      break;
  }
  switch (info.m_ePageBreakAfter) {
    case B.ALWAYS:
    case B.LEFT:
    case B.RIGHT:
      value = SvxBreak.PageAfter;
      setBreak = true;
      break;
    case B.AUTO:
      setBreak = setKeep = setPageDesc = true;
      break;
    case B.AVOID:
      keep = setKeep = true;
      break;
  }
  const put =
    /** Copies then destroys an original temporary at the native item boundary. @param item - Actual temporary. @returns Nothing. */
    (item: SfxInt16Item | SfxBoolItem | SwFormatPageDesc): void => {
      try {
        items.Put(item);
      } finally {
        item.Dispose();
      }
    };
  if (setBreak) put(new SfxInt16Item(RES_BREAK, value));
  if (setPageDesc) put(new SwFormatPageDesc(page?.GetName() ?? ""));
  if (setKeep) put(new SfxBoolItem(RES_KEEP, keep));
  return setBreak;
}

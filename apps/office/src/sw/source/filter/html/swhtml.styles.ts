/** @fileoverview Original SetTextCollAttrs style cascade from swhtml.cxx over actual built-in collections, item sets and deferred paragraph attributes. */
import type { SwHTMLParser } from "./swhtml";
import type { HTMLAttrContext } from "./htmlctxt";
import { SwPoolFormatId as P, WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { setTextFormatCollAtNode } from "../../core/doc/docfmt";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
  SvxRightMarginItem,
  SvxIndentValue,
} from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import * as H from "../../../inc/hintids";
import { NewAttr, type HTMLAttrHead } from "./swhtml.attr";
import { InsertParaAttrs } from "./htmlcss1.attr";
/** Resolves genuine pool metadata on the existing document owner. Class-specific style derivation is a separate CSS consumer, not an alternate style table here. @param parser - Actual reader. @param pool - Native ID. @returns Actual document collection. */
function collection(parser: SwHTMLParser, pool: number): SwTextFormatColl {
  const entry = WRITER_PARAGRAPH_STYLE_POOL.find(
    /** Finds the original pool identity. @param value - Metadata. @returns Match. */ (value) =>
      value.poolId === pool,
  );
  if (!entry) throw new Error("HTML paragraph pool identity is not represented.");
  return parser.m_xDoc.GetTextFormatColl(entry.id);
}
/** Original table-default substitution for an ordinary P context. @param pool - Requested collection. @param fallback - Nearest default collection. @returns Selected collection. */
function substitute(pool: number, fallback: number): number {
  const id = WRITER_PARAGRAPH_STYLE_POOL.find(
    /** Resolves native metadata. @param value - Pool entry. @returns Match. */ (value) =>
      value.poolId === fallback,
  )?.id;
  return pool === P.COLL_TEXT && (id === "table-contents" || id === "table-heading")
    ? fallback
    : pool;
}
/** Original nested-style hard attribution, PRE admission, definition-list margin arithmetic and deferred application. Target insertion character snapshots and generated CSS classes remain separate consumers. @param parser - Actual reader. @param top - Optional newly opened context. @returns Nothing. */
export function SetTextCollAttrs(parser: SwHTMLParser, top?: HTMLAttrContext): void {
  let selected: SwTextFormatColl | undefined, hard: SfxItemSet | undefined;
  let fallback = P.COLL_TEXT as number,
    inPRE = false;
  const left: [number] = [0],
    right: [number] = [0],
    indent: [number] = [0];
  const merge =
    /** Copies original direct/effective sets in native constructor-versus-Set order. @param style - Prior collection. @returns Nothing. */ (
      style: SwTextFormatColl,
    ): void => {
      const original = style.GetAttrSet();
      if (!hard) hard = original.Clone();
      else {
        const copy = new SfxItemSet(original.GetPool(), original.GetRanges());
        try {
          copy.Set(original);
          hard.PutSet(copy);
        } finally {
          copy.Dispose();
        }
      }
    };
  try {
    for (const context of parser.m_aContexts) {
      let pool = context.GetTextFormatColl();
      if (pool !== P.ZERO) {
        let apply = true;
        if (pool === P.COLL_HTML_PRE) inPRE = true;
        else if (pool === P.COLL_TEXT) pool = substitute(pool, fallback);
        else if (pool !== P.COLL_HTML_HR && inPRE) apply = false;
        const next = collection(parser, pool);
        if (apply) {
          if (selected) {
            merge(selected);
            hard?.Differentiate(next.GetAttrSet());
          }
          selected = next;
        } else merge(next);
      } else if (context.GetDefaultTextFormatColl() !== P.ZERO)
        fallback = context.GetDefaultTextFormatColl();
      if (context.IsLRSpaceChanged()) context.GetMargins(left, right, indent);
    }
    if (top?.GetTextFormatColl()) {
      const pool = substitute(top.GetTextFormatColl(), fallback),
        set = collection(parser, pool).GetAttrSet();
      if (
        set.GetItemIfSet(H.RES_MARGIN_FIRSTLINE) ||
        set.GetItemIfSet(H.RES_MARGIN_TEXTLEFT) ||
        set.GetItemIfSet(H.RES_MARGIN_RIGHT)
      ) {
        let extraLeft = (set.Get(H.RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
          extraRight = (set.Get(H.RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight();
        indent[0] = (
          set.Get(H.RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
        ).ResolveTextFirstLineOffset();
        if (pool === P.COLL_HTML_DD) {
          const term = collection(parser, P.COLL_HTML_DT).GetAttrSet();
          extraLeft -= (term.Get(H.RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft();
          extraRight -= (term.Get(H.RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight();
        } else if (pool === P.COLL_HTML_DT) extraLeft = extraRight = 0;
        left[0] = (left[0] + (extraLeft & 0xffff)) & 0xffff;
        right[0] = (right[0] + (extraRight & 0xffff)) & 0xffff;
        top.SetMargins(left[0], right[0], indent[0]);
      }
      const spacing = set.GetItemIfSet(H.RES_UL_SPACE);
      if (spacing instanceof SvxULSpaceItem) top.SetULSpace(spacing.GetUpper(), spacing.GetLower());
    }
    if (!selected) {
      selected = collection(parser, fallback);
      const set = selected.GetAttrSet();
      if (!left[0])
        left[0] =
          (set.Get(H.RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft() & 0xffff;
      if (!right[0])
        right[0] = (set.Get(H.RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight() & 0xffff;
      if (!indent[0])
        indent[0] = (
          set.Get(H.RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
        ).ResolveTextFirstLineOffset();
    }
    for (const attr of parser.m_aParaAttrs) attr.Invalidate();
    parser.m_aParaAttrs.length = 0;
    setTextFormatCollAtNode(parser["GetTextNode"](), selected, false);
    const set = selected.GetAttrSet(),
      first = set.Get(H.RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem,
      leftItem = set.Get(H.RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem,
      rightItem = set.Get(H.RES_MARGIN_RIGHT) as SvxRightMarginItem;
    if (
      left[0] !== leftItem.ResolveTextLeft() ||
      right[0] !== rightItem.ResolveRight() ||
      indent[0] !== first.ResolveTextFirstLineOffset()
    ) {
      const firstCopy = first.Clone(),
        leftCopy = leftItem.Clone(),
        rightCopy = rightItem.Clone();
      firstCopy.SetTextFirstLineOffset(SvxIndentValue.twips(indent[0]));
      leftCopy.SetTextLeft(SvxIndentValue.twips(left[0]));
      rightCopy.SetRight(SvxIndentValue.twips(right[0]));
      for (const [head, item] of [
        [parser.m_xAttrTab.pFirstLineIndent, firstCopy],
        [parser.m_xAttrTab.pTextLeftMargin, leftCopy],
        [parser.m_xAttrTab.pRightMargin, rightCopy],
      ] as const) {
        try {
          if (hard) hard.Put(item);
          else if (NewAttr(parser, parser.m_xAttrTab, head as HTMLAttrHead, item) && head[0]) {
            head[0].SetLikePara();
            parser.m_aParaAttrs.push(head[0]);
            parser.EndAttr(head[0], false);
          }
        } finally {
          item.Dispose();
        }
      }
    }
    if (hard) InsertParaAttrs(parser, hard);
  } finally {
    hard?.Dispose();
  }
}

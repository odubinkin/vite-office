/** @fileoverview Source-contract checks for Writer deferred HTML attribute/context ownership. */
import { BreakIteratorImpl } from "../../../../i18npool/source/breakiterator/breakiteratorImpl";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import * as H from "../../../inc/hintids";
import { assert, expect, it } from "vitest";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import {
  HTMLAttr,
  HTMLAttrTable,
  NewAttr,
  DeleteAttr,
  SaveAttrTab,
  EndAttr,
  type SwHTMLAttributeState,
} from "./swhtml.attr";
import { HTMLAttrContext, SwHTMLAppendMode as A } from "./htmlctxt";

it("retains raw HTML offsets while actual Writer cursor indices move", /** Checks source offsets are not accidentally replaced by registered content positions. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  const position = new SwPosition(node, 2),
    table = new HTMLAttrTable();
  try {
    const item = new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT);
    const attr = new HTMLAttr(position, item, table.pBold, table);
    expect(attr.GetItem()).not.toBe(item);
    expect(attr.GetItem().equals(item)).toBe(true);
    expect(attr.GetStartParagraph().GetNode()).toBe(node);
    node.InsertText("XX", 0);
    expect(position.GetContentIndex()).toBe(4);
    expect(attr.GetStartContent()).toBe(2);
    expect(attr.GetEndContent()).toBe(2);
    attr.SetStart(position);
    expect(attr.GetStartContent()).toBe(4);
    expect(attr.GetEndContent()).toBe(4);
  } finally {
    position.Dispose();
    doc.Dispose();
  }
});

it("preserves original attribute clone, previous-list and reset ownership", /** Checks native copy and detached-list behavior with actual pool items. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcdef");
  const position = new SwPosition(node, 1),
    table = new HTMLAttrTable();
  try {
    const item = new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT);
    const attr = new HTMLAttr(position, item, table.pBold, table),
      pending = new HTMLAttr(position, item, table.pBold, table),
      next = new HTMLAttr(position, item, table.pBold, table);
    attr.SetLikePara();
    attr.Invalidate();
    attr.m_bInsAtStart = false;
    attr.m_nChainDepth = 9;
    attr.InsertNext(next);
    attr.InsertPrev(pending);
    const copy = attr.Clone(node, 5);
    expect(copy.GetItem()).not.toBe(attr.GetItem());
    expect(copy.GetPrev()).toBe(pending);
    expect(copy.GetNext()).toBeNull();
    expect(copy.m_nChainDepth).toBe(0);
    expect(copy.IsLikePara()).toBe(true);
    expect(copy.m_bValid).toBe(false);
    expect(copy.m_bInsAtStart).toBe(false);
    expect(copy.GetStartContent()).toBe(1);
    expect(copy.GetEndContent()).toBe(5);
    const replacement = new HTMLAttrTable();
    attr.Reset(node, 3, replacement.pItalic, replacement);
    expect(attr.GetNext()).toBeNull();
    expect(attr.GetPrev()).toBeNull();
    expect(attr.GetStartContent()).toBe(3);
    expect(attr.GetEndContent()).toBe(3);
    expect(attr.m_nChainDepth).toBe(9);
    expect(attr.m_bValid).toBe(false);
    expect(attr.m_ppHead).toBe(replacement.pItalic);
    expect(attr.m_xAttrTab).toBe(replacement);
    expect(copy.m_xAttrTab).toBe(table);
  } finally {
    position.Dispose();
    doc.Dispose();
  }
});

it("appends pending HTML chains and clears only the transferred root's head/open link", /** Checks nonempty pending-list ordering and borrowed table-slot identity. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    table = new HTMLAttrTable();
  try {
    const item = new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT);
    const owners = Array.from(
      { length: 4 },
      /** Constructs independent pending owners. @returns Attribute. */ () =>
        new HTMLAttr(position, item, table.pBold, table),
    );
    const [root, first, second, last] = owners;
    assert(root && first && second && last);
    first.InsertNext(root);
    second.InsertPrev(last);
    root.InsertPrev(first);
    root.InsertPrev(second);
    expect(root.GetPrev()).toBe(first);
    expect(first.GetPrev()).toBe(second);
    expect(second.GetPrev()).toBe(last);
    expect(first.GetNext()).toBeNull();
    expect(first.m_ppHead).toBeNull();
    expect(second.m_ppHead).toBeNull();
    expect(last.m_ppHead).toBeNull();
    root.ClearPrev();
    expect(root.GetPrev()).toBeNull();
    expect(first.GetPrev()).toBe(second);
    expect(
      Object.values(table).every(
        /** Checks native zero initialization. @param head - Stable slot. @returns Whether empty. */ (
          head,
        ) => head[0] === null,
      ),
    ).toBe(true);
    table.pBold[0] = root;
    expect(root.m_ppHead?.[0]).toBe(root);
  } finally {
    position.Dispose();
    doc.Dispose();
  }
});

it("uses native context constructor defaults and preserves caller margin outputs", /** Checks unset geometry and default-only paragraph styles. @returns Nothing. */ () => {
  const context = new HTMLAttrContext(T.SPAN_ON),
    left: [number] = [11],
    right: [number] = [12],
    indent: [number] = [13],
    upper: [number] = [14],
    lower: [number] = [15];
  expect(context.GetToken()).toBe(T.SPAN_ON);
  expect(context.GetTextFormatColl()).toBe(P.ZERO);
  expect(context.GetDefaultTextFormatColl()).toBe(P.ZERO);
  expect(context.GetClass()).toBe("");
  expect(context.GetAppendMode()).toBe(A.AM_NONE);
  expect(context.IsVisible()).toBe(true);
  expect(context.GetPopStack()).toBe(false);
  expect(context.GetSpansSection()).toBe(false);
  expect(context.IsFinishPREListingXMP()).toBe(false);
  expect(context.IsRestartPRE()).toBe(false);
  expect(context.IsRestartXMP()).toBe(false);
  expect(context.IsRestartListing()).toBe(false);
  expect(context.IsHeaderOrFooter()).toBe(false);
  expect(context.GetSavedNumRule()).toBeNull();
  expect(context.HasAttrs()).toBe(false);
  context.GetMargins(left, right, indent);
  context.GetULSpace(upper, lower);
  expect([left[0], right[0], indent[0], upper[0], lower[0]]).toEqual([11, 12, 13, 14, 15]);
  context.SetMargins(65537, -1, -32769);
  context.GetMargins(left, right, indent);
  expect([left[0], right[0], indent[0]]).toEqual([1, 65535, 32767]);
  context.SetULSpace(-1, 65538);
  context.GetULSpace(upper, lower);
  expect([upper[0], lower[0]]).toEqual([65535, 2]);
  const explicit = new HTMLAttrContext(T.PARABREAK_ON, 2049, " A B "),
    fallback = new HTMLAttrContext(T.PARABREAK_ON, 2049, " C ", true);
  expect(explicit.GetTextFormatColl()).toBe(2049);
  expect(explicit.GetDefaultTextFormatColl()).toBe(P.ZERO);
  expect(explicit.GetClass()).toBe(" A B ");
  expect(fallback.GetTextFormatColl()).toBe(P.ZERO);
  expect(fallback.GetDefaultTextFormatColl()).toBe(2049);
});

it("enforces native chain admission and preserves middle removal and table rebinding", /** Exercises parser operations with real PaM and pool owners rather than reconstructed formatting runs. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    pam = new SwPaM(position),
    table = new HTMLAttrTable();
  const parser: SwHTMLAttributeState = {
    m_pPam: pam,
    m_xAttrTab: table,
    m_aParaAttrs: [],
    m_aSetAttrTab: [],
  };
  try {
    const item = new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT);
    for (let i = 0; i <= 1024; i++) expect(NewAttr(parser, table, table.pBold, item)).toBe(true);
    const root = table.pBold[0];
    assert(root);
    expect(root.m_nChainDepth).toBe(1024);
    expect(NewAttr(parser, table, table.pBold, item)).toBe(false);
    expect(table.pBold[0]).toBe(root);
    const middle = root.GetNext();
    assert(middle);
    const older = middle.GetNext();
    assert(older);
    const pending = new HTMLAttr(position, item, table.pBold, table);
    middle.InsertPrev(pending);
    parser.m_aParaAttrs.push(middle);
    DeleteAttr(parser, middle);
    expect(root.GetNext()).toBe(older);
    expect(older.GetPrev()).toBe(pending);
    expect(parser.m_aParaAttrs).toEqual([]);
    const saved = new HTMLAttrTable();
    SaveAttrTab(parser, saved);
    expect(table.pBold[0]).toBeNull();
    expect(saved.pBold[0]).toBe(root);
    expect(root.m_ppHead).toBe(saved.pBold);
    expect(older.m_xAttrTab).toBe(saved);
    // The pending closed chain is deliberately not traversed by SaveAttrTab.
    expect(pending.m_ppHead).toBeNull();
    expect(pending.m_xAttrTab).toBe(table);
    while (saved.pBold[0] !== null) DeleteAttr(parser, saved.pBold[0]);
    expect(parser.m_aSetAttrTab).toEqual([pending]);
  } finally {
    pam.Dispose();
    position.Dispose();
    doc.Dispose();
  }
});

/** Creates actual parser-owned model fields for source attribute-operation checks. @param text - Initial paragraph. @returns Document and borrowed parser state. */
function attributeFixture(text: string) {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText(text);
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  position.Dispose();
  const parser: SwHTMLAttributeState = {
    m_pPam: pam,
    m_xAttrTab: new HTMLAttrTable(),
    m_aParaAttrs: [],
    m_aSetAttrTab: [],
  };
  return { doc, node, parser };
}
it.each([
  [
    H.RES_CHRATR_WEIGHT,
    "pBold",
    [
      [3, 4],
      [0, 1],
    ],
    true,
  ],
  [H.RES_CHRATR_CJK_WEIGHT, "pBoldCJK", [[1, 2]], false],
  [H.RES_CHRATR_CTL_WEIGHT, "pBoldCTL", [[2, 3]], false],
] as const)(
  "closes script-specific HTML attributes with native split order for Which %s",
  /** Checks actual shared script classification and native queue order/return value. @param which - Which identity. @param key - Table head. @param ranges - Source pending ranges. @param result - Whether the original final owner survives. @returns Nothing. */ (
    which,
    key,
    ranges,
    result,
  ) => {
    const { doc, node, parser } = attributeFixture("A中بB");
    try {
      const head = parser.m_xAttrTab[key];
      NewAttr(parser, parser.m_xAttrTab, head, new SvxWeightItem(FontWeight.WEIGHT_BOLD, which));
      const attr = head[0];
      assert(attr);
      parser.m_pPam.GetPoint().SetContent(node.Len());
      expect(EndAttr(parser, attr, true, new BreakIteratorImpl())).toBe(result);
      expect(head[0]).toBeNull();
      expect(
        parser.m_aSetAttrTab.map(
          /** Reads native raw range outputs. @param pending - Deferred owner. @returns Source bounds. */ (
            pending,
          ) => [pending.GetStartContent(), pending.GetEndContent()],
        ),
      ).toEqual(ranges);
    } finally {
      parser.m_pPam.Dispose();
      doc.Dispose();
    }
  },
);
it("defers inner values behind an outer attribute and preserves empty pending owners", /** Checks overlapping closure ordering and empty-range return semantics. @returns Nothing. */ () => {
  const { doc, node, parser } = attributeFixture("abc"),
    iterator = new BreakIteratorImpl(),
    table = parser.m_xAttrTab;
  try {
    NewAttr(
      parser,
      table,
      table.pBold,
      new SvxWeightItem(FontWeight.WEIGHT_NORMAL, H.RES_CHRATR_WEIGHT),
    );
    const outer = table.pBold[0];
    assert(outer);
    parser.m_pPam.GetPoint().SetContent(1);
    NewAttr(
      parser,
      table,
      table.pBold,
      new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_WEIGHT),
    );
    const inner = table.pBold[0];
    assert(inner);
    parser.m_pPam.GetPoint().SetContent(2);
    expect(EndAttr(parser, inner, true, iterator)).toBe(true);
    expect(table.pBold[0]).toBe(outer);
    expect(outer.GetPrev()).toBe(inner);
    expect(parser.m_aSetAttrTab).toEqual([]);
    parser.m_pPam.GetPoint().SetContent(3);
    expect(EndAttr(parser, outer, true, iterator)).toBe(true);
    expect(parser.m_aSetAttrTab).toEqual([outer]);
    expect(outer.GetPrev()).toBe(inner);
    NewAttr(parser, table, table.pINetFormat, new SwFormatINetFormat("https://example.test/", ""));
    const empty = table.pINetFormat[0];
    assert(empty);
    const pending = new HTMLAttr(
      parser.m_pPam.GetPoint(),
      new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_WEIGHT),
      null,
      table,
    );
    empty.InsertPrev(pending);
    expect(EndAttr(parser, empty, true, iterator)).toBe(false);
    expect(parser.m_aSetAttrTab).toEqual([pending, outer]);
    NewAttr(parser, table, table.pINetFormat, new SwFormatINetFormat("https://example.test/", ""));
    const admitted = table.pINetFormat[0];
    assert(admitted);
    expect(EndAttr(parser, admitted, false, iterator)).toBe(true);
    expect(admitted.m_bInsAtStart).toBe(false);
    expect(parser.m_aSetAttrTab.at(-1)).toBe(admitted);
    expect(parser.m_pPam.GetPoint().GetNode()).toBe(node);
  } finally {
    parser.m_pPam.Dispose();
    doc.Dispose();
  }
});
it("ends paragraph attributes before a new empty paragraph and restores the cursor", /** Checks the native boundary-only movement branch and raw endpoint ownership. @returns Nothing. */ () => {
  const { doc, node, parser } = attributeFixture("abc"),
    iterator = new BreakIteratorImpl(),
    table = parser.m_xAttrTab;
  try {
    NewAttr(parser, table, table.pULSpace, new SvxULSpaceItem(0, 283, H.RES_UL_SPACE));
    const attr = table.pULSpace[0];
    assert(attr);
    const next = doc.GetNodes().MakeTextNode("");
    parser.m_pPam.GetPoint().Assign(next, 0);
    expect(EndAttr(parser, attr, true, iterator)).toBe(true);
    expect(attr.GetEndParagraph().GetNode()).toBe(node);
    expect(attr.GetEndContent()).toBe(3);
    expect(parser.m_pPam.GetPoint().GetNode()).toBe(next);
    expect(parser.m_pPam.GetPoint().GetContentIndex()).toBe(0);
  } finally {
    parser.m_pPam.Dispose();
    doc.Dispose();
  }
});

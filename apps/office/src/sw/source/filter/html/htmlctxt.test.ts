/** @fileoverview Source-contract checks for Writer deferred HTML attribute/context ownership. */
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

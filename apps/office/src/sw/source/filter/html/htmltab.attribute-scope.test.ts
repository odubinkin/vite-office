/** @fileoverview Native table-boundary attribute transfer and caption save/section owners are exercised against actual documents, registered cursors, pools, contexts and deferred attributes. Production table grammar is not replaced by fixtures. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { HTMLAttrTable, NewAttr, DeleteAttr } from "./swhtml.attr";
import { CaptionSaveStruct } from "./htmltab.caption";
import { InsertTempTableCaptionSection } from "./htmltab.sections";
import { HTMLAttrContext } from "./htmlctxt";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvStream } from "../../../../tools/source/stream/stream";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontWeight as W } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import { SwStartNodeType as K } from "../../../inc/ndtyp";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwNumRule } from "../../core/doc/number";
/** Borrows actual importer state without a custom parser, token stream or result provider. @param check - Native observations. @returns Nothing. */
function inspect(check: (parser: SwHTMLParser, doc: SwDoc, node: SwTextNode) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcdef");
  const point = new SwPosition(node),
    pam = new SwPaM(point);
  point.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), UTF8));
  try {
    check(parser, doc, node);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
/** Opens a real cloned pool item through the source attribute producer. @param parser - Actual importer. @param weight - Native item value. @returns Actual open attribute. */
function open(parser: SwHTMLParser, weight = W.WEIGHT_BOLD) {
  const item = new SvxWeightItem(weight, RES_CHRATR_WEIGHT);
  try {
    expect(NewAttr(parser, parser.m_xAttrTab, parser.m_xAttrTab.pBold, item)).toBe(true);
  } finally {
    item.Dispose();
  }
  const attr = parser.m_xAttrTab.pBold[0];
  assert(attr);
  return attr;
}
it.each([true, false])(
  "splits actual pre-table ranges and retains original open context identity insertFirst=%s",
  /** Clones close the old range while original attributes reopen at the exact actual cursor. @param first - Original deferred-list ordering flag. @returns Nothing. */ (
    first,
  ) => {
    inspect(
      /** Observes original split and queue owners. @param parser - Native importer. @param _doc - Actual document. @param node - Real paragraph. @returns Nothing. */ (
        parser,
        _doc,
        node,
      ) => {
        const point = parser.m_pPam.GetPoint(),
          seed = open(parser, W.WEIGHT_NORMAL);
        point.SetContent(1);
        parser.EndAttr(seed);
        const queued = parser.m_aSetAttrTab[0];
        assert(queued);
        const attr = open(parser),
          saved = new HTMLAttrTable();
        attr.m_bInsAtStart = first;
        point.SetContent(4);
        parser.SplitAttrTab(saved, false);
        expect(parser.m_xAttrTab.pBold[0]).toBeNull();
        expect(saved.pBold[0]).toBe(attr);
        expect(attr.GetStartContent()).toBe(4);
        expect(attr.GetEndContent()).toBe(4);
        expect(attr.m_ppHead).toBe(saved.pBold);
        expect(attr.m_xAttrTab).toBe(saved);
        expect(parser.m_aSetAttrTab).toHaveLength(2);
        expect(parser.m_aSetAttrTab[first ? 1 : 0]).toBe(queued);
        const closed = parser.m_aSetAttrTab[first ? 0 : 1];
        assert(closed);
        expect(closed).not.toBe(attr);
        expect(closed.GetItem()).not.toBe(attr.GetItem());
        expect(closed.GetStartParagraph().GetNode()).toBe(node);
        expect(closed.GetStartContent()).toBe(1);
        expect(closed.GetEndContent()).toBe(4);
        expect(closed.GetNext()).toBeNull();
        parser.RestoreAttrTab(saved);
        expect(saved.pBold[0]).toBeNull();
        expect(parser.m_xAttrTab.pBold[0]).toBe(attr);
        expect(attr.m_ppHead).toBe(parser.m_xAttrTab.pBold);
      },
    );
  },
);
it("queues the original nested next/previous chain once while preserving open order and independent item clones", /** This uses actual producer/DeleteAttr operations to create the pending closed chain. @returns Nothing. */ () => {
  inspect(
    /** Observes original attribute chains and saved heads. @param parser - Native importer. @returns Nothing. */ (
      parser,
    ) => {
      const outer = open(parser),
        point = parser.m_pPam.GetPoint();
      point.SetContent(1);
      const pending = open(parser, W.WEIGHT_NORMAL);
      point.SetContent(2);
      // EndAttr creates the actual closed range on the outer owner.
      parser.EndAttr(pending);
      point.SetContent(3);
      const inner = open(parser, W.WEIGHT_NORMAL),
        saved = new HTMLAttrTable();
      point.SetContent(5);
      parser.SplitAttrTab(saved, false);
      expect(saved.pBold[0]).toBe(inner);
      expect(inner.GetNext()).toBe(outer);
      expect(inner.GetPrev()).toBeNull();
      expect(outer.GetPrev()).toBeNull();
      const closed = parser.m_aSetAttrTab[0];
      assert(closed);
      expect(closed.GetStartContent()).toBe(0);
      expect(closed.GetEndContent()).toBe(5);
      expect(closed.GetPrev()?.GetStartContent()).toBe(1);
      expect(closed.GetPrev()?.GetEndContent()).toBe(2);
      expect(closed.GetPrev()?.GetPrev()?.GetStartContent()).toBe(3);
      parser.RestoreAttrTab(saved);
      DeleteAttr(parser, inner);
      expect(parser.m_xAttrTab.pBold[0]).toBe(outer);
    },
  );
});
it("preserves already closed attributes when an empty open range is split", /** Source empty-range branch queues the previous chain without creating a clone. @returns Nothing. */ () => {
  inspect(
    /** Observes original attribute chains and saved heads. @param parser - Native importer. @returns Nothing. */ (
      parser,
    ) => {
      const outer = open(parser),
        inner = open(parser, W.WEIGHT_NORMAL);
      parser.EndAttr(inner, false);
      const previous = outer.GetPrev();
      assert(previous);
      const saved = new HTMLAttrTable();
      parser.SplitAttrTab(saved, false);
      expect(saved.pBold[0]).toBe(outer);
      expect(outer.GetPrev()).toBeNull();
      expect(parser.m_aSetAttrTab).toEqual([previous]);
      parser.RestoreAttrTab(saved);
    },
  );
});
it("moves the closing boundary to the actual preceding paragraph while reopening at the unchanged cursor", /** Actual node-array traversal selects the prior content owner's end. @returns Nothing. */ () => {
  inspect(
    /** Observes connected document/caption owners. @param parser - Native importer. @param doc - Actual document. @param node - Real paragraph. @returns Nothing. */ (
      parser,
      doc,
      node,
    ) => {
      const attr = open(parser),
        next = doc.nodes.MakeTextNode("next"),
        saved = new HTMLAttrTable();
      parser.m_pPam.GetPoint().Assign(next);
      parser.SplitAttrTab(saved, true);
      const closed = parser.m_aSetAttrTab[0];
      assert(closed);
      expect(closed.GetEndParagraph().GetNode()).toBe(node);
      expect(closed.GetEndContent()).toBe(6);
      expect(attr.GetStartParagraph().GetNode()).toBe(next);
      expect(attr.GetStartContent()).toBe(0);
      expect(parser.m_pPam.GetPoint().GetNode()).toBe(next);
      parser.RestoreAttrTab(saved);
    },
  );
});
it("does not publish a range before the start of the body content area", /** Original boundary guard suppresses publication when no preceding content exists. @returns Nothing. */ () => {
  inspect(
    /** Observes original attribute chains and saved heads. @param parser - Native importer. @returns Nothing. */ (
      parser,
    ) => {
      const attr = open(parser),
        saved = new HTMLAttrTable();
      parser.SplitAttrTab(saved, true);
      expect(parser.m_aSetAttrTab).toEqual([]);
      expect(saved.pBold[0]).toBe(attr);
      parser.RestoreAttrTab(saved);
    },
  );
});
it("restores only open next-list heads and keeps detached previous-chain heads unchanged", /** Save/restore transfer identities rather than item or chain copies. @returns Nothing. */ () => {
  inspect(
    /** Observes original attribute chains and saved heads. @param parser - Native importer. @returns Nothing. */ (
      parser,
    ) => {
      const outer = open(parser),
        inner = open(parser, W.WEIGHT_NORMAL);
      parser.EndAttr(inner, false);
      const previous = outer.GetPrev();
      assert(previous);
      const saved = new HTMLAttrTable();
      parser.SaveAttrTab(saved);
      expect(previous.m_ppHead).toBeNull();
      parser.RestoreAttrTab(saved);
      expect(previous.m_ppHead).toBeNull();
      expect(outer.GetPrev()).toBe(previous);
      expect(outer.m_xAttrTab).toBe(parser.m_xAttrTab);
    },
  );
});
it("creates the original temporary caption section in extras and keeps body ownership unchanged", /** The actual node array grows by start/text/end and the original cursor enters COLL_TEXT. @returns Nothing. */ () => {
  inspect(
    /** Observes connected document/caption owners. @param parser - Native importer. @param doc - Actual document. @param node - Real paragraph. @returns Nothing. */ (
      parser,
      doc,
      node,
    ) => {
      const nodes = doc.GetNodes(),
        count = nodes.Count(),
        body = [...doc.paragraphs];
      const start = InsertTempTableCaptionSection(parser),
        text = nodes.at(start.GetIndex() + 1);
      assert(text instanceof SwTextNode);
      expect(nodes.Count()).toBe(count + 3);
      expect(start.GetStartNodeType()).toBe(K.SwNormalStartNode);
      expect(start.EndOfSectionNode().GetIndex()).toBe(start.GetIndex() + 2);
      expect(start.GetIndex()).toBeLessThan(nodes.GetEndOfExtras().GetIndex());
      expect(text.GetTextFormatColl()).toBe(parser.m_pCSS1Parser.GetTextCollFromPool(P.COLL_TEXT));
      expect(parser.m_pPam.GetPoint().GetNode()).toBe(text);
      expect(doc.paragraphs).toEqual(body);
      expect(node.GetText()).toBe("abcdef");
    },
  );
});
it("caption snapshot suspends actual attributes and numbering, restores them in source order and retains a tracked position", /** Caller-owned context cleanup and explicit cursor restoration remain separate native operations. @returns Nothing. */ () => {
  inspect(
    /** Observes connected document/caption owners. @param parser - Native importer. @param doc - Actual document. @param node - Real paragraph. @returns Nothing. */ (
      parser,
      doc,
      node,
    ) => {
      const outer = open(parser),
        context = new HTMLAttrContext(T.BOLD_ON),
        rule = new SwNumRule("caption", "label-alignment");
      parser.PushContext(context);
      parser.GetNumInfo().SetNumRule(rule);
      parser.GetNumInfo().SetDepth(3);
      parser.GetNumInfo().SetNodeStartValue(2, 7);
      parser.m_pPam.GetPoint().SetContent(2);
      const saved = new CaptionSaveStruct(parser, parser.m_pPam.GetPoint());
      try {
        expect(parser.m_nContextStMin).toBe(1);
        expect(parser.m_xAttrTab.pBold[0]).toBeNull();
        expect(saved.m_xAttrTab.pBold[0]).toBe(outer);
        expect(parser.GetNumInfo().GetNumRule()).toBeNull();
        InsertTempTableCaptionSection(parser);
        const captionNode = parser.m_pPam.GetPoint().GetNode();
        expect(captionNode).not.toBe(node);
        node.InsertText("X", 0);
        expect(saved.GetPos().GetContentIndex()).toBe(3);
        const local = new HTMLAttrContext(T.CAPTION_ON);
        parser.PushContext(local);
        expect(parser.PopContext()).toBe(local);
        parser.EndContext(local);
        saved.RestoreAll(parser);
        expect(parser.m_pPam.GetPoint().GetNode()).toBe(captionNode);
        expect(parser.m_xAttrTab.pBold[0]).toBe(outer);
        expect(saved.m_xAttrTab.pBold[0]).toBeNull();
        expect(parser.GetNumInfo().GetNumRule()).toBe(rule);
        expect(parser.GetNumInfo().GetDepth()).toBe(3);
        expect(parser.GetNumInfo().GetNodeStartValue(2)).toBe(7);
        expect(parser.m_nContextStMin).toBe(0);
        parser.m_pPam.GetPoint().Assign(saved.GetPos().GetNode(), saved.GetPos().GetContentIndex());
        expect(parser.m_pPam.GetPoint().GetNode()).toBe(node);
        expect(parser.m_pPam.GetPoint().GetContentIndex()).toBe(3);
      } finally {
        saved.SourceDispose();
        parser.GetNumInfo().Clear();
        rule.Dispose();
      }
      expect(doc.GetNodes().IsDocNodes()).toBe(true);
    },
  );
});

it("retains the source unequal-offset test even when the live cursor moved behind the open start", /** The original split condition is inequality, not an increasing-range check; the deferred consumer owns later admission. @returns Nothing. */ () => {
  inspect(
    /** Observes original attribute chains and saved heads. @param parser - Native importer. @returns Nothing. */ (
      parser,
    ) => {
      parser.m_pPam.GetPoint().SetContent(4);
      const attr = open(parser),
        saved = new HTMLAttrTable();
      parser.m_pPam.GetPoint().SetContent(2);
      parser.SplitAttrTab(saved, false);
      const closed = parser.m_aSetAttrTab[0];
      assert(closed);
      expect(closed.GetStartContent()).toBe(4);
      expect(closed.GetEndContent()).toBe(2);
      expect(attr.GetStartContent()).toBe(2);
      parser.RestoreAttrTab(saved);
    },
  );
});

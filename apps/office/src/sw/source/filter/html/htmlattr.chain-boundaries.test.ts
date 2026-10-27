/** @fileoverview Verifies native deferred HTML linked owners and all script-specific attribute families. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { BreakIteratorImpl } from "../../../../i18npool/source/breakiterator/breakiteratorImpl";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import * as H from "../../../inc/hintids";
import {
  HTMLAttr,
  HTMLAttrTable,
  NewAttr,
  DeleteAttr,
  EndAttr,
  type SwHTMLAttributeState,
} from "./swhtml.attr";
/** Owns real parser dependencies for one operation sequence. @param run - Native sequence. @returns Nothing. */
function fixture(run: (doc: SwDoc, parser: SwHTMLAttributeState) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("A漢بA");
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  position.Dispose();
  const parser: SwHTMLAttributeState = {
    m_pPam: pam,
    m_xAttrTab: new HTMLAttrTable(),
    m_aParaAttrs: [],
    m_aSetAttrTab: [],
  };
  try {
    run(doc, parser);
  } finally {
    pam.Dispose();
    doc.Dispose();
  }
}
it.each([
  H.RES_CHRATR_FONT,
  H.RES_CHRATR_FONTSIZE,
  H.RES_CHRATR_LANGUAGE,
  H.RES_CHRATR_POSTURE,
  H.RES_CHRATR_WEIGHT,
  H.RES_CHRATR_CJK_FONT,
  H.RES_CHRATR_CJK_FONTSIZE,
  H.RES_CHRATR_CJK_LANGUAGE,
  H.RES_CHRATR_CJK_POSTURE,
  H.RES_CHRATR_CJK_WEIGHT,
  H.RES_CHRATR_CTL_FONT,
  H.RES_CHRATR_CTL_FONTSIZE,
  H.RES_CHRATR_CTL_LANGUAGE,
  H.RES_CHRATR_CTL_POSTURE,
  H.RES_CHRATR_CTL_WEIGHT,
])(
  "splits represented native script-specific item %i",
  /** Verifies native classification uses actual pool item owners. @param which - WhichId. @returns Nothing. */ (
    which,
  ) => {
    fixture(
      /** Closes a real item over mixed script text. @param doc - Document. @param parser - Parser. @returns Nothing. */ (
        doc,
        parser,
      ) => {
        const table = parser.m_xAttrTab,
          item = doc.GetDefault(which),
          head = table.pBold;
        NewAttr(parser, table, head, item);
        const attr = head[0];
        assert(attr);
        parser.m_pPam.GetPoint().SetContent(4);
        EndAttr(parser, attr, true, new BreakIteratorImpl());
        const expected =
          which >= H.RES_CHRATR_CTL_FONT
            ? [[2, 3]]
            : which >= H.RES_CHRATR_CJK_FONT
              ? [[1, 2]]
              : [
                  [3, 4],
                  [0, 1],
                ];
        expect(
          parser.m_aSetAttrTab.map(
            /** Reads source deferred boundaries. @param pending - Native owner. @returns Bounds. */ (
              pending,
            ) => [pending.GetStartContent(), pending.GetEndContent()],
          ),
        ).toEqual(expected);
        expect(attr.GetEndParagraphIdx()).toBe(parser.m_pPam.GetPoint().GetNodeIndex());
      },
    );
  },
);
it("finds deeper open owners and transfers previously closed hyperlink chains in source order", /** Verifies native head correction and pending tail traversal. @returns Nothing. */ () => {
  fixture(
    /** Exercises actual linked owners. @param doc - Document. @param parser - Parser. @returns Nothing. */ (
      doc,
      parser,
    ) => {
      const table = parser.m_xAttrTab,
        item = doc.GetDefault(H.RES_CHRATR_WEIGHT),
        iterator = new BreakIteratorImpl();
      for (let i = 0; i < 4; i++) NewAttr(parser, table, table.pBold, item);
      const root = table.pBold[0],
        middle = root?.GetNext()?.GetNext(),
        last = middle?.GetNext();
      assert(root && middle && last);
      DeleteAttr(parser, last);
      expect(middle.GetNext()).toBeNull();
      parser.m_pPam.GetPoint().SetContent(1);
      EndAttr(parser, middle, true, iterator);
      expect(root.GetNext()?.GetNext()).toBeNull();
      const second = root.GetNext();
      assert(second);
      NewAttr(parser, table, table.pINetFormat, new SwFormatINetFormat("https://example.test"));
      const closed = table.pINetFormat[0];
      assert(closed);
      EndAttr(parser, closed, false, iterator);
      expect(closed.m_bInsAtStart).toBe(false);
      expect(parser.m_aSetAttrTab.pop()).toBe(closed);
      second.InsertPrev(closed);
      DeleteAttr(parser, second);
      expect(parser.m_aSetAttrTab.pop()).toBe(closed);
      root.InsertPrev(closed);
      expect(root.GetPrev()).toBe(closed);
      const more = new HTMLAttr(parser.m_pPam.GetPoint(), item, null, table),
        tail = new HTMLAttr(parser.m_pPam.GetPoint(), item, null, table);
      root.InsertPrev(more);
      root.InsertPrev(tail);
      expect(closed.GetPrev()).toBe(more);
      expect(more.GetPrev()).toBe(tail);
      DeleteAttr(parser, root);
      expect(parser.m_aSetAttrTab.at(-1)).toBe(closed);
    },
  );
});
it("attaches script fragments to a remaining outer owner and rejects empty inner hyperlinks with pending predecessors", /** Verifies deferred fragments retain native parent ownership. @returns Nothing. */ () => {
  fixture(
    /** Exercises inner closure and empty-range recovery. @param doc - Document. @param parser - Parser. @returns Nothing. */ (
      doc,
      parser,
    ) => {
      const table = parser.m_xAttrTab,
        iterator = new BreakIteratorImpl(),
        item = doc.GetDefault(H.RES_CHRATR_WEIGHT);
      NewAttr(parser, table, table.pBold, item);
      const outer = table.pBold[0];
      assert(outer);
      NewAttr(parser, table, table.pBold, item);
      const inner = table.pBold[0];
      assert(inner);
      parser.m_pPam.GetPoint().SetContent(4);
      expect(EndAttr(parser, inner, true, iterator)).toBe(true);
      expect(outer.GetPrev()?.GetStartContent()).toBe(0);
      expect(outer.GetPrev()?.GetPrev()).toBe(inner);
      NewAttr(parser, table, table.pINetFormat, new SwFormatINetFormat("outer"));
      const outerLink = table.pINetFormat[0];
      assert(outerLink);
      NewAttr(parser, table, table.pINetFormat, new SwFormatINetFormat("inner"));
      const empty = table.pINetFormat[0];
      assert(empty);
      const pending = new HTMLAttr(parser.m_pPam.GetPoint(), item, null, table);
      empty.InsertPrev(pending);
      expect(EndAttr(parser, empty, true, iterator)).toBe(false);
      expect(outerLink.GetPrev()).toBe(pending);
    },
  );
});

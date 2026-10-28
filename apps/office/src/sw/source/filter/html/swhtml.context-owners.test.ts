/** @fileoverview Original public HTML context composition over actual parser/document/cursor owners; native constructor/setter APIs supply context state without private field injection. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { HTMLAttrContext, SwHTMLAppendMode as A } from "./htmlctxt";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { RES_UL_SPACE } from "../../../inc/hintids";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
/** Supplies real parser owners and deterministic destruction for original context API calls. @param inspect - Original owner observations. @returns Nothing. */
function withParser(inspect: (parser: SwHTMLParser, doc: SwDoc) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8));
  try {
    inspect(parser, doc);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
it("strips at most two trailing hard breaks and retains explicit upper spacing when paragraph space is required", /** Original AppendTextNode upgrades NOSPACE to SPACE after stripping two breaks, preserves the remaining hard break and preserves upper spacing when it differs from the inherited style. @returns Nothing. */ () => {
  withParser(
    /** Supplies actual document content and paragraph items through source owners. @param parser - Actual importer. @param doc - Actual document. @returns Nothing. */
    (parser, doc) => {
      parser.SetTextCollAttrs();
      doc.GetDocumentContentOperationsManager().InsertString(parser.m_pPam, "A\n\n\n");
      const first = doc.paragraphs[0];
      assert(first);
      first.SetAttr(new SvxULSpaceItem(40, 0, RES_UL_SPACE));
      expect(parser.AppendTextNode(A.AM_NOSPACE)).toBe(true);
      expect(
        doc.paragraphs.map(
          /** Observes actual appended node content. @param node - Real text node. @returns Text. */
          (node) => node.GetText(),
        ),
      ).toEqual(["A\n", ""]);
      const spacing = first.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
      expect([spacing.GetUpper(), spacing.GetLower()]).toEqual([40, 283]);
    },
  );
});
it.each([0, 40])(
  "restores remembered paragraph space while preserving original upper spacing %i",
  /** Original NOSPACE suppression is reversible: identical upper spacing permits inheritance, while a distinct explicit upper side must survive restoration. @param upper - Existing direct upper spacing. @returns Nothing. */ (
    upper,
  ) =>
    withParser(
      /** Uses real insertion, item and source append/restore APIs rather than setting the parser's remembered flag. @param parser - Actual importer. @param doc - Actual model. @returns Nothing. */
      (parser, doc) => {
        parser.SetTextCollAttrs();
        doc.GetDocumentContentOperationsManager().InsertString(parser.m_pPam, "A");
        const first = doc.paragraphs[0];
        assert(first);
        first.SetAttr(new SvxULSpaceItem(upper, 283, RES_UL_SPACE));
        expect(parser.AppendTextNode(A.AM_NOSPACE)).toBe(true);
        expect((first.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(0);
        parser.AddParSpace();
        const spacing = first.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
        expect([spacing.GetUpper(), spacing.GetLower()]).toEqual([upper, 283]);
        expect(doc.paragraphs).toHaveLength(2);
      },
    ),
);
it("resolves nearest changed spacing before a default-only style and returns to body defaults after popping", /** Original context constructors distinguish fallback styles from explicit styles; native unsigned spacing setters supply actual values. @returns Nothing. */ () => {
  withParser(
    /** Composes genuine contexts and observes actual pool spacing. @param parser - Actual owner. @returns Nothing. */
    (parser) => {
      const upper: [number] = [-1],
        lower: [number] = [-1];
      parser.GetULSpaceFromContext(upper, lower);
      expect([upper[0], lower[0]]).toEqual([0, 283]);
      const fallback = new HTMLAttrContext(T.DIVISION_ON, P.COLL_HTML_PRE, "", true);
      parser.PushContext(fallback);
      parser.GetULSpaceFromContext(upper, lower);
      expect([upper[0], lower[0]]).toEqual([0, 0]);
      const nearest = new HTMLAttrContext(T.PARABREAK_ON);
      nearest.SetULSpace(40, 80);
      parser.PushContext(nearest);
      parser.GetULSpaceFromContext(upper, lower);
      expect([upper[0], lower[0]]).toEqual([40, 80]);
      expect(parser.PopContext(T.PARABREAK_ON)).toBe(nearest);
      parser.GetULSpaceFromContext(upper, lower);
      expect([upper[0], lower[0]]).toEqual([0, 0]);
      expect(parser.PopContext(T.DIVISION_ON)).toBe(fallback);
      parser.GetULSpaceFromContext(upper, lower);
      expect([upper[0], lower[0]]).toEqual([0, 283]);
    },
  );
});
it("keeps matching contexts below the original NONE sentinel closed to token search", /** Original PopContext stops at a NONE context but an unqualified pop can remove that sentinel; failed searches preserve owner order. @returns Nothing. */ () => {
  withParser(
    /** Uses only genuine context construction and push/pop APIs. @param parser - Actual owner. @returns Nothing. */
    (parser) => {
      const outer = new HTMLAttrContext(T.BOLD_ON),
        sentinel = new HTMLAttrContext(T.NONE),
        inner = new HTMLAttrContext(T.ITALIC_ON);
      parser.PushContext(outer);
      parser.PushContext(sentinel);
      parser.PushContext(inner);
      expect(parser.PopContext(T.BOLD_ON)).toBeNull();
      expect(parser.m_aContexts).toEqual([outer, sentinel, inner]);
      expect(parser.PopContext(T.ITALIC_ON)).toBe(inner);
      expect(parser.PopContext()).toBe(sentinel);
      expect(parser.PopContext(T.BOLD_ON)).toBe(outer);
      expect(parser.PopContext()).toBeNull();
    },
  );
});
it("ends intervening genuine contexts when the removed outer context requests PopStack", /** Source PopContext removes only its match; EndContext must then close the retained inner contexts when the original context flag requests it. @returns Nothing. */ () => {
  withParser(
    /** Constructs the same owner relationships using native public context flags. @param parser - Actual owner. @returns Nothing. */
    (parser) => {
      const outer = new HTMLAttrContext(T.DIVISION_ON);
      outer.SetPopStack(true);
      parser.PushContext(outer);
      parser.PushContext(new HTMLAttrContext(T.BOLD_ON));
      parser.PushContext(new HTMLAttrContext(T.ITALIC_ON));
      const removed = parser.PopContext(T.DIVISION_ON);
      expect(removed).toBe(outer);
      expect(parser.m_aContexts).toHaveLength(2);
      assert(removed);
      parser.EndContext(removed);
      expect(parser.m_aContexts).toHaveLength(0);
    },
  );
});
it("retains the original text-node checked precondition for a real section-end cursor", /** The source requires a text node for current style access. A real native end node is a valid SwPosition but violates that operation's content precondition; the existing TS assertion binding must reject it. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    position = new SwPosition(doc.GetNodes().GetEndOfContent()),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8));
  try {
    expect(
      /** Calls the actual style getter at the real noncontent node. @returns Source collection if the invariant unexpectedly succeeds. */ () =>
        parser.GetCurrFormatColl(),
    ).toThrow("assert(SwTextNode)");
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
});

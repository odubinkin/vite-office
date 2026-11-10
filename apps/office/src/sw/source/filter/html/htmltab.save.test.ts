/** @fileoverview Native section-save and stack consumers operate on actual parser/context/font/style owners; no token/provider/native-result replacement. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { SectionSaveStruct } from "./htmltab.save";
import { HTMLAttrContext } from "./htmlctxt";
import { NewBasefontAttr, EndBasefontAttr, NewFontAttr, EndFontAttr } from "./swhtml.font";
import { EndDefListItem, NewDefList } from "./swhtml.definitions";
import { EndNumberBulletListItem } from "./htmlnumreader";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { SvParserState as S } from "../../../../svtools/inc/svparser";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
/** Supplies genuine document/cursor/importer owners and releases their native resources. @param inspect - Source operations and observations. @returns Nothing. */
function withParser(inspect: (parser: SwHTMLParser, doc: SwDoc) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const point = new SwPosition(node),
    pam = new SwPaM(point);
  point.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), UTF8));
  try {
    inspect(parser, doc);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
/** Original section callers close only their local contexts before Restore. @param parser - Actual parser. @param saved - Original save. @returns Nothing. */
function close(parser: SwHTMLParser, saved: SectionSaveStruct): void {
  while (parser.m_aContexts.length > parser.m_nContextStMin) {
    const context = parser.PopContext();
    assert(context);
    parser.EndContext(context);
  }
  saved.Restore(parser);
}
it.each([T.BOLD_ON, T.HEAD1_ON, T.DD_ON, T.DT_ON, T.LI_ON, T.LISTHEADER_ON])(
  "protects outer context %s from native closing searches, then releases it after Restore",
  /** Exercises each original search through genuine context pushes and section boundaries. @param token - Original opening token. @returns Nothing. */ (
    token,
  ) => {
    withParser(
      /** Actual public owner operations supply contexts and the save value. @param parser - Native importer. @returns Nothing. */ (
        parser,
      ) => {
        const outer = new HTMLAttrContext(token);
        parser.PushContext(outer);
        const saved = new SectionSaveStruct(parser);
        const inner = new HTMLAttrContext(T.ITALIC_ON);
        parser.PushContext(inner);
        if (token === T.HEAD1_ON) parser.EndHeading();
        else if (token === T.DD_ON || token === T.DT_ON) EndDefListItem(parser, token);
        else if (token === T.LI_ON || token === T.LISTHEADER_ON)
          EndNumberBulletListItem(parser, token);
        else parser.EndTag(token);
        expect(parser.m_aContexts).toEqual([outer, inner]);
        expect(parser.PopContext(token)).toBeNull();
        expect(parser.PopContext()).toBe(inner);
        parser.EndContext(inner);
        expect(parser.PopContext()).toBeNull();
        saved.Restore(parser);
        expect(parser.PopContext(token)).toBe(outer);
        parser.EndContext(outer);
      },
    );
  },
);
it("freezes nested actual font stacks, preserves outer font contexts and restores prior bounds", /** Native font producers and closers consume the same stack minima saved for table sections. @returns Nothing. */ () => {
  withParser(
    /** Original font ingress uses the real parser options owner. @param parser - Native importer. @returns Nothing. */ (
      parser,
    ) => {
      NewBasefontAttr(parser);
      NewFontAttr(parser, T.FONT_ON);
      const contexts = [...parser.m_aContexts],
        first = new SectionSaveStruct(parser);
      EndBasefontAttr(parser);
      EndFontAttr(parser, T.FONT_ON);
      expect(parser.m_aContexts).toEqual(contexts);
      expect(parser.m_aBaseFontStack).toEqual([3]);
      expect(parser.m_aFontStack).toEqual([0]);
      NewBasefontAttr(parser);
      NewFontAttr(parser, T.BIGPRINT_ON);
      const second = new SectionSaveStruct(parser);
      expect([parser.m_nBaseFontStMin, parser.m_nFontStMin]).toEqual([2, 2]);
      expect(second.GetContextStAttrMin()).toBe(2);
      NewBasefontAttr(parser);
      NewFontAttr(parser, T.SMALLPRINT_ON);
      close(parser, second);
      expect([parser.m_aBaseFontStack.length, parser.m_aFontStack.length]).toEqual([2, 2]);
      expect([parser.m_nBaseFontStMin, parser.m_nFontStMin]).toEqual([1, 1]);
      close(parser, first);
      expect(parser.m_aContexts).toEqual(contexts);
      expect([parser.m_aBaseFontStack.length, parser.m_aFontStack.length]).toEqual([1, 1]);
      expect([
        parser.m_nBaseFontStMin,
        parser.m_nFontStMin,
        parser.m_nContextStMin,
        parser.m_nContextStAttrMin,
      ]).toEqual([0, 0, 0, 0]);
      EndFontAttr(parser, T.FONT_ON);
      EndBasefontAttr(parser);
      expect(parser.m_aContexts).toEqual([]);
      expect(parser.m_aFontStack).toEqual([]);
      expect(parser.m_aBaseFontStack).toEqual([]);
    },
  );
});
it("isolates margin and spacing lookups and the actual paragraph-style cascade", /** External paragraph geometry and collections must not enter the section-local style cascade. @returns Nothing. */ () => {
  withParser(
    /** Builds real nested context geometry through original setters. @param parser - Native importer. @param doc - Actual document. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const outer = new HTMLAttrContext(T.HEAD1_ON, P.COLL_HEADLINE1);
      outer.SetMargins(100, 200, -30);
      outer.SetULSpace(400, 500);
      parser.PushContext(outer);
      const saved = new SectionSaveStruct(parser),
        left: [number] = [1],
        right: [number] = [2],
        indent: [number] = [3];
      parser.GetMarginsFromContext(left, right, indent);
      expect([left[0], right[0], indent[0]]).toEqual([1, 2, 3]);
      const upper: [number] = [0],
        lower: [number] = [0];
      parser.GetULSpaceFromContext(upper, lower);
      const body = parser.m_pCSS1Parser.GetTextCollFromPool(P.COLL_TEXT).GetULSpace();
      expect([upper[0], lower[0]]).toEqual([body.GetUpper(), body.GetLower()]);
      const inner = new HTMLAttrContext(T.TABLEDATA_ON, P.COLL_TABLE, "", true);
      inner.SetMargins(10, 20, -3);
      inner.SetULSpace(40, 50);
      parser.PushContext(inner);
      parser.GetMarginsFromContext(left, right, indent);
      parser.GetULSpaceFromContext(upper, lower);
      expect([left[0], right[0], indent[0], upper[0], lower[0]]).toEqual([10, 20, -3, 40, 50]);
      parser.GetMarginsFromContext(left, right, indent, true);
      expect([left[0], right[0], indent[0]]).toEqual([10, 20, -3]);
      parser.SetTextCollAttrs();
      expect(doc.paragraphs[0]?.GetTextFormatColl().GetPoolFormatId()).toBe(P.COLL_TABLE);
      close(parser, saved);
      parser.SetTextCollAttrs();
      expect(doc.paragraphs[0]?.GetTextFormatColl().GetPoolFormatId()).toBe(P.COLL_HEADLINE1);
      parser.GetMarginsFromContext(left, right, indent);
      expect([left[0], right[0], indent[0]]).toEqual([100, 200, -30]);
    },
  );
});
it("restores definition depth and resets paragraph flags through original section Restore", /** Original DL producers supply counters; save values do not reset outer stack entries. @returns Nothing. */ () => {
  withParser(
    /** Uses real definition-list producers in nested sections. @param parser - Actual importer. @returns Nothing. */ (
      parser,
    ) => {
      NewDefList(parser);
      expect(parser.m_nDefListDeep).toBe(1);
      const first = new SectionSaveStruct(parser);
      expect(parser.m_nDefListDeep).toBe(0);
      NewDefList(parser);
      const second = new SectionSaveStruct(parser);
      expect(parser.m_nDefListDeep).toBe(0);
      close(parser, second);
      expect(parser.m_nDefListDeep).toBe(1);
      close(parser, first);
      expect(parser.m_nDefListDeep).toBe(1);
      expect(parser.m_nOpenParaToken).toBe(T.NONE);
      expect(parser.m_bNoParSpace).toBe(false);
      expect(parser.m_aParaAttrs).toEqual([]);
    },
  );
});
it("bounds native PopStack cleanup at the saved outer environment", /** Original EndContext must leave frozen external owners alive. @returns Nothing. */ () => {
  withParser(
    /** Public context APIs supply the original ownership and cleanup order. @param parser - Native importer. @returns Nothing. */ (
      parser,
    ) => {
      const outer = new HTMLAttrContext(T.BOLD_ON);
      parser.PushContext(outer);
      const saved = new SectionSaveStruct(parser),
        owner = new HTMLAttrContext(T.SPAN_ON),
        local = new HTMLAttrContext(T.ITALIC_ON);
      owner.SetPopStack(true);
      parser.PushContext(owner);
      parser.PushContext(local);
      expect(parser.PopContext(T.SPAN_ON)).toBe(owner);
      parser.EndContext(owner);
      expect(parser.m_aContexts).toEqual([outer]);
      saved.Restore(parser);
      expect(parser.PopContext()).toBe(outer);
      parser.EndContext(outer);
    },
  );
});

/** Test entry scopes actual lexer tokens with original section-save operations. It exercises the section component and does not claim the pending production BuildTable consumer. */
class ScopeReader extends SwHTMLParser {
  private sectionSave: SectionSaveStruct | null = null;
  readonly innerFontSizes: number[] = [];
  readonly outerStackSizes: number[][] = [];
  /** Consumes genuine bytes through the inherited virtual dispatch and native font/context operations. @param token - Actual filtered token. @returns Nothing. */
  protected override NextToken(token: T): void {
    if (token === T.TABLE_ON) {
      this.sectionSave = new SectionSaveStruct(this);
      return;
    }
    if (token === T.TABLE_OFF && this.sectionSave) {
      this.outerStackSizes.push([
        this.m_aBaseFontStack.length,
        this.m_aFontStack.length,
        this.m_aContexts.length,
      ]);
      close(this, this.sectionSave);
      this.sectionSave = null;
      return;
    }
    super.NextToken(token);
    if (token === T.FONT_ON && this.sectionSave) {
      const size = this.m_aFontStack.at(-1);
      assert(size !== undefined);
      this.innerFontSizes.push(size);
    }
  }
}
it("consumes real HTML font closers and relative sizes across native saved boundaries", /** Actual lexer options and virtual consumers must retain external fonts while section-local relative sizing uses the source default. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const point = new SwPosition(node),
    pam = new SwPaM(point);
  point.Dispose();
  const html =
    "<font size=6><basefont size=7>A<table></font></basefont><font size=+1>B</font></table>C</font></basefont>";
  const parser = new ScopeReader(doc, pam, new SvStream(OUStringToOString(html, UTF8), UTF8));
  try {
    expect(parser.CallParser()).toBe(S.Accepted);
    expect(parser.innerFontSizes).toEqual([4]);
    expect(parser.outerStackSizes).toEqual([[1, 1, 2]]);
    expect(parser.m_aFontStack).toEqual([]);
    expect(parser.m_aBaseFontStack).toEqual([]);
    expect(
      doc.paragraphs
        .map(
          /** Reads actual imported node contents. @param paragraph - Native node. @returns Source text. */ (
            paragraph,
          ) => paragraph.GetText(),
        )
        .join(""),
    ).toBe("ABC");
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
});
it("retains upstream uint16 font-bound wrap independently of size_t context protection", /** Original font producers build the genuine deep stack; no array/minimum injection substitutes its state. @returns Nothing. */ () => {
  withParser(
    /** Exercises the source field-width boundary using native font ingress. @param parser - Actual importer. @returns Nothing. */ (
      parser,
    ) => {
      for (let i = 0; i < 65536; ++i) NewFontAttr(parser, T.FONT_ON);
      const saved = new SectionSaveStruct(parser);
      expect(parser.m_nFontStMin).toBe(0);
      expect(parser.m_nContextStMin).toBe(65536);
      EndFontAttr(parser, T.FONT_ON);
      expect(parser.m_aFontStack).toHaveLength(65535);
      expect(parser.m_aContexts).toHaveLength(65536);
      saved.Restore(parser);
      expect(parser.m_aFontStack).toEqual([]);
      expect(parser.m_aContexts).toHaveLength(65536);
    },
  );
});

/** @fileoverview Actual native lexer/virtual-consumer inputs verify fresh table construction and complete caption begin/end ownership blocks. Recursive BuildTable grammar is not replaced or certified by these component fixtures. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { CreateHTMLTable } from "./htmltab.read";
import { BeginTableCaption, EndTableCaption, CaptionSaveStruct } from "./htmltab.caption";
import type { HTMLTable } from "./htmltab";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontWeight as W } from "../../../../tools/inc/fontenum";
import { RES_PARATR_ADJUST, RES_UL_SPACE, RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvParserState as S } from "../../../../svtools/inc/svparser";
/** Original protected virtual-consumer boundary dispatches only lifecycle component entry points on actual tokens. It never supplies a synthetic token, table/layout result or private parser state. */
class Reader extends SwHTMLParser {
  readonly tables: HTMLTable[] = [];
  readonly saves: CaptionSaveStruct[] = [];
  /** Dispatches source lifecycle boundaries, delegating all actual text/paragraph/inline work to the native importer. @param token - Native filtered token. @returns Nothing. */
  protected override NextToken(token: T): void {
    if (token === T.TABLE_ON) {
      this.tables.push(CreateHTMLTable(this, A.Left));
      return;
    }
    if (token === T.TABLE_OFF) return;
    const table = this.m_xTable;
    if (token === T.CAPTION_ON && table) {
      const saved = BeginTableCaption(this, table);
      assert(saved);
      this.saves.push(saved);
      return;
    }
    if (token === T.CAPTION_OFF && table) {
      const saved = this.saves.pop();
      assert(saved);
      EndTableCaption(this, table, saved);
      saved.SourceDispose();
      return;
    }
    super.NextToken(token);
  }
}
/** Parses real UTF8 bytes and retains all original owners until observations complete. @param source - Native HTML input. @param inspect - Actual source owner observations. @returns Nothing. */
function parse(source: string, inspect: (parser: Reader, doc: SwDoc) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const p = new SwPosition(node),
    pam = new SwPaM(p);
  p.Dispose();
  const bytes = OUStringToOString(source, UTF8),
    stream = new SvStream(bytes, UTF8),
    parser = new Reader(doc, pam, stream);
  try {
    expect(parser.CallParser()).toBe(S.Accepted);
    inspect(parser, doc);
  } finally {
    for (const saved of parser.saves) saved.SourceDispose();
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
/** Borrows actual caption text nodes from the canonical node array. @param doc - Actual document. @param table - Actual intermediate table. @returns Caption nodes in source order. */
function captions(doc: SwDoc, table: HTMLTable): SwTextNode[] {
  const start = table.GetCaptionStartNode();
  assert(start);
  return doc.nodes
    .entries()
    .slice(start.GetIndex() + 1, start.EndOfSectionNode().GetIndex())
    .filter(
      /** Retains actual text nodes. @param node - Native node. @returns Text-node admission. */ (
        node,
      ): node is SwTextNode => node instanceof SwTextNode,
    );
}
it.each([
  ["", A.Left],
  ['style="margin-left:auto;margin-right:auto"', A.Center],
  ['style="margin-left:auto"', A.Left],
  ['align="right" style="margin-left:auto;margin-right:auto"', A.Right],
  ['style="margin-left:auto;margin-right:auto" style="margin-left:0"', A.Center],
] as const)(
  "constructs table alignment from native options %s",
  /** Inline auto margins affect the parent default while explicit ALIGN still wins. @param options - Original options. @param expected - Native final adjustment. @returns Nothing. */ (
    options,
    expected,
  ) => {
    parse(
      `<table ${options}></table>`,
      /** Observes actual native current-table identity and defaults. @param reader - Actual importer. @returns Nothing. */ (
        reader,
      ) => {
        const table = reader.tables[0];
        assert(table);
        expect(reader.m_xTable).toBe(table);
        expect(table.GetTableAdjust(true)).toBe(expected);
        expect(table.HasParentSection()).toBe(false);
        expect(reader.m_aTables).toEqual([table]);
      },
    );
  },
);
it("publishes the native table ID bookmark on the original document position", /** Table option parsing uses the actual deferred bookmark producer. @returns Nothing. */ () => {
  parse(
    '<table id="native-table"></table>',
    /** Reads the real mark manager. @param reader - Actual importer. @param doc - Actual graph. @returns Nothing. */ (
      reader,
      doc,
    ) => {
      const mark = doc.GetIDocumentMarkAccess().GetBookmarks()[0];
      assert(mark);
      expect(mark.GetName()).toBe("native-table");
      expect(mark.GetMarkPos().GetNode()).toBe(doc.paragraphs[0]);
      expect(reader.tables).toHaveLength(1);
    },
  );
});
it.each([
  ["", true],
  ['align="BOTTOM"', false],
  ['align="top"', true],
  ['align="bottom" align="top"', false],
  ['align="top" align="bottom"', false],
] as const)(
  "preserves native caption position options %s",
  /** Any bottom ALIGN keeps the original false flag even if another duplicate says top. @param options - Original caption options. @param top - Native side. @returns Nothing. */ (
    options,
    top,
  ) => {
    parse(
      `<table><caption ${options}>native caption</caption></table>after`,
      /** Reads actual caption nodes and restored body position. @param reader - Native importer. @param doc - Actual document. @returns Nothing. */ (
        reader,
        doc,
      ) => {
        const table = reader.tables[0];
        assert(table);
        const nodes = captions(doc, table);
        expect(table.IsTopCaption()).toBe(top);
        expect(
          nodes.map(
            /** Reads native text. @param node - Actual text node. @returns Text. */ (node) =>
              node.GetText(),
          ),
        ).toEqual(["native caption", ""]);
        expect((nodes[0]?.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust()).toBe(A.Center);
        expect((nodes[0]?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(0);
        expect(doc.paragraphs[0]?.GetText()).toBe("after");
        expect(reader.saves).toHaveLength(0);
        expect(reader.m_aContexts).toHaveLength(0);
      },
    );
  },
);
it("closes native local inline contexts before restoring the caption and following body", /** Open inline attributes must remain in the saved caption section. @returns Nothing. */ () => {
  parse(
    "<table><caption><b>caption</caption></table>body",
    /** Observes actual native hint and context ownership. @param reader - Native importer. @param doc - Actual document. @returns Nothing. */ (
      reader,
      doc,
    ) => {
      const table = reader.tables[0];
      assert(table);
      const first = captions(doc, table)[0];
      assert(first);
      expect((first.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(W.WEIGHT_BOLD);
      expect((doc.paragraphs[0]?.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
        W.WEIGHT_NORMAL,
      );
      expect(doc.paragraphs[0]?.GetpSwpHints()?.Count() ?? 0).toBe(0);
      expect(reader.m_aContexts).toHaveLength(0);
      expect(reader.m_nContextStMin).toBe(0);
      expect(reader.m_nContextStAttrMin).toBe(0);
    },
  );
});
it("retains the native trailing-linefeed append decision in a caption", /** Caption finalization strips hard linefeeds then appends the required empty paragraph. @returns Nothing. */ () => {
  parse(
    "<table><caption>caption<br></caption></table>",
    /** Reads actual caption node text. @param reader - Native importer. @param doc - Actual document. @returns Nothing. */ (
      reader,
      doc,
    ) => {
      const table = reader.tables[0];
      assert(table);
      expect(
        captions(doc, table).map(
          /** Reads actual text. @param node - Native node. @returns Text. */ (node) =>
            node.GetText(),
        ),
      ).toEqual(["caption", ""]);
    },
  );
});
it("keeps an empty caption as its actual single empty source paragraph", /** An empty caption does not get a fabricated extra text node. @returns Nothing. */ () => {
  parse(
    "<table><caption></caption></table>",
    /** Reads actual caption content. @param reader - Native importer. @param doc - Actual graph. @returns Nothing. */ (
      reader,
      doc,
    ) => {
      const table = reader.tables[0];
      assert(table);
      expect(captions(doc, table)).toHaveLength(1);
      expect(captions(doc, table)[0]?.GetText()).toBe("");
    },
  );
});
it("suspends outer character attributes for the caption and restores them for the body", /** Actual saved attribute heads and frozen contexts prevent formatting from leaking across sections. @returns Nothing. */ () => {
  parse(
    "<b>before<table><caption>caption</caption></table>after</b>",
    /** Reads actual node attributes after native lifecycle restoration. @param reader - Native importer. @param doc - Actual graph. @returns Nothing. */ (
      reader,
      doc,
    ) => {
      const table = reader.tables[0];
      assert(table);
      const first = captions(doc, table)[0],
        body = doc.paragraphs[0];
      assert(first && body);
      expect(first.GetText()).toBe("caption");
      expect(body.GetText()).toBe("beforeafter");
      expect((first.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(W.WEIGHT_NORMAL);
      expect((body.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(W.WEIGHT_BOLD);
    },
  );
});
it("reads actual UTF8 caption bytes and restores text insertion to the saved body position", /** Source stream decoding is independent of input string length and caption section ownership. @returns Nothing. */ () => {
  parse(
    "до<table><caption>Текст 漢字 😃</caption></table>после",
    /** Reads real decoded native text. @param reader - Actual importer. @param doc - Actual graph. @returns Nothing. */ (
      reader,
      doc,
    ) => {
      const table = reader.tables[0];
      assert(table);
      expect(captions(doc, table)[0]?.GetText()).toBe("Текст 漢字 😃");
      expect(doc.paragraphs[0]?.GetText()).toBe("допосле");
    },
  );
});

/** @fileoverview Genuine HTML byte-stream imports cover original Writer block transitions and script-dependent inline ranges across paragraph boundaries. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { FontItalic } from "../../../../tools/inc/fontenum";
import {
  RES_CHRATR_POSTURE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CTL_POSTURE,
  RES_LINENUMBER,
} from "../../../inc/hintids";
import {
  RES_CHRATR_WEIGHT,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_WEIGHT,
} from "../../../inc/hintids";
import { SwHTMLParser } from "./swhtml";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvParserState } from "../../../../svtools/inc/svparser";
import { HtmlTokenId } from "../../../../svtools/inc/htmltokn";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

/** Imports through actual tokenizer/context/attribute/model owners and releases them after semantic assertions. @param input - Original HTML bytes. @param inspect - Document assertions. @returns Nothing. */
function inspectHtml(input: string, inspect: (doc: SwDoc) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(
    doc,
    pam,
    new SvStream(OUStringToOString(input, RTL_TEXTENCODING_UTF8), RTL_TEXTENCODING_UTF8),
  );
  try {
    expect(parser.CallParser()).toBe(SvParserState.Accepted);
    inspect(doc);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
/** Derived consumer invokes the original token handler before caller interruption; no parser state is injected. */
class InterruptedConsumer extends SwHTMLParser {
  /** Interrupts at the original virtual consumer boundary after actual text insertion. @param token - Real filtered stream token. @returns Nothing. */
  protected override NextToken(token: HtmlTokenId): void {
    super.NextToken(token);
    if (token === HtmlTokenId.TEXTTOKEN) throw new Error("caller interrupted HTML import");
  }
}
it.each([false, true])(
  "releases actual unfinished nested inline owners and restores HTML_MODE=%s after a consumer interruption",
  /** The actual scanner produces tokens and all original handlers run; the caller aborts before closing tags so parser destruction must release live attribute chains. @param initial - Original document mode. @returns Nothing. */ (
    initial,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    doc.GetDocumentSettingManager().set("HTML_MODE", initial);
    const position = new SwPosition(node),
      pam = new SwPaM(position);
    position.Dispose();
    const parser = new InterruptedConsumer(
      doc,
      pam,
      new SvStream(
        OUStringToOString("<b><i><b>payload</b></i></b>", RTL_TEXTENCODING_UTF8),
        RTL_TEXTENCODING_UTF8,
      ),
    );
    try {
      expect(
        /** Invokes the actual original stream/token/context pipeline. @returns Native parser completion if the caller fails to interrupt. */ () =>
          parser.CallParser(),
      ).toThrow("caller interrupted HTML import");
      expect(node.GetText()).toBe("payload");
      expect(parser.m_aContexts.length).toBe(3);
    } finally {
      parser.SourceDispose();
      expect(parser.m_aContexts).toHaveLength(0);
      for (const head of Object.values(parser.m_xAttrTab)) expect(head[0]).toBeNull();
      expect(doc.GetDocumentSettingManager().get("HTML_MODE")).toBe(initial);
      pam.Dispose();
      doc.Dispose();
    }
  },
);
it.each([false, true])(
  "creates the original internal sender style in HTML_MODE=%s",
  /** Original DocumentStylePoolManager.cxx1005 gives HTML all-script italic, ordinary documents3pt lower spacing, and both branches disable line counting. @param htmlMode - Original document setting. @returns Nothing. */ (
    htmlMode,
  ) => {
    const doc = new SwDoc();
    try {
      doc.GetDocumentSettingManager().set("HTML_MODE", htmlMode);
      const sender = doc.GetTextFormatColl("sender"),
        items = sender.GetAttrSet();
      expect(sender.GetULSpace().GetLower()).toBe(htmlMode ? 0 : 60);
      expect((items.Get(RES_LINENUMBER) as SfxBoolItem).GetValue()).toBe(false);
      for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
        expect((items.Get(which) as SvxPostureItem).GetPosture()).toBe(
          htmlMode ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE,
        );
      expect(doc.GetTextFormatColl("sender")).toBe(sender);
    } finally {
      doc.Dispose();
    }
  },
);
it.each([
  ["<p>A<address>B</address>C", ["A", "B", "C"]],
  ["<p>A<center>B</center>C", ["A", "B", "C"]],
  ["<p>A<blockquote>B</blockquote>C", ["A", "B", "C"]],
  ["<pre>A<br>B</pre>", ["A", "B"]],
  ["<listing>A\nB</listing>", ["A", "B"]],
  ["<xmp>A\nB</xmp>", ["A", "B"]],
  ["<p>A<pre>B\nC</pre>D", ["A", "B", "C", "D"]],
  ["<h1>A<h2>B</h2>C</h1>", ["A", "B", "C"]],
  ["<address>A</address><address>B</address>", ["A", "B"]],
] as const)(
  "preserves original block boundaries for %s",
  /** Block tags exercise paragraph termination and source append modes rather than browser DOM normalization. @param input - Original HTML. @param expected - Expected Writer paragraphs. @returns Nothing. */ (
    input,
    expected,
  ) =>
    inspectHtml(
      input,
      /** Reads genuine text nodes produced by the parser. @param doc - Actual Writer model. @returns Nothing. */
      (doc) =>
        expect(
          doc.paragraphs.map(
            /** Observes native paragraph content. @param node - Text node. @returns Text. */
            (node) => node.GetText(),
          ),
        ).toEqual(expected),
    ),
);
it("retains script-dependent bold through block splits and closes it before following text", /** Original AppendTextNode splits all3 script attribute chains using the real break iterator; following text must not inherit an ended attribute. @returns Nothing. */ () => {
  inspectHtml(
    "<b>A漢ب<p>C漢ب</p>D漢ب</b>E",
    /** Verifies actual text and effective model attributes without manufacturing attribute chains. @param doc - Actual Writer model. @returns Nothing. */
    (doc) => {
      expect(
        doc.paragraphs.map(
          /** Observes the native block output. @param node - Text node. @returns Text. */
          (node) => node.GetText(),
        ),
      ).toEqual(["A漢ب", "C漢ب", "D漢بE"]);
      for (const node of doc.paragraphs)
        for (let index = 0; index < node.GetText().length; ++index) {
          const character = node.GetText()[index],
            which =
              character === "漢"
                ? RES_CHRATR_CJK_WEIGHT
                : character === "ب"
                  ? RES_CHRATR_CTL_WEIGHT
                  : RES_CHRATR_WEIGHT,
            items = new SfxItemSet(doc.GetAttrPool(), [[which, which]]);
          try {
            node.GetParaAttr(items, index, index + 1);
            expect((items.Get(which) as SvxWeightItem).GetBoolValue(), character).toBe(
              character !== "E",
            );
          } finally {
            items.Dispose();
          }
        }
    },
  );
});
it("retains the actual HTML sender style through Worker document snapshots", /** Source ADDRESS selects the internal sender pool rather than substituting a body style; the existing codec must retain its source identity and HTML posture. @returns Nothing. */ () => {
  inspectHtml(
    "<address>A</address><p>B</p>",
    /** Observes both imported and restored document-owned styles. @param doc - Actual imported model. @returns Nothing. */
    (doc) => {
      expect(doc.paragraphs[0]?.GetTextFormatColl().id).toBe("sender");
      const restored = decodeWriterDocument(encodeWriterDocument(doc));
      try {
        expect(restored.paragraphs[0]?.GetTextFormatColl().id).toBe("sender");
        expect(restored.paragraphs[1]?.GetTextFormatColl().id).toBe("text-body");
        for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
          expect(
            (
              restored.GetTextFormatColl("sender").GetAttrSet().Get(which) as SvxPostureItem
            ).GetPosture(),
          ).toBe(FontItalic.ITALIC_NORMAL);
      } finally {
        restored.Dispose();
      }
    },
  );
});

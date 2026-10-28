/** @fileoverview Actual native HTML token-to-Writer insertion and Markdown HTML-block integration, independent of browser clipboard DOM adapters. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvParserState } from "../../../../svtools/inc/svparser";
import { SwHTMLParser } from "./swhtml";
import { MarkdownReader } from "../md/swmd";
import { FontStrikeout, FontWeight } from "../../../../tools/inc/fontenum";
import {
  RES_CHRATR_WEIGHT,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_WEIGHT,
} from "../../../inc/hintids";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual documents after each case. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Reads HTML into the same blank paragraph insertion profile used by Markdown. @param html - Native UTF16 source. @returns Actual document. */
function html(html: string): SwDoc {
  const doc = new SwDoc();
  docs.push(doc);
  const node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(
    doc,
    pam,
    new SvStream(OUStringToOString(html, RTL_TEXTENCODING_UTF8), RTL_TEXTENCODING_UTF8),
  );
  try {
    expect(parser.CallParser()).toBe(SvParserState.Accepted);
    return doc;
  } finally {
    parser.SourceDispose();
    pam.Dispose();
  }
}
/** Reads real text nodes rather than an intermediate HTML tree. @param doc - Model. @returns Text. */
function text(doc: SwDoc) {
  return doc.paragraphs.map(
    /** Reads body text. @param node - Node. @returns Text. */ (node) => node.GetText(),
  );
}
it("maps native paragraphs, whitespace, entities and hard line breaks", /** Original HTMLParser performs tokenization and whitespace folding. @returns Nothing. */ () => {
  expect(text(html("<p>  A   B&nbsp; &amp; C<br>D</p><p>E</p>"))).toEqual([
    "A B\u00a0 & C\nD",
    "E",
  ]);
});
it("retains nested inline ownership across paragraph boundaries", /** Deferred heads split real text ranges without leaking after closing tags. @returns Nothing. */ () => {
  const doc = html("<b>A<i>B</i><p>C</p>D</b>E");
  expect(text(doc)).toEqual(["AB", "C", "DE"]);
  expect(
    doc.paragraphs.map(
      /** Reads actual effective run items. @param node - Node. @returns Runs. */ (node) =>
        projectWriterTextRuns(node).map(
          /** Exposes formatting per native range. @param run - Run. @returns Text/bold/italic. */ (
            run,
          ) => [run.text, run.attributes.bold, run.attributes.italic],
        ),
    ),
  ).toEqual([
    [
      ["A", true, false],
      ["B", true, true],
    ],
    [["C", true, false]],
    [
      ["D", true, false],
      ["E", false, false],
    ],
  ]);
});
it("preserves native deleted/inserted aliases and HTML escapement height", /** HTML uses80percent rather than the RTF default58. @returns Nothing. */ () => {
  const doc = html("<del>A</del><ins>B</ins><sup>C</sup><sub>D</sub>E"),
    node = doc.paragraphs[0];
  assert(node);
  const runs = projectWriterTextRuns(node);
  expect(runs[0]?.attributes.strikeout).toBe(FontStrikeout.STRIKEOUT_SINGLE);
  expect(runs[1]?.attributes.underline).toBe(true);
  expect(runs[2]?.attributes.escapement).toEqual({ offset: 33, height: 80 });
  expect(runs[3]?.attributes.escapement).toEqual({ offset: -8, height: 80 });
  expect(runs[4]?.attributes.underline).toBe(false);
});
it("splits native Western CJK and CTL bold attributes by actual UTF16 script ranges", /** EndAttr uses the represented native BreakIteratorImpl rather than applying one Western property to all scripts. @returns Nothing. */ () => {
  const doc = html("<b>A漢ب</b>"),
    node = doc.paragraphs[0];
  assert(node);
  const map = node.GetpSwpHints();
  assert(map);
  const effective = node.GetSwAttrSet();
  const all = projectWriterTextRuns(node);
  expect(
    all.map(/** Reads native text. @param run - Run. @returns Text. */ (run) => run.text).join(""),
  ).toBe("A漢ب");
  // Actual UNO cursor lookup merges each script-specific pooled item at its range.
  const model = new SwXTextDocument(doc),
    cursor = model.getText().createTextCursor();
  try {
    for (const [offset, property] of [
      [0, "CharWeight"],
      [1, "CharWeightAsian"],
      [2, "CharWeightComplex"],
    ] as const) {
      cursor.gotoStart(false);
      cursor.goRight(offset, false);
      cursor.goRight(1, true);
      const name = unicode(property);
      const value = cursor.getPropertyValue(name),
        weight: [number] = [0];
      try {
        expect(value.extract(weight, "float")).toBe(true);
        expect(weight[0]).toBe(150);
      } finally {
        value.dispose();
        name.dispose();
      }
    }
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      expect((effective.Get(which) as SvxWeightItem).GetWeight()).toBe(FontWeight.WEIGHT_NORMAL);
  } finally {
    cursor.dispose();
    model.dispose();
  }
});
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
it("uses native heading, quotation and preformatted paragraph pools", /** Closing a mismatched heading still finds the last native heading context. @returns Nothing. */ () => {
  const doc = html("<h2>Heading</h6><blockquote>Quote</blockquote><pre>A  B\nC</pre>");
  expect(text(doc)).toEqual(["Heading", "Quote", "A  B", "C"]);
  expect(
    doc.paragraphs.map(
      /** Reads source pool identity. @param node - Node. @returns Style ID. */ (node) =>
        node.GetTextFormatColl().id,
    ),
  ).toEqual(["heading-2", "quotations", "preformatted-text", "preformatted-text"]);
});
it("imports ordinary Markdown HTML blocks through the native reader and real worker codec", /** This is the production path that previously threw before returning a document. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString(
      "before\n\n<div><b>bold</b> &amp; plain</div>\n\nafter",
      RTL_TEXTENCODING_UTF8,
    ),
  );
  docs.push(doc);
  expect(text(doc).filter(Boolean)).toEqual(["before", "bold & plain", "after"]);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  expect(text(restored)).toEqual(text(doc));
  const middle = restored.paragraphs.find(
    /** Finds the imported native HTML paragraph. @param node - Node. @returns Match. */ (node) =>
      node.GetText().startsWith("bold"),
  );
  assert(middle);
  expect(projectWriterTextRuns(middle)[0]?.attributes.bold).toBe(true);
});
it("ignores native title script style and comment content without a browser DOM", /** Metadata and executable source do not become document text. @returns Nothing. */ () => {
  expect(
    text(
      html(
        "<title>title</title><script>ignored <b>code</b></script><!-- comment --><style>p{color:red}</style><p>body</p>",
      ),
    ),
  ).toEqual(["body"]);
});

import { unicode } from "../../core/unocore/unocrsrhelper";

/** Opens the actual parser at an existing text range for pending-attribute scenarios. @param value - Text. @param run - Scenario. @returns Nothing. */
function attributes(value: string, run: (doc: SwDoc, parser: SwHTMLParser) => void): void {
  const doc = new SwDoc();
  docs.push(doc);
  const node = doc.paragraphs[0];
  assert(node);
  node.SetText(value);
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8));
  try {
    run(doc, parser);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
  }
}
it("applies nested deferred attributes with native DONTREPLACE precedence", /** Outer whole-paragraph properties and inner ranged resets keep their original owners and order. @returns Nothing. */ () => {
  attributes(
    "abc",
    /** Applies the actual pending-range scenario. @param doc - Model. @param parser - Actual parser state. @returns Nothing. */ (
      doc,
      parser,
    ) => {
      parser.NewStdAttr(T.BOLD_ON, [
        [parser.m_xAttrTab.pBold, new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT)],
      ]);
      parser.m_pPam.GetPoint().SetContent(1);
      parser.NewStdAttr(T.BOLD_ON, [
        [parser.m_xAttrTab.pBold, new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT)],
      ]);
      parser.m_pPam.GetPoint().SetContent(2);
      parser.EndTag(T.BOLD_OFF);
      parser.m_pPam.GetPoint().SetContent(3);
      parser.EndTag(T.BOLD_OFF);
      parser.SetAttr(false);
      expect(
        projectWriterTextRuns(doc.paragraphs[0]).map(
          /** Reads actual format ranges. @param value - Run. @returns Text and weight. */ (
            value,
          ) => [value.text, value.attributes.bold],
        ),
      ).toEqual([
        ["a", true],
        ["b", false],
        ["c", true],
      ]);
      expect(parser.m_aSetAttrTab).toHaveLength(0);
    },
  );
});
it("waits until a pending end is behind the cursor before early application", /** Native SetAttr(true) leaves the boundary untouched until the next actual character arrives. @returns Nothing. */ () => {
  attributes(
    "a",
    /** Applies the actual early-flush scenario. @param doc - Model. @param parser - Actual parser state. @returns Nothing. */ (
      doc,
      parser,
    ) => {
      parser.NewStdAttr(T.BOLD_ON, [
        [parser.m_xAttrTab.pBold, new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT)],
      ]);
      parser.m_pPam.GetPoint().SetContent(1);
      parser.EndTag(T.BOLD_OFF);
      parser.SetAttr();
      expect(parser.m_aSetAttrTab).toHaveLength(1);
      doc.GetDocumentContentOperationsManager().InsertString(parser.m_pPam, "b");
      parser.SetAttr();
      expect(
        projectWriterTextRuns(doc.paragraphs[0]).map(
          /** Reads actual format ranges. @param value - Run. @returns Text and weight. */ (
            value,
          ) => [value.text, value.attributes.bold],
        ),
      ).toEqual([
        ["a", true],
        ["b", false],
      ]);
    },
  );
});
it("clamps raw attribute boundaries after native text erasure", /** Deferred HTML offsets are raw integers, while the actual parser PaM follows the content-index owner. @returns Nothing. */ () => {
  attributes(
    "abc",
    /** Applies the actual pending-range scenario. @param doc - Model. @param parser - Actual parser state. @returns Nothing. */ (
      doc,
      parser,
    ) => {
      parser.NewStdAttr(T.BOLD_ON, [
        [parser.m_xAttrTab.pBold, new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT)],
      ]);
      parser.m_pPam.GetPoint().SetContent(3);
      parser.EndTag(T.BOLD_OFF);
      const node = doc.paragraphs[0];
      assert(node);
      node.EraseText(1, 2);
      parser.SetAttr(false);
      expect(node.GetText()).toBe("a");
      expect(projectWriterTextRuns(node)[0]?.attributes.bold).toBe(true);
    },
  );
});
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";

it("preserves the native buffered-inline-HTML effect on a later raw block", /** WRITER155 deliberately keeps inline HTML buffered until a block exit invokes the HTML reader. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString("start <b>x\n\n<div>y</div>", RTL_TEXTENCODING_UTF8),
  );
  docs.push(doc);
  expect(text(doc)).toEqual(["start x", "y"]);
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(false);
  expect(projectWriterTextRuns(doc.paragraphs[1])[0]?.attributes.bold).toBe(true);
});

it.each([false, true])(
  "restores the actual document HTML_MODE flag after insertion when it was %s",
  /** Native parser construction selects HTML pool defaults transiently and its destructor restores the original flag. @param initial - Existing document mode. @returns Nothing. */ (
    initial,
  ) => {
    const doc = new SwDoc();
    docs.push(doc);
    doc.GetDocumentSettingManager().set("HTML_MODE", initial);
    const node = doc.paragraphs[0];
    assert(node);
    const position = new SwPosition(node),
      pam = new SwPaM(position);
    position.Dispose();
    const parser = new SwHTMLParser(
      doc,
      pam,
      new SvStream(
        OUStringToOString("<h2>heading</h2>", RTL_TEXTENCODING_UTF8),
        RTL_TEXTENCODING_UTF8,
      ),
    );
    try {
      expect(doc.GetDocumentSettingManager().get("HTML_MODE")).toBe(true);
      expect(parser.CallParser()).toBe(SvParserState.Accepted);
    } finally {
      parser.SourceDispose();
      pam.Dispose();
    }
    expect(doc.GetDocumentSettingManager().get("HTML_MODE")).toBe(initial);
  },
);

it("retains explicit paragraph alignment, native duplicate-option precedence and center contexts", /** An explicit inherited-default value must survive later style edits. @returns Nothing. */ () => {
  const doc = html(
    '<p align="LEFT" align="right">left</p><center><p>center</p></center><p align="justify">justified</p>',
  );
  expect(text(doc)).toEqual(["left", "center", "justified"]);
  expect(
    doc.paragraphs.map(
      /** Reads actual paragraph adjustment. @param node - Node. @returns Alignment. */ (node) =>
        node.GetParagraphAlignment(),
    ),
  ).toEqual(["left", "center", "justify"]);
  const first = doc.paragraphs[0];
  assert(first);
  const item = new SvxAdjustItem(SvxAdjust.Block, RES_PARATR_ADJUST);
  try {
    first.GetTextFormatColl().SetFormatAttr(item);
  } finally {
    item.Dispose();
  }
  expect(first.GetParagraphAlignment()).toBe("left");
});
import { SvxAdjustItem, SvxAdjust } from "../../../../editeng/inc/adjustitem";
import { RES_PARATR_ADJUST } from "../../../inc/hintids";
it("applies native semantic styles and restores them after closing tags", /** Actual character-format hints drive the existing text projection. @returns Nothing. */ () => {
  const doc = html("<strong>A</strong><em>B</em><cite>C</cite>D");
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads effective native character properties. @param run - Native run. @returns Observable attributes. */ (
        run,
      ) => [run.text, run.attributes.bold, run.attributes.italic],
    ),
  ).toEqual([
    ["A", true, false],
    ["BC", false, true],
    ["D", false, false],
  ]);
});
it("lets native CSS override tag defaults without leaking to following text", /** Declarations become actual pooled attributes before deferred insertion. @returns Nothing. */ () => {
  const doc = html(
    '<b style="font-weight: normal; font-style: italic">A</b><span style="font-weight: 700; text-decoration: underline">B</span>C',
  );
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads actual native run properties. @param run - Run. @returns Visible effects. */ (
        run,
      ) => [run.text, run.attributes.bold, run.attributes.italic, run.attributes.underline],
    ),
  ).toEqual([
    ["A", false, true, false],
    ["B", true, false, true],
    ["C", false, false, false],
  ]);
});
it("retains direct CSS precedence over semantic style inheritance", /** Character format and direct items use separate native queues. @returns Nothing. */ () => {
  const doc = html('<strong style="font-weight: normal">A<em>B</em>C</strong>D');
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads actual effective formatting. @param run - Run. @returns Native result. */ (run) => [
        run.text,
        run.attributes.bold,
        run.attributes.italic,
      ],
    ),
  ).toEqual([
    ["A", false, false],
    ["B", false, true],
    ["CD", false, false],
  ]);
});
it("uses configured native CSS font sizes and ignores percentage height insertion", /** The native InsertAttrs branch only admits absolute height items. @returns Nothing. */ () => {
  const doc = html(
    '<span style="font-size: xx-small">A</span><span style="font-size: 150%">B</span><span style="font-size: 18pt">C</span>',
  );
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads font height through the existing browser projection. @param run - Run. @returns Text and point size. */ (
        run,
      ) => [run.text, run.attributes.fontSizeTwips],
    ),
  ).toEqual([
    ["A", 140],
    ["B", undefined],
    ["C", 360],
  ]);
});
it("passes inline CSS through the real Markdown HTML insertion caller", /** Raw HTML callbacks invoke the native reader, including semantic character styles. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString(
      '<div><strong>A</strong><span style="font-style: italic">B</span></div>',
      RTL_TEXTENCODING_UTF8,
    ),
  );
  docs.push(doc);
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads actual model formatting. @param run - Run. @returns Text/bold/italic. */ (run) => [
        run.text,
        run.attributes.bold,
        run.attributes.italic,
      ],
    ),
  ).toEqual([
    ["A", true, false],
    ["B", false, true],
  ]);
});

it("keeps whole-paragraph direct CSS above existing native character styles", /** Native SetAttr must retain range hints when the paragraph already contains a character format. @returns Nothing. */ () => {
  const doc = html('<strong style="font-weight: normal">A</strong>');
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(false);
});
it("preserves the native unknown text-decoration underline fallback", /** No browser CSS validation replaces the pinned property handler. @returns Nothing. */ () => {
  const doc = html('<span style="text-decoration: unknown">A</span>B');
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads effective underline. @param run - Run. @returns Text and flag. */ (run) => [
        run.text,
        run.attributes.underline,
      ],
    ),
  ).toEqual([
    ["A", true],
    ["B", false],
  ]);
});

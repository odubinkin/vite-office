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
import { HtmlTokenId } from "../../../../svtools/inc/htmltokn";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONTSIZE,
} from "../../../inc/hintids";
import { RES_CHRATR_FONTSIZE } from "../../../inc/hintids";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import {
  SvxTextLeftMarginItem,
  SvxRightMarginItem,
  SvxFirstLineIndentItem,
} from "../../../../editeng/inc/lrspitem";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_RIGHT,
  RES_UL_SPACE,
  RES_BACKGROUND,
} from "../../../inc/hintids";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxLineSpaceRule, SvxInterLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { toTwips, Length } from "../../../../o3tl/inc/unit_conversion";
import { RES_CHRATR_FONT, RES_PARATR_LINESPACING } from "../../../inc/hintids";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
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
/** Reads HTML into the same blank paragraph insertion profile used by Markdown. @param html - Native UTF16 source. @param doc - Optional actual insertion document. @returns Actual document. */
function html(html: string, doc = new SwDoc()): SwDoc {
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
it("imports native CSS family lists without browser family substitution", /** Family, pitch and charset live on original pooled font items. @returns Nothing. */ () => {
  const doc = html(
    '<span style="font-family: Times New Roman, &quot;Noto Sans&quot;, serif">A</span>B',
  );
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads source font names and restoration. @param run - Run. @returns Font names. */ (
        run,
      ) => [run.text, run.attributes.fontFamily],
    ),
  ).toEqual([
    ["A", "Times New Roman;Noto Sans;serif"],
    ["B", undefined],
  ]);
  const item = doc.paragraphs[0]?.GetCharacterItemsAt(0).Get(RES_CHRATR_FONT);
  assert(item instanceof SvxFontItem);
  expect([item.GetFamily(), item.GetPitch(), item.GetStyleName(), item.GetCharSet()]).toEqual([
    FontFamily.FAMILY_DONTKNOW,
    FontPitch.PITCH_DONTKNOW,
    "",
    RTL_TEXTENCODING_UTF8,
  ]);
});
it("applies native font shorthand resets, family and absolute height", /** Original declaration order overrides preceding explicit font properties. @returns Nothing. */ () => {
  const doc = html(
    '<span style="font-weight: bold; font-style: italic; font: 18pt Example Font, monospace">A</span><span style="font: italic 700 16px Other Font">B</span>C',
  );
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads the actual character items after shorthand. @param run - Run. @returns Font/weight/posture/height. */ (
        run,
      ) => [
        run.text,
        run.attributes.bold,
        run.attributes.italic,
        run.attributes.fontSizeTwips,
        run.attributes.fontFamily,
      ],
    ),
  ).toEqual([
    ["A", false, false, 360, "Example Font;monospace"],
    ["B", true, true, 240, "Other Font"],
    ["C", false, false, undefined, undefined],
  ]);
});
it("retains native shorthand partial writes before a missing family", /** CSS1 font resets before validating the remaining font-family expression. @returns Nothing. */ () => {
  const doc = html('<b><span style="font: 18pt">A</span>B</b>');
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads source partial update rather than applying browser CSS rejection. @param run - Run. @returns Text and weight/height. */ (
        run,
      ) => [run.text, run.attributes.bold, run.attributes.fontSizeTwips],
    ),
  ).toEqual([
    ["A", false, 360],
    ["B", true, undefined],
  ]);
});
it("retains native rejection of keyword sizes in font shorthand", /** The pinned prefix loop consumes identifiers until no size expression remains. @returns Nothing. */ () => {
  const doc = html('<b><span style="font: medium Example">A</span></b>');
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(true);
});
it("retains native empty-string scanning in font-family", /** The native scanner consumes a closing quote as string content before checking its terminator. @returns Nothing. */ () => {
  const doc = html('<span style="font-family: &quot;&quot;, serif">A</span>');
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.fontFamily).toBe('", serif');
});
it("imports the font shorthand slash as native proportional line spacing", /** Original font shorthand calls the native line-height handler. @returns Nothing. */ () => {
  const doc = html('<span style="font: italic 14pt/1.5 Example">A</span>');
  const spacing = doc.paragraphs[0]?.GetAttr(RES_PARATR_LINESPACING);
  assert(spacing instanceof SvxLineSpacingItem);
  expect([
    spacing.GetLineSpaceRule(),
    spacing.GetInterLineSpaceRule(),
    spacing.GetPropLineSpace(),
  ]).toEqual([SvxLineSpaceRule.Auto, SvxInterLineSpaceRule.Prop, 150]);
});
it("uses the native minimum line height and ignores normal after explicit height", /** Length line-height is minimum spacing; normal emits no resetting item in this handler. @returns Nothing. */ () => {
  const doc = html('<span style="line-height: 1pt; line-height: normal">A</span>');
  const spacing = doc.paragraphs[0]?.GetAttr(RES_PARATR_LINESPACING);
  assert(spacing instanceof SvxLineSpacingItem);
  expect([spacing.GetLineSpaceRule(), spacing.GetLineHeight()]).toEqual([
    SvxLineSpaceRule.Min,
    Number(toTwips(25n, Length.mm10)),
  ]);
});
it("keeps stylesheets inert in the actual existing-document Markdown insertion path", /** Native SwCSS1Parser.StyleParsed exits when m_bIsNewDoc is false. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString(
      '<style>.x { font-weight: bold } strong { font-style: italic }</style>\n\n<div><span class="x">A</span><strong>B</strong></div>',
      RTL_TEXTENCODING_UTF8,
    ),
  );
  docs.push(doc);
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads actual model styles after discarded stylesheet content. @param run - Run. @returns Weight/posture. */ (
        run,
      ) => [run.text, run.attributes.bold, run.attributes.italic],
    ),
  ).toEqual([
    ["A", false, false],
    ["B", true, false],
  ]);
});
it("transports Markdown raw HTML font items through the actual Worker codec", /** Native family and shorthand items survive the existing UI transport. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString(
      '<div><span style="font: italic bold 18pt Example Font">A</span></div>',
      RTL_TEXTENCODING_UTF8,
    ),
  );
  docs.push(doc);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  expect(projectWriterTextRuns(restored.paragraphs[0])[0]?.attributes).toMatchObject({
    fontFamily: "Example Font",
    fontSizeTwips: 360,
    bold: true,
    italic: true,
  });
});
it("applies direct font, line-height and adjustment to native HTML paragraphs", /** Block CSS feeds the same actual context and attribute owners as inline CSS. @returns Nothing. */ () => {
  const doc = html('<p style="font: italic 18pt/200% Example; text-align: center">A</p><p>B</p>');
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes).toMatchObject({
    fontFamily: "Example",
    fontSizeTwips: 360,
    italic: true,
  });
  expect(projectWriterTextRuns(doc.paragraphs[1])[0]?.attributes.fontFamily).toBeUndefined();
  expect(doc.paragraphs[0]?.GetParagraphAlignment()).toBe("center");
  const spacing = doc.paragraphs[0]?.GetAttr(RES_PARATR_LINESPACING);
  assert(spacing instanceof SvxLineSpacingItem);
  expect(spacing.GetPropLineSpace()).toBe(200);
});
it("preserves the original ALIGN precedence over paragraph CSS", /** Native NewPara inserts ALIGN after parsing the style attribute. @returns Nothing. */ () => {
  const doc = html('<p align="right" style="text-align: center">A</p>');
  expect(doc.paragraphs[0]?.GetParagraphAlignment()).toBe("right");
});
it("applies existing direct font items to headings and block-style contexts", /** Heading/quote styles remain actual paragraph styles below direct CSS. @returns Nothing. */ () => {
  const doc = html(
    '<h2 style="font: 18pt Heading Font">A</h2><blockquote style="font-family: Quote Font">B</blockquote>',
  );
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.fontFamily).toBe("Heading Font");
  expect(projectWriterTextRuns(doc.paragraphs[1])[0]?.attributes.fontFamily).toBe("Quote Font");
  expect(
    doc.paragraphs.map(
      /** Reads actual style identities. @param node - Native paragraph. @returns Pool style. */ (
        node,
      ) => node.GetTextFormatColl().id,
    ),
  ).toEqual(["heading-2", "quotations"]);
});
it("consumes native white-space flags only at paragraph open", /** NewPara enables preservation and EndPara restores the source default. @returns Nothing. */ () => {
  const doc = html('<p style="white-space: pre">  A   B</p><p>  C   D</p>');
  expect(text(doc)).toEqual(["  A   B", "C D"]);
});
it("imports native FONT face/color/size and restores inherited text", /** Legacy attributes use existing native option conversion and actual item heads. @returns Nothing. */ () => {
  const doc = html('<font face="  Example Font , , Other Font  " color="red" size="5">A</font>B');
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads actual source legacy values. @param run - Run. @returns Family/color/height. */ (
        run,
      ) => [
        run.text,
        run.attributes.fontFamily,
        run.attributes.color,
        run.attributes.fontSizeTwips,
      ],
    ),
  ).toEqual([
    ["A", "Example Font;Other Font", "#ff0000", 360],
    ["B", undefined, undefined, undefined],
  ]);
});
it("resolves relative FONT sizes against BASEFONT rather than the enclosing FONT", /** Native size arithmetic uses separate base/font stacks. @returns Nothing. */ () => {
  const doc = html(
    '<basefont size="4"><font size="7">A<font size="+1">B</font>C</font>D</basefont>E',
  );
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads exact seven-step sizes. @param run - Run. @returns Text/height. */ (run) => [
        run.text,
        run.attributes.fontSizeTwips,
      ],
    ),
  ).toEqual([
    ["A", 720],
    ["B", 360],
    ["C", 720],
    ["D", 280],
    ["E", undefined],
  ]);
});
it("uses native BIG SMALL stack sizes and restores nesting", /** No browser relative-font units replace the configured seven-step table. @returns Nothing. */ () => {
  const doc = html("<big>A<big>B</big><small>C</small>D</big>E");
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads actual font-item heights. @param run - Run. @returns Text/height. */ (run) => [
        run.text,
        run.attributes.fontSizeTwips,
      ],
    ),
  ).toEqual([
    ["A", 280],
    ["B", 360],
    ["C", 240],
    ["D", 280],
    ["E", undefined],
  ]);
});
it("keeps native legacy size clamps and duplicate-option precedence", /** Reverse option iteration lets the first SIZE occurrence win. @returns Nothing. */ () => {
  const doc = html(
    '<font size="-999">A</font><font size="999">B</font><font size="2" size="7">C</font><basefont size="65536">D</basefont>',
  );
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads original narrowing and clamp. @param run - Run. @returns Text/height. */ (run) => [
        run.text,
        run.attributes.fontSizeTwips,
      ],
    ),
  ).toEqual([
    ["A", 140],
    ["B", 720],
    ["C", 200],
    ["D", 140],
  ]);
});
it("lets inline CSS replace legacy FONT and BASEFONT attributes", /** Native style-option branches seed real item sets before CSS declarations. @returns Nothing. */ () => {
  const doc = html(
    '<font face="Old Font" color="red" size="7" style="font: italic 18pt New Font; color: blue">A</font><basefont size="7" style="font-size: 10pt">B</basefont>',
  );
  const runs = projectWriterTextRuns(doc.paragraphs[0]);
  expect(runs[0]?.attributes).toMatchObject({
    fontFamily: "New Font",
    fontSizeTwips: 360,
    italic: true,
    color: "#0000ff",
  });
  expect(runs[1]?.attributes.fontSizeTwips).toBe(200);
});
it("derives heading BIG SMALL sizes from the native heading styles", /** The heading stack marker selects adjacent heading styles before any legacy font nesting. @returns Nothing. */ () => {
  const doc = html("<h2><big>A</big><small>B</small>C</h2>");
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads actual native heights. @param run - Run. @returns Height. */ (run) =>
        run.attributes.fontSizeTwips,
    ),
  ).toEqual([
    (
      doc.GetTextFormatColl("heading-1").GetAttrSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem
    ).GetHeight(),
    (
      doc.GetTextFormatColl("heading-3").GetAttrSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem
    ).GetHeight(),
    (
      doc.GetTextFormatColl("heading-2").GetAttrSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem
    ).GetHeight(),
  ]);
});
it("keeps the source zero-size stack entry for a FONT without SIZE", /** A face-only FONT is still pushed with zero size and affects a nested BIG. @returns Nothing. */ () => {
  const doc = html('<font face="Example"><big>A</big></font>B');
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.fontSizeTwips).toBe(140);
});
it("pops the native size stack even when a font closing token has no matching context", /** EndFontAttr closes by token then independently removes the stack tail. @returns Nothing. */ () => {
  const doc = html('<font size="5">A</big><big>B</big>C</font>D');
  expect(
    projectWriterTextRuns(doc.paragraphs[0]).map(
      /** Reads the resulting source stack behavior. @param run - Run. @returns Height. */ (
        run,
      ) => [run.text, run.attributes.fontSizeTwips],
    ),
  ).toEqual([
    ["A", 360],
    ["B", 280],
    ["C", 360],
    ["D", undefined],
  ]);
});
it("imports legacy FONT through actual Markdown and Worker serialization", /** No DOM/clipboard path is used for Markdown raw HTML. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString(
      '<div><font face="Example, Other" size="5" color="red">A</font></div>',
      RTL_TEXTENCODING_UTF8,
    ),
  );
  docs.push(doc);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  expect(projectWriterTextRuns(restored.paragraphs[0])[0]?.attributes).toMatchObject({
    fontFamily: "Example;Other",
    fontSizeTwips: 360,
    color: "#ff0000",
  });
});
it("applies legacy font metadata to actual Western CJK and CTL ranges", /** Native EndAttr script splitting must retain each represented font item. @returns Nothing. */ () => {
  const doc = html('<font face="Example" size="5">A漢ب</font>'),
    node = doc.paragraphs[0];
  assert(node);
  for (const [offset, which, heightWhich] of [
    [0, RES_CHRATR_FONT, RES_CHRATR_FONTSIZE],
    [1, RES_CHRATR_CJK_FONT, RES_CHRATR_CJK_FONTSIZE],
    [2, RES_CHRATR_CTL_FONT, RES_CHRATR_CTL_FONTSIZE],
  ]) {
    assert(offset !== undefined && which !== undefined && heightWhich !== undefined);
    const items = node.GetCharacterItemsAt(offset);
    items.ClearItem();
    node.GetParaAttr(items, offset, offset + 1);
    try {
      const font = items.Get(which),
        height = items.Get(heightWhich);
      assert(font instanceof SvxFontItem && height instanceof SvxFontHeightItem);
      expect(font.GetFamilyName()).toBe("Example");
      expect(height.GetHeight()).toBe(360);
    } finally {
      items.Dispose();
    }
  }
});
it("retains source legacy font-head wiring independently of CSS insertion", /** This native contract distinguishes shared Western heads from the CSS branch's separate script heads. @returns Nothing. */ () => {
  const snapshots: number[][] = [];
  /** Observes the actual native parser heads without replacing document or attribute owners. */
  class TracedParser extends SwHTMLParser {
    /** Observes actual token dispatch after native font attribute construction. @param token - Native token. @returns Nothing. */
    protected override NextToken(token: HtmlTokenId): void {
      super.NextToken(token);
      if (token === HtmlTokenId.FONT_ON) {
        const row: number[] = [];
        for (let attr = this.m_xAttrTab.pFont[0]; attr; attr = attr.GetNext())
          row.push(attr.GetItem().Which());
        row.push(
          this.m_xAttrTab.pFontCJK[0]?.GetItem().Which() ?? 0,
          this.m_xAttrTab.pFontCTL[0]?.GetItem().Which() ?? 0,
        );
        snapshots.push(row);
      }
    }
  }
  const doc = new SwDoc();
  docs.push(doc);
  const node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new TracedParser(
    doc,
    pam,
    new SvStream(
      OUStringToOString(
        '<font face="Example">A</font><font face="Example" style="color: red">B</font>',
        RTL_TEXTENCODING_UTF8,
      ),
      RTL_TEXTENCODING_UTF8,
    ),
  );
  try {
    expect(parser.CallParser()).toBe(SvParserState.Accepted);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
  }
  expect(snapshots).toEqual([
    [RES_CHRATR_CTL_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_FONT, 0, 0],
    [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT],
  ]);
});
it("imports native paragraph margins, first-line indent and background color", /** CSS declarations become original paragraph items without browser layout parsing. @returns Nothing. */ () => {
  const doc = html(
      '<p style="margin: 1pt 2pt 3pt 4pt; text-indent: -2pt; background-color: red">A</p><p>B</p>',
    ),
    node = doc.paragraphs[0];
  assert(node);
  expect([
    node.GetParagraphTextLeftMargin(),
    node.GetParagraphRightMargin(),
    node.GetParagraphFirstLineIndent(),
  ]).toEqual([80, 40, -40]);
  const spacing = node.GetAttr(RES_UL_SPACE);
  assert(spacing instanceof SvxULSpaceItem);
  expect([spacing.GetUpper(), spacing.GetLower()]).toEqual([20, 60]);
  const brush = node.GetAttr(RES_BACKGROUND);
  assert(brush instanceof SvxBrushItem);
  expect(brush.GetColor().toUInt32()).toBe(0xff0000);
  expect(doc.paragraphs[1]?.GetParagraphTextLeftMargin()).toBe(0);
});
it("accumulates native nested margins and clamps negative contributions at zero", /** Context flags retain signed contributions separately from unsigned margin items. @returns Nothing. */ () => {
  const doc = html(
    '<blockquote style="margin-left: 10pt"><p style="margin-left: -3pt; margin-right: 5pt">A</p><p style="margin-left: -999pt">B</p></blockquote>',
  );
  const base = (
    doc
      .GetTextFormatColl("quotations")
      .GetAttrSet()
      .Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem
  ).ResolveTextLeft();
  expect(doc.paragraphs[0]?.GetParagraphTextLeftMargin()).toBe(base + 200 - 60);
  expect(doc.paragraphs[0]?.GetParagraphRightMargin()).toBe(
    (
      doc.GetTextFormatColl("quotations").GetAttrSet().Get(RES_MARGIN_RIGHT) as SvxRightMarginItem
    ).ResolveRight() + 100,
  );
  expect(doc.paragraphs[1]?.GetParagraphTextLeftMargin()).toBe(0);
});
it("preserves the opposite native spacing side when only one CSS margin is present", /** Native GetULSpaceFromContext supplies unspecified top/bottom values. @returns Nothing. */ () => {
  const doc = html('<p style="margin-top: 2pt">A</p><p style="margin-bottom: 3pt">B</p>');
  const body = doc.GetTextFormatColl("text-body").GetULSpace();
  const first = doc.paragraphs[0]?.GetAttr(RES_UL_SPACE),
    second = doc.paragraphs[1]?.GetAttr(RES_UL_SPACE);
  assert(first instanceof SvxULSpaceItem && second instanceof SvxULSpaceItem);
  expect([first.GetUpper(), first.GetLower()]).toEqual([40, body.GetLower()]);
  expect([second.GetUpper(), second.GetLower()]).toEqual([body.GetUpper(), 60]);
});
it("retains native margin shorthand partial application and ignored bare zero", /** Unsupported tokens consume a shorthand position but do not roll back earlier sides. @returns Nothing. */ () => {
  const doc = html('<p style="margin: 1pt auto 3pt; margin-left: 0">A</p>'),
    node = doc.paragraphs[0];
  assert(node);
  expect(node.GetParagraphTextLeftMargin()).toBe(20);
  expect(node.GetParagraphRightMargin()).toBe(20);
  const spacing = node.GetAttr(RES_UL_SPACE);
  assert(spacing instanceof SvxULSpaceItem);
  expect([spacing.GetUpper(), spacing.GetLower()]).toEqual([20, 60]);
});
it("restores native paragraph background and keeps text highlight separate", /** Paragraph brush and character highlight are distinct source Which families. @returns Nothing. */ () => {
  const doc = html('<p style="background-color: blue; background-color: transparent">A</p>');
  const brush = doc.paragraphs[0]?.GetAttr(RES_BACKGROUND);
  assert(brush instanceof SvxBrushItem);
  expect(brush.GetColor().toUInt32() >>> 24).toBe(255);
  expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.highlight).toBeUndefined();
});
it("transports actual Markdown paragraph layout and brush through Worker snapshots", /** Production Markdown HTML insertion uses existing native items and the existing codec. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString(
      '<p style="margin-left: 12pt; margin-bottom: 4pt; background-color: #123456">A</p>',
      RTL_TEXTENCODING_UTF8,
    ),
  );
  docs.push(doc);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  expect(restored.paragraphs[0]?.GetParagraphTextLeftMargin()).toBe(240);
  const brush = restored.paragraphs[0]?.GetAttr(RES_BACKGROUND);
  assert(brush instanceof SvxBrushItem);
  expect(brush.GetColor().toUInt32()).toBe(0x123456);
});

it("retains native inherited automatic first-line state when CSS changes other margins", /** SetTextCollAttrs copies the style items before adjusting their metric fields. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = new SvxFirstLineIndentItem(RES_MARGIN_FIRSTLINE);
  first.SetAutoFirst(true);
  try {
    doc.GetTextFormatColl("text-body").SetFormatAttr(first);
  } finally {
    first.Dispose();
  }
  html('<p style="margin-left: 5pt">A</p>', doc);
  const item = doc.paragraphs[0]?.GetAttr(RES_MARGIN_FIRSTLINE);
  assert(item instanceof SvxFirstLineIndentItem);
  expect(item.IsAutoFirst()).toBe(true);
});
it("retains source text-indent length clamping versus pixel signed narrowing", /** Equivalent physical lengths take different native conversion branches. @returns Nothing. */ () => {
  const doc = html('<p style="text-indent: 2250pt">A</p><p style="text-indent: 3000px">B</p>');
  expect(
    doc.paragraphs.map(
      /** Reads original signed first-line items. @param node - Native paragraph. @returns Signed twips. */ (
        node,
      ) =>
        (node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).ResolveTextFirstLineOffset(),
    ),
  ).toEqual([32767, -20536]);
});

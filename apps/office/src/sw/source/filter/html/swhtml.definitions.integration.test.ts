/** @fileoverview Native definition-list tokens, source pool defaults, nested block attribution and Markdown document IO on real Writer owners. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SwHTMLParser } from "./swhtml";
import { MarkdownReader } from "../md/swmd";
import { SwMDWriter } from "../md/wrtmd";
import { SwTextNode, projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT, RES_UL_SPACE } from "../../../inc/hintids";
import {
  SvxTextLeftMarginItem,
  SvxRightMarginItem,
  SvxIndentValue,
} from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import {
  SwPoolFormatId as P,
  getWriterAvailableParagraphStyleDefinition,
} from "../../../inc/poolfmt";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual document and style owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Reads actual HTML at the same document insertion boundary as Markdown. @param source - HTML bytes as Unicode. @param prepare - Optional real model setup. @param setup - Optional original parser operations before reading. @returns Actual document. */
function html(
  source: string,
  prepare?: (doc: SwDoc) => void,
  setup?: (parser: SwHTMLParser) => void,
): SwDoc {
  const doc = new SwDoc();
  docs.push(doc);
  prepare?.(doc);
  const first = doc.paragraphs[0];
  assert(first);
  const position = new SwPosition(first),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(
    doc,
    pam,
    new SvStream(OUStringToOString(source, RTL_TEXTENCODING_UTF8), RTL_TEXTENCODING_UTF8),
  );
  try {
    setup?.(parser);
    parser.CallParser();
    return doc;
  } finally {
    parser.SourceDispose();
    pam.Dispose();
  }
}
/** Finds one actual paragraph by its unique text. @param doc - Native model. @param text - Expected text. @returns Actual node. */
function paragraph(doc: SwDoc, text: string): SwTextNode {
  const found = doc.paragraphs.find(
    /** Matches actual text. @param node - Native node. @returns Match. */ (node) =>
      node.GetText() === text,
  );
  assert(found, `Missing ${text}`);
  return found;
}
/** Reads the actual effective left-margin item. @param node - Native node. @returns Twips. */
function left(node: SwTextNode): number {
  return (node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft();
}
it("materializes the original DD/DT pool defaults, parents and follow identity", /** Existing complete metadata is admitted internally, without adding an unrelated style-menu feature. @returns Nothing. */ () => {
  const doc = html("<dl><dt>term<dd>description</dl>");
  const term = paragraph(doc, "term").GetTextFormatColl(),
    description = paragraph(doc, "description").GetTextFormatColl();
  expect(term.GetPoolFormatId()).toBe(P.COLL_HTML_DT);
  expect(description.GetPoolFormatId()).toBe(P.COLL_HTML_DD);
  expect(term.id).toBe("list-heading");
  expect(description.id).toBe("list-contents");
  expect(term.DerivedFrom()).toBe(doc.GetTextFormatColl("default"));
  expect(description.DerivedFrom()).toBe(doc.GetTextFormatColl("default"));
  expect(term.GetNextTextFormatColl()).toBe(description);
  expect(description.GetNextTextFormatColl()).toBe(description);
  expect(left(paragraph(doc, "term"))).toBe(0);
  expect(left(paragraph(doc, "description"))).toBe(567);
  expect(getWriterAvailableParagraphStyleDefinition("list-contents")).toBeUndefined();
});
it("maps implicit DT/DD ends and returns following text to the body style", /** New item tokens close the prior matching context and create real paragraph boundaries. @returns Nothing. */ () => {
  const doc = html("<dl><dt>term<dd>definition<dt>next<dd>description</dl><p>tail</p>");
  expect(
    doc.paragraphs.map(
      /** Reads original text. @param node - Native node. @returns Text. */ (node) =>
        node.GetText(),
    ),
  ).toEqual(["term", "definition", "next", "description", "tail"]);
  expect(paragraph(doc, "tail").GetTextFormatColl().id).toBe("text-body");
  expect(paragraph(doc, "tail").GetNumRule()).toBeUndefined();
});
it("does not append a paragraph solely for explicit DT/DD closing tokens", /** Original explicit item end closes attributes while subsequent ordinary text can remain in the same paragraph. @returns Nothing. */ () => {
  const doc = html("<dl><dt>term</dt>rest<dd>definition</dd>tail</dl>");
  expect(paragraph(doc, "termrest").GetTextFormatColl().id).toBe("list-heading");
  expect(paragraph(doc, "definitiontail").GetTextFormatColl().id).toBe("list-contents");
});
it("retains source nested margins when a DL is opened inside DD", /** A parent DD already contributes its distance, so NewDefList must not add it twice. @returns Nothing. */ () => {
  const doc = html(
    "<dl><dt>outer<dd>description<dl><dt>inner<dd>inner description</dl><dt>last<dd>end</dl>",
  );
  expect(left(paragraph(doc, "description"))).toBe(567);
  expect(left(paragraph(doc, "inner"))).toBe(567);
  expect(left(paragraph(doc, "inner description"))).toBe(1134);
  expect(left(paragraph(doc, "last"))).toBe(0);
  expect(left(paragraph(doc, "end"))).toBe(567);
});
it("adds the previous DD distance when a nested DL is outside a DD context", /** Original NewDefList distinguishes enclosing list boundaries from a live DD. @returns Nothing. */ () => {
  const doc = html("<dl><dt>outer<dl><dt>inner<dd>description</dl><dd>last</dl>");
  expect(left(paragraph(doc, "inner"))).toBe(567);
  expect(left(paragraph(doc, "description"))).toBe(1134);
  expect(left(paragraph(doc, "last"))).toBe(567);
});
it("opens orphan definitions implicitly and closes their depth on EndPara", /** No synthetic DL context is manufactured for malformed standalone items. @returns Nothing. */ () => {
  const doc = html("<dt>term<dd>description<p>body</p><dl><dt>next<dd>end</dl>");
  expect(left(paragraph(doc, "term"))).toBe(0);
  expect(left(paragraph(doc, "description"))).toBe(567);
  expect(paragraph(doc, "body").GetTextFormatColl().id).toBe("text-body");
  expect(left(paragraph(doc, "next"))).toBe(0);
});
it("keeps definition-list paragraphs as uncounted continuations within an ordered LI", /** Shared list depth participates in spacing, while node numbering stays with the outer rule. @returns Nothing. */ () => {
  const doc = html("<ol><li>one<dl><dt>term<dd>description</dl><li>two</ol><p>tail</p>");
  const one = paragraph(doc, "one"),
    term = paragraph(doc, "term"),
    description = paragraph(doc, "description"),
    two = paragraph(doc, "two");
  expect(one.IsCountedInList()).toBe(true);
  expect(term.GetNumRule()).toBe(one.GetNumRule());
  expect(term.IsCountedInList()).toBe(false);
  expect(description.GetNumRule()).toBe(one.GetNumRule());
  expect(description.IsCountedInList()).toBe(false);
  expect(two.IsCountedInList()).toBe(true);
  expect(two.GetNumRule()).toBe(one.GetNumRule());
  expect(paragraph(doc, "tail").GetNumRule()).toBeUndefined();
});
it("retains separate bullet-list contexts within a definition and restores subsequent DD content", /** Closing another list cannot consume an outer DT/DD context. @returns Nothing. */ () => {
  const doc = html("<dl><dt>term<dd>before<ul><li>bullet</li></ul>after</dd><dt>next<dd>end</dl>");
  expect(paragraph(doc, "bullet").IsCountedInList()).toBe(true);
  expect(paragraph(doc, "after").GetNumRule()).toBeUndefined();
  expect(paragraph(doc, "after").GetTextFormatColl().id).toBe("list-contents");
  expect(paragraph(doc, "next").GetTextFormatColl().id).toBe("list-heading");
});
it("retains empty-item omission and unterminated definition contexts at EOF", /** Empty unnumbered HTML paragraphs do not force placeholder nodes. @returns Nothing. */ () => {
  const doc = html("<dl><dt></dt><dd></dd><dt>term<dd>definition");
  expect(
    doc.paragraphs.map(
      /** Reads actual nodes. @param node - Node. @returns Text. */ (node) => node.GetText(),
    ),
  ).toEqual(["term", "definition"]);
});
it("retains the native empty-paragraph loss of displaced script-dependent ADDRESS items", /** EndAttr performs script filtering on an empty range even for LikePara attributes; source weak script matches none of the posture families. @returns Nothing. */ () => {
  const doc = html("<address><dl><dt>term<dd>definition</dl></address><p>tail</p>");
  expect(paragraph(doc, "term").GetTextFormatColl().id).toBe("list-heading");
  expect(projectWriterTextRuns(paragraph(doc, "term"))[0]?.attributes.italic).toBe(false);
  expect(projectWriterTextRuns(paragraph(doc, "definition"))[0]?.attributes.italic).toBe(false);
});
it("preserves displaced non-script character items as native paragraph hard attribution", /** Actual underline ownership demonstrates the original cascade independently of script-dependent empty-range filtering. @returns Nothing. */ () => {
  const doc = html(
    "<address><dl><dt>term<dd>definition</dl></address><p>tail</p>",
    /** Edits the actual outer paragraph style. @param owner - Document. @returns Nothing. */ (
      owner,
    ) => {
      owner
        .GetTextFormatColl("sender")
        .SetFormatAttr(new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, RES_CHRATR_UNDERLINE));
    },
  );
  expect(projectWriterTextRuns(paragraph(doc, "term"))[0]?.attributes.underline).toBe(true);
  expect(projectWriterTextRuns(paragraph(doc, "definition"))[0]?.attributes.underline).toBe(true);
  expect(projectWriterTextRuns(paragraph(doc, "tail"))[0]?.attributes.underline).toBe(false);
});
it("retains PRE lexer filtering of definition tags in a real byte stream", /** Native FilterPRE replaces unsupported list tags before Writer sees them. @returns Nothing. */ () => {
  const doc = html("<pre><dl><dt>term<dd>definition</dl></pre>");
  expect(paragraph(doc, "termdefinition").GetTextFormatColl().id).toBe("preformatted-text");
});
it("preserves PRE style priority through original public context operations", /** This tests the original SetTextCollAttrs PRE branch without forging parser state or bypassing a token result. @returns Nothing. */ () => {
  const doc = html(
    "<dl><dt>term<dd>definition</dl>",
    undefined,
    /** Opens the real original context before byte-stream insertion. @param parser - Actual reader. @returns Nothing. */ (
      parser,
    ) => parser.NewTextFormatColl(T.PREFORMTXT_ON, P.COLL_HTML_PRE),
  );
  expect(paragraph(doc, "definition").GetTextFormatColl().id).toBe("preformatted-text");
  expect(left(paragraph(doc, "definition"))).toBe(567);
});
it("uses native DD-minus-DT margin arithmetic for edited pool styles", /** The source term margin is excluded from DT context addition and subtracted when calculating DD. @returns Nothing. */ () => {
  const doc = html(
    "<dl><dt>term<dd>definition</dl>",
    /** Applies real authored native style items. @param owner - Actual document. @returns Nothing. */ (
      owner,
    ) => {
      owner
        .GetTextFormatColl("list-heading")
        .SetFormatAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(100), RES_MARGIN_TEXTLEFT));
      owner
        .GetTextFormatColl("list-contents")
        .SetFormatAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(600), RES_MARGIN_TEXTLEFT));
      owner
        .GetTextFormatColl("list-heading")
        .SetFormatAttr(new SvxRightMarginItem(SvxIndentValue.twips(30), RES_MARGIN_RIGHT));
      owner
        .GetTextFormatColl("list-contents")
        .SetFormatAttr(new SvxRightMarginItem(SvxIndentValue.twips(80), RES_MARGIN_RIGHT));
    },
  );
  expect(left(paragraph(doc, "term"))).toBe(0);
  expect(left(paragraph(doc, "definition"))).toBe(500);
  expect(
    (paragraph(doc, "definition").GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight(),
  ).toBe(50);
});
it("retains unsigned native definition-list margin wrapping", /** Negative DD-minus-DT differences are narrowed before accumulated context insertion. @returns Nothing. */ () => {
  const doc = html(
    "<dl><dt>term<dd>definition</dl>",
    /** Edits actual direct source styles. @param owner - Document. @returns Nothing. */ (
      owner,
    ) => {
      owner
        .GetTextFormatColl("list-heading")
        .SetFormatAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(700), RES_MARGIN_TEXTLEFT));
    },
  );
  expect(left(paragraph(doc, "definition"))).toBe(65403);
});
it("adds CSS DL margins to the native DD style distance", /** Original context geometry is additive rather than browser CSS replacement. @returns Nothing. */ () => {
  const doc = html('<dl style="margin-left:20pt"><dt>term<dd>definition</dl>');
  expect(left(paragraph(doc, "term"))).toBe(400);
  expect(left(paragraph(doc, "definition"))).toBe(967);
});
it("preserves native soft paragraph spacing within definitions", /** AM_SOFTNOSPACE retains authored lower spacing rather than forcing zero. @returns Nothing. */ () => {
  const doc = html('<dl><dt style="margin-bottom:12pt">term<dd>definition</dl>');
  expect((paragraph(doc, "term").GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(240);
});
it("retains definition paragraph roles and margins through Markdown HTML insertion and Worker transport", /** Existing native Markdown writer exports the visible text without inventing definition-list syntax. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    new TextEncoder().encode("<dl><dt>term<dd>definition</dl>\n\ntail"),
  );
  docs.push(doc);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  expect(paragraph(restored, "term").GetTextFormatColl().GetPoolFormatId()).toBe(P.COLL_HTML_DT);
  expect(left(paragraph(restored, "definition"))).toBe(567);
  const result = new TextDecoder().decode(new SwMDWriter().WriteDocument(restored));
  expect(result).toContain("term");
  expect(result).toContain("definition");
  expect(result).not.toContain("<dl>");
});

import { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import { FontLineStyle } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_UNDERLINE } from "../../../inc/hintids";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";

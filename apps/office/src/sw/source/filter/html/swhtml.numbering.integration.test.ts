/** @fileoverview Native HTML numbering token/context transitions through real Writer HTML and Markdown readers, document list rules and transport. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SwHTMLParser } from "./swhtml";
import { MarkdownReader } from "../md/swmd";
import { SvxNumType as N } from "../../../../editeng/inc/svxenum";
import { HTML_NUMBER_BULLET_MARGINLEFT, HTML_NUMBER_BULLET_INDENT } from "./htmlnum";
import { SwTextNode, projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const docs: SwDoc[] = [];
afterEach(
  /** Releases real document owners after every case. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Imports native HTML into the Markdown insertion profile. @param source - HTML source. @returns Actual document. */
function html(source: string): SwDoc {
  const doc = new SwDoc();
  docs.push(doc);
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
    parser.CallParser();
    return doc;
  } finally {
    parser.SourceDispose();
    pam.Dispose();
  }
}
/** Finds an actual paragraph by unique text. @param doc - Actual owner. @param text - Authored text. @returns Real node. */
function paragraph(doc: SwDoc, text: string): SwTextNode {
  const found = doc.paragraphs.find(
    /** Matches actual content. @param candidate - Native node. @returns Whether matched. */ (
      candidate,
    ) => candidate.GetText() === text,
  );
  assert(
    found,
    `Missing ${text}: ${doc.paragraphs.map(/** Reports actual node text. @param n - Node. @returns Text. */ (n) => n.GetText()).join("|")}`,
  );
  return found;
}
/** Reads the paragraph's actual effective level format. @param current - Node. @returns Native format. */
function format(current: SwTextNode) {
  const rule = current.GetNumRule();
  assert(rule);
  return rule.Get(current.GetAttrListLevel());
}
it("imports HTML list items into native rules and clears following body numbering", /** Adjacent LI and explicit closing contexts establish separate real text nodes. @returns Nothing. */ () => {
  const doc = html("<ul><li>one</li><li>two</li></ul><p>tail</p>");
  const one = paragraph(doc, "one"),
    two = paragraph(doc, "two");
  expect(one.IsCountedInList()).toBe(true);
  expect(two.IsCountedInList()).toBe(true);
  expect(one.GetNumRule()).toBe(two.GetNumRule());
  expect(format(one).GetNumberingType()).toBe(N.SVX_NUM_CHAR_SPECIAL);
  expect(format(one).GetBulletChar()).toBe(0x2022);
  expect(format(one).GetAbsLSpace()).toBe(HTML_NUMBER_BULLET_MARGINLEFT);
  expect(format(one).GetFirstLineOffset()).toBe(HTML_NUMBER_BULLET_INDENT);
  expect(paragraph(doc, "tail").GetNumRule()).toBeUndefined();
});
it.each([
  ["A", N.SVX_NUM_CHARS_UPPER_LETTER],
  ["a", N.SVX_NUM_CHARS_LOWER_LETTER],
  ["I", N.SVX_NUM_ROMAN_UPPER],
  ["i", N.SVX_NUM_ROMAN_LOWER],
])(
  "preserves ordered TYPE case %s",
  /** Native TYPE considers only its first code unit and distinguishes case. @param type - Raw option. @param expected - Native format. @returns Nothing. */ (
    type,
    expected,
  ) => {
    expect(
      format(paragraph(html(`<ol type="${type}"><li>item</li></ol>`), "item")).GetNumberingType(),
    ).toBe(expected);
  },
);
it.each([
  ["disc", 0xe008],
  ["circle", 0xe009],
  ["square", 0xe00b],
])(
  "retains legacy HTML TYPE glyph %s",
  /** HTML explicit glyphs are not normalized to the ordinary Unicode bullet. @param type - Option. @param expected - Source glyph. @returns Nothing. */ (
    type,
    expected,
  ) => {
    expect(
      format(paragraph(html(`<ul type="${type}"><li>item</li></ul>`), "item")).GetBulletChar(),
    ).toBe(expected);
  },
);
it("keeps list START on the format and LI VALUE on the actual restart node", /** Source defaults and per-node overrides use different owners. @returns Nothing. */ () => {
  const doc = html("<ol start=5><li>first<li value=9>second<li>third</ol><p>tail</p>");
  const first = paragraph(doc, "first"),
    second = paragraph(doc, "second"),
    third = paragraph(doc, "third");
  expect(format(first).GetStart()).toBe(5);
  expect(first.IsListRestart()).toBe(false);
  expect(second.IsListRestart()).toBe(true);
  expect(second.GetAttrListRestartValue()).toBe(9);
  expect(third.IsListRestart()).toBe(false);
});
it("narrows parsed START and VALUE to original unsigned-short width", /** Values are narrowed after the native HTMLOption number parser. @returns Nothing. */ () => {
  const current = paragraph(html("<ol start=65536><li value=65537>item</ol>"), "item");
  expect(format(current).GetStart()).toBe(0);
  expect(current.GetAttrListRestartValue()).toBe(1);
});
it("restores the parent rule after a conflicting sibling nested list type", /** Native HTML creates a new rule for the conflicting child, copies parent formats and restores the saved identity at close. @returns Nothing. */ () => {
  const doc = html(
    "<ol><li>A<ol><li>B</li></ol></li><li>C<ul><li>D</li></ul>E</li><li>F</li></ol><p>Z</p>",
  );
  const a = paragraph(doc, "A"),
    b = paragraph(doc, "B"),
    c = paragraph(doc, "C"),
    d = paragraph(doc, "D"),
    e = paragraph(doc, "E"),
    f = paragraph(doc, "F");
  expect(a.GetNumRule()).toBe(b.GetNumRule());
  expect(c.GetNumRule()).toBe(a.GetNumRule());
  expect(f.GetNumRule()).toBe(a.GetNumRule());
  expect(d.GetNumRule()).not.toBe(a.GetNumRule());
  expect(d.GetAttrListLevel()).toBe(1);
  expect(format(b).GetNumberingType()).toBe(N.SVX_NUM_ARABIC);
  expect(format(d).GetNumberingType()).toBe(N.SVX_NUM_CHAR_SPECIAL);
  expect(d.GetNumRule()?.Get(0).GetNumberingType()).toBe(N.SVX_NUM_ARABIC);
  expect(e.GetNumRule()).toBe(a.GetNumRule());
  expect(e.IsCountedInList()).toBe(false);
  expect(paragraph(doc, "Z").GetNumRule()).toBeUndefined();
});
it("retains the first format for repeated same-kind nested lists and consumes the pending start", /** Same-kind sibling reuse does not allocate another rule or replace TYPE. @returns Nothing. */ () => {
  const doc = html("<ol><li>A<ol start=7 type=I><li>B</ol><li>C<ol type=a><li>D</ol></ol>");
  const b = paragraph(doc, "B"),
    d = paragraph(doc, "D");
  expect(b.GetNumRule()).toBe(d.GetNumRule());
  expect(format(d).GetNumberingType()).toBe(N.SVX_NUM_ROMAN_UPPER);
  expect(format(d).GetStart()).toBe(7);
  expect(d.IsListRestart()).toBe(true);
  expect(d.GetAttrListRestartValue()).toBe(1);
});
it("retains an uncounted LH without consuming the pending node restart", /** List headers share the rule but do not advance its item count. @returns Nothing. */ () => {
  const doc = html("<ol><li>A<ol start=4><li>B</ol><li>C<ol><lh>header</lh><li>D</ol></ol>");
  const header = paragraph(doc, "header"),
    d = paragraph(doc, "D");
  expect(header.IsCountedInList()).toBe(false);
  expect(header.IsListRestart()).toBe(false);
  expect(d.IsListRestart()).toBe(true);
  expect(d.GetAttrListRestartValue()).toBe(1);
});
it("creates the native isolated bullet rule for an orphan LI", /** Without a surrounding list the new rule is not installed into active NumInfo. @returns Nothing. */ () => {
  const doc = html("<li>orphan</li><p>tail</p>");
  expect(format(paragraph(doc, "orphan")).GetNumberingType()).toBe(N.SVX_NUM_CHAR_SPECIAL);
  expect(paragraph(doc, "tail").GetNumRule()).toBeUndefined();
});
it("keeps paragraphs within one LI as uncounted continuations", /** AppendTextNode's original updateNum flag assigns the active rule but clears counted state. @returns Nothing. */ () => {
  const doc = html("<ul><li><p>first</p><p>continuation</p></li><li>next</li></ul>");
  const first = paragraph(doc, "first"),
    continuation = paragraph(doc, "continuation"),
    next = paragraph(doc, "next");
  expect(first.IsCountedInList()).toBe(true);
  expect(continuation.GetNumRule()).toBe(first.GetNumRule());
  expect(continuation.IsCountedInList()).toBe(false);
  expect(next.IsCountedInList()).toBe(true);
});
it("closes unterminated nested lists at native parser EOF", /** EOF closes numbering before releasing ordinary contexts. @returns Nothing. */ () => {
  const doc = html("<ol><li>A<ul><li>B");
  expect(format(paragraph(doc, "A")).GetNumberingType()).toBe(N.SVX_NUM_ARABIC);
  expect(format(paragraph(doc, "B")).GetNumberingType()).toBe(N.SVX_NUM_CHAR_SPECIAL);
});
it("clamps native levels to ten while retaining deeper context depth", /** Level clamping must not collapse list-close ownership. @returns Nothing. */ () => {
  const doc = html("<ul><li>".repeat(12) + "deep" + "</li></ul>".repeat(12) + "<p>tail</p>");
  expect(paragraph(doc, "deep").GetAttrListLevel()).toBe(9);
  expect(paragraph(doc, "tail").GetNumRule()).toBeUndefined();
});
it.each([
  ["upper-roman", N.SVX_NUM_ROMAN_UPPER],
  ["lower-latin", N.SVX_NUM_CHARS_LOWER_LETTER],
])(
  "applies native list-style-type %s before body insertion",
  /** CSS numbering flags override a new level's default format. @param css - Native keyword. @param expected - Expected format. @returns Nothing. */ (
    css,
    expected,
  ) => {
    expect(
      format(
        paragraph(html(`<ol style="list-style-type:${css}"><li>item</ol>`), "item"),
      ).GetNumberingType(),
    ).toBe(expected);
  },
);
it("retains native CSS bullet glyph and signed list indentation", /** New-level CSS adjusts list geometry instead of paragraph margin state. @returns Nothing. */ () => {
  const current = paragraph(
    html('<ul style="list-style-type:square;margin-left:20pt;text-indent:-5pt"><li>item</ul>'),
    "item",
  );
  expect(format(current).GetBulletChar()).toBe(0xe00b);
  expect(format(current).GetAbsLSpace()).toBe(400);
  expect(format(current).GetFirstLineOffset()).toBe(-100);
});
it("uses the first duplicate START option in native reverse traversal", /** Duplicate attributes are not normalized by a DOM. @returns Nothing. */ () => {
  expect(format(paragraph(html("<ol start=4 start=8><li>item</ol>"), "item")).GetStart()).toBe(4);
});
it("connects Markdown raw HTML callbacks and retains actual rules through the Worker codec", /** Both imported structure and transported document-owned numbering survive the real filter path. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    new TextEncoder().encode("<ol start=3>\n<li><b>one</b></li>\n<li>two</li>\n</ol>\n\ntail"),
  );
  docs.push(doc);
  const one = paragraph(doc, "one ");
  expect(one.IsCountedInList()).toBe(true);
  expect(format(one).GetStart()).toBe(3);
  expect(projectWriterTextRuns(one)[0]?.attributes.bold).toBe(true);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  expect(format(paragraph(restored, "one ")).GetStart()).toBe(3);
  expect(paragraph(restored, "two ").GetNumRule()).toBe(paragraph(restored, "one ").GetNumRule());
  expect(paragraph(restored, "tail").GetNumRule()).toBeUndefined();
});

it("retains the native fresh-format cancellation for ordered TYPE=1", /** TYPE's unrecognized first unit clears bChangeNumFormat after defaults, leaving no explicit level format. @returns Nothing. */ () => {
  const current = paragraph(html("<ol type=1><li>item</ol>"), "item");
  expect(current.GetNumRule()?.GetNumFormat(0)).toBeUndefined();
  expect(format(current).GetNumberingType()).toBe(N.SVX_NUM_ARABIC);
  expect(format(current).GetCharFormat()).toBeUndefined();
});
it("retains context-dependent CSS bullet flags without converting an ordered numbering type", /** Native list-style-type fills independent number and bullet flags. @returns Nothing. */ () => {
  const current = paragraph(html('<ol style="list-style-type:disc"><li>item</ol>'), "item");
  expect(format(current).GetNumberingType()).toBe(N.SVX_NUM_ARABIC);
  expect(format(current).GetBulletChar()).toBe(0xe008);
});
it("preserves folded inter-tag whitespace after an explicit LI end", /** Native LI_OFF only ends attributes; a later space token remains until the next item appends. @returns Nothing. */ () => {
  const doc = html("<ul><li>one</li>\n<li>two</li></ul>");
  expect(paragraph(doc, "one ").IsCountedInList()).toBe(true);
  expect(paragraph(doc, "two").IsCountedInList()).toBe(true);
});

import { SwMDWriter } from "../md/wrtmd";
it("exports the imported raw-HTML numbering through the native Markdown writer", /** Imported rule starts and document list counters feed the existing native label producer. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    new TextEncoder().encode("<ol start=3><li>one<li>two</ol>"),
  );
  docs.push(doc);
  expect(paragraph(doc, "one").GetListLabel()).toBe("3.");
  expect(paragraph(doc, "two").GetListLabel()).toBe("4.");
  const result = new TextDecoder().decode(new SwMDWriter().WriteDocument(doc));
  expect(result).toContain("3. one");
  expect(result).toContain("4. two");
});

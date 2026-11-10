/** @fileoverview Native HTML DIR option consumers, Markdown HTML delegation and Worker/TXT/Markdown behavior over real paragraph direction items. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvParserState as S } from "../../../../svtools/inc/svparser";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SvxFrameDirection as D } from "../../../../editeng/inc/frmdir";
import { RES_FRAMEDIR } from "../../../inc/hintids";
import { MarkdownReader } from "../md/swmd";
import { SwMDWriter } from "../md/wrtmd";
import { SwASCWriter } from "../ascii/wrtasc";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const docs: SwDoc[] = [];
afterEach(
  /** Releases genuine imported documents. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Runs the actual HTML importer used by Markdown with real lexer/cursor/document owners. @param html - Source HTML bytes. @returns Imported model. */
function read(html: string): SwDoc {
  const doc = new SwDoc();
  docs.push(doc);
  const node = doc.paragraphs[0];
  assert(node);
  const point = new SwPosition(node),
    pam = new SwPaM(point);
  point.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(OUStringToOString(html, UTF8), UTF8));
  try {
    expect(parser.CallParser()).toBe(S.Accepted);
    return doc;
  } finally {
    parser.SourceDispose();
    pam.Dispose();
  }
}
/** Reads native effective directions for actual nonempty paragraphs. @param doc - Canonical model. @returns Item values. */
function modes(doc: SwDoc): number[] {
  return doc.paragraphs
    .filter(
      /** Selects actual body text. @param node - Native paragraph. @returns Nonempty. */ (node) =>
        node.Len() > 0,
    )
    .map(
      /** Reads the source item owner. @param node - Real paragraph. @returns Native direction. */ (
        node,
      ) => {
        const item = node.GetSwAttrSet().Get(RES_FRAMEDIR);
        assert(item instanceof SvxFrameDirectionItem);
        return item.GetValue();
      },
    );
}
it.each([
  '<p dir="rtl">x</p>',
  '<h1 dir="rtl">x</h1>',
  '<address dir="rtl">x</address>',
  '<blockquote dir="rtl">x</blockquote>',
  '<pre dir="rtl">x</pre>',
  '<span dir="rtl">x</span>',
  '<b dir="rtl">x</b>',
  '<em dir="rtl">x</em>',
  '<font dir="rtl">x</font>',
  '<ol dir="rtl"><li>x</li></ol>',
  '<ul><li dir="rtl">x</li></ul>',
  '<dl dir="rtl"><dd>x</dd></dl>',
  '<dl><dt dir="rtl">x</dt></dl>',
])(
  "passes original DIR through the implemented native HTML consumer: %s",
  /** Tag-specific original ParseStyleOptions calls must reach the actual paragraph item, without post-import repair. @param html - Actual source bytes. @returns Nothing. */ (
    html,
  ) => {
    expect(modes(read(html))).toEqual([D.Horizontal_RL_TB]);
  },
);
it.each([
  ['<p dir="rTl">x</p>', D.Horizontal_RL_TB],
  ['<p dir="rtl" dir="ltr">x</p>', D.Horizontal_RL_TB],
  ['<p dir=" RTL ">x</p>', D.Environment],
  ['<p dir="auto">x</p>', D.Environment],
  ['<p dir="LTR">x</p>', D.Horizontal_LR_TB],
] as const)(
  "retains native ASCII case, no-trim and reverse-option rules: %s",
  /** Original string option handling is preserved rather than HTML-normalized after parsing. @param html - Native input. @param expected - Source item value. @returns Nothing. */ (
    html,
    expected,
  ) => {
    expect(modes(read(html))).toEqual([expected]);
  },
);
it("preserves separately closed paragraph directions and native Worker item restoration", /** The source context boundaries must keep following paragraph properties independent. @returns Nothing. */ () => {
  const doc = read('<p dir="rtl">one</p><p dir="ltr">two</p>');
  expect(modes(doc)).toEqual([1, 0]);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  expect(modes(restored)).toEqual([1, 0]);
});
it("delegates Markdown raw HTML DIR to the same native HTML/core item path", /** No Markdown-specific direction field or alternate DOM parser is introduced. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(new TextEncoder().encode('<p dir="rtl">native</p>'));
  docs.push(doc);
  expect(modes(doc)).toEqual([1]);
});
it.each([0, 1, 2, 3, 4, 5, 6, 7])(
  "retains source TXT/Markdown omission of paragraph writing mode %s",
  /** Native writers omit unsupported paragraph flow syntax while preserving logical text. This does not certify RTF direction export. @param value - Actual core direction item. @returns Nothing. */ (
    value,
  ) => {
    const doc = new SwDoc();
    docs.push(doc);
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("Latin אב");
    const item = new SvxFrameDirectionItem(value, RES_FRAMEDIR);
    try {
      node.SetAttr(item);
    } finally {
      item.Dispose();
    }
    expect(new SwASCWriter().WriteDocument(doc)).toBe("Latin אב\n");
    expect(new TextDecoder().decode(new SwMDWriter().WriteDocument(doc))).toBe("Latin אב\n");
  },
);

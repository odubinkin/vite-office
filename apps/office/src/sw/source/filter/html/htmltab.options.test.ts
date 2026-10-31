/** @fileoverview Original table-option construction from actual HTML tokens, enum output contracts and connected Markdown alignment. */
import { assert, expect, it } from "vitest";
import { HTMLTableOptions } from "./htmltab.options";
import { HTMLParser } from "../../../../svtools/source/svhtml/parhtml";
import { HTMLOption } from "../../../../svtools/source/svhtml/parhtml.options";
import { HTMLTableFrame as F, HTMLTableRules as R } from "../../../../svtools/inc/parhtml";
import { HtmlTokenId as T, HtmlOptionId as O } from "../../../../svtools/inc/htmltokn";
import { SvParserState } from "../../../../svtools/inc/svparser";
import { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { RES_PARATR_ADJUST } from "../../../inc/hintids";
import { aHTMLPAlignTable } from "./swhtml.options";
import { MarkdownReader } from "../md/swmd";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
it("applies native char alignment against an actual inherited right context", /** The left result must come from the source alias, rather than the document's default left adjustment. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString('<div align="right"><p align="char">body</p></div>', UTF8),
  );
  try {
    const node = doc.paragraphs[0];
    assert(node);
    const item = node.GetAttr(RES_PARATR_ADJUST);
    assert(item instanceof SvxAdjustItem);
    expect(item.GetAdjust()).toBe(A.Left);
  } finally {
    doc.Dispose();
  }
});

/** Original lexer callback captures constructed native table options, with no DOM/token replacement. */
class TableOptionReader extends HTMLParser {
  options: HTMLTableOptions | undefined;
  /** Consumes only the real native table-on callback. @param token - Original filtered token. @returns Nothing. */
  protected override NextToken(token: T): void {
    if (token === T.TABLE_ON) this.options = new HTMLTableOptions(this.GetOptions(), A.Right);
  }
}
/** Reads actual byte/character/HTML owners to construct the native option object. @param attributes - Table attributes. @returns Native options. */
function read(attributes: string): HTMLTableOptions {
  const parser = new TableOptionReader(
    new SvStream(OUStringToOString(`<table ${attributes}></table>`, UTF8), UTF8),
    false,
  );
  expect(parser.CallParser()).toBe(SvParserState.Accepted);
  assert(parser.options);
  return parser.options;
}
it("retains every original table option default and independent color ownership", /** Native unset uint16 sentinels differ from explicit zero; defaults do not invent a table or layout. @returns Nothing. */ () => {
  const options = read("");
  expect(options).toMatchObject({
    nCols: 0,
    nWidth: 0,
    nHeight: 0,
    nCellPadding: 65535,
    nCellSpacing: 65535,
    nBorder: 65535,
    nHSpace: 0,
    nVSpace: 0,
    eAdjust: A.Right,
    eVertOri: 2,
    eFrame: F.Void,
    eRules: R.NONE,
    bPercentWidth: false,
    bTableAdjust: false,
    bBGColor: false,
    aBGImage: "",
    aStyle: "",
    aId: "",
    aClass: "",
    aDir: "",
  });
  expect(options.aBorderColor.toUInt32()).toBe(0x808080);
  expect(options.aBGColor.toUInt32()).toBe(0);
  options.aBorderColor.SetRed(1);
  expect(read("").aBorderColor.toUInt32()).toBe(0x808080);
});
it.each([
  ["width=200", 200, false],
  ["width=200%", 100, true],
  ["width=65536%", 0, true],
  ["width=65537%", 1, true],
  ["width=-1", 0, false],
  ["cols=2", 100, true],
  ["cols=2 width=0", 100, true],
  ["cols=65536", 0, false],
  ["width='25junk%tail'", 25, true],
] as const)(
  "preserves source width and percent conversion for %s",
  /** uint16 narrowing precedes percentage clamping, and nonzero COLS supplies missing width. @param input - Attributes. @param width - Expected width. @param percent - Original percent flag. @returns Nothing. */
  (input, width, percent) => {
    const value = read(input);
    expect([value.nWidth, value.bPercentWidth]).toEqual([width, percent]);
  },
);
it("preserves all source option strings and native number narrowing", /** These remain raw source values until later table geometry/background consumers. @returns Nothing. */ () => {
  const value = read(
    'cols=3 height=65537 cellpadding=65538 cellspacing=65539 hspace=65540 vspace=65541 id="A&amp;B" class="class" style="width:2pt" dir="RTL" background="image.png"',
  );
  expect([
    value.nCols,
    value.nHeight,
    value.nCellPadding,
    value.nCellSpacing,
    value.nHSpace,
    value.nVSpace,
  ]).toEqual([3, 1, 2, 3, 4, 5]);
  expect([value.aId, value.aClass, value.aStyle, value.aDir, value.aBGImage]).toEqual([
    "A&B",
    "class",
    "width:2pt",
    "RTL",
    "image.png",
  ]);
  expect(read("height=30%").nHeight).toBe(0);
});
it.each([
  ["border", 1, F.Box, R.All],
  ["border=border", 1, F.Box, R.All],
  ["border=BORDER", 1, F.Box, R.All],
  ["border=0", 0, F.Void, R.NONE],
  ["border=65535", 65535, F.Void, R.NONE],
  ["frame=box rules=all", 65535, F.Void, R.NONE],
  ["border=0 frame=box rules=all", 0, F.Void, R.NONE],
  ["frame=above rules=rows border=2", 2, F.Above, R.Rows],
  ["border=2 frame=above rules=rows", 2, F.Above, R.Rows],
  ["border=2 frame=unknown rules=unknown", 2, F.Void, R.NONE],
] as const)(
  "uses native border/frame/rules precedence for %s",
  /** Explicit frame/rules win except the final zero/unset border reset. @param input - Attributes. @param border - Expected option. @param frame - Expected frame. @param rules - Expected rules. @returns Nothing. */
  (input, border, frame, rules) => {
    const value = read(input);
    expect([value.nBorder, value.eFrame, value.eRules]).toEqual([border, frame, rules]);
  },
);
it.each([
  ["void", F.Void],
  ["above", F.Above],
  ["below", F.Below],
  ["hsides", F.HSides],
  ["lhs", F.LHS],
  ["rhs", F.RHS],
  ["vsides", F.VSides],
  ["box", F.Box],
  ["BORDER", F.Box],
  ["unknown", F.Void],
] as const)(
  "uses the source frame enum for %s",
  /** Actual option methods preserve aliases and native zero default. @param name - Value. @param expected - Native enum. @returns Nothing. */
  (name, expected) => expect(new HTMLOption(O.FRAME, "frame", name).GetTableFrame()).toBe(expected),
);
it.each([
  ["none", R.NONE],
  ["groups", R.Groups],
  ["rows", R.Rows],
  ["cols", R.Cols],
  ["ALL", R.All],
  ["unknown", R.NONE],
] as const)(
  "uses the source rules enum for %s",
  /** Actual option methods preserve case matching and native zero default. @param name - Value. @param expected - Native enum. @returns Nothing. */
  (name, expected) => expect(new HTMLOption(O.RULES, "rules", name).GetTableRules()).toBe(expected),
);
it("keeps reverse duplicate precedence, color priority and empty bgcolor admission", /** First duplicate wins; BORDERCOLOR dominates dark in either source order; light is ignored. @returns Nothing. */ () => {
  const value = read(
    "width=20 width=40 id=first id=second bgcolor=red bgcolor=blue bordercolordark=green bordercolor=red",
  );
  expect([
    value.nWidth,
    value.aId,
    value.aBGColor.toUInt32(),
    value.aBorderColor.toUInt32(),
    value.bBGColor,
  ]).toEqual([20, "first", 0xff0000, 0xff0000, true]);
  expect(read("bordercolor=red bordercolordark=green").aBorderColor.toUInt32()).toBe(0xff0000);
  expect(read("bordercolorlight=red").aBorderColor.toUInt32()).toBe(0x808080);
  expect(read('bgcolor=""').bBGColor).toBe(false);
  expect(read('bgcolor="" bgcolor=blue').aBGColor.toUInt32()).toBe(0x0000ff);
});
it.each([
  ["left", A.Left],
  ["CeNtEr", A.Center],
  ["middle", A.Center],
  ["right", A.Right],
  ["justify", A.Block],
  ["char", A.Left],
] as const)(
  "connects native alignment %s to option output and Markdown paragraph items",
  /** Original enum zero is a successful match, not a false return, and both real consumers use the same table. @param name - HTML name. @param expected - Native adjustment. @returns Nothing. */
  (name, expected) => {
    const output: [A] = [A.End];
    expect(new HTMLOption(O.ALIGN, "align", name).GetEnum(output, aHTMLPAlignTable)).toBe(true);
    expect(output[0]).toBe(expected);
    const options = read(`align=${name}`);
    expect([options.eAdjust, options.bTableAdjust]).toEqual([expected, true]);
    const doc = new MarkdownReader().Read(OUStringToOString(`<p align="${name}">body</p>`, UTF8));
    try {
      const item = doc.paragraphs[0]?.GetAttr(RES_PARATR_ADJUST);
      assert(item instanceof SvxAdjustItem);
      expect(item.GetAdjust()).toBe(expected);
    } finally {
      doc.Dispose();
    }
  },
);
it("does not write enum output on failure or trim quoted enum values", /** The bool/output overload differs from zero fallback and leaves the original reference untouched. @returns Nothing. */ () => {
  const output: [A] = [A.Right],
    option = new HTMLOption(O.ALIGN, "align", " left ");
  expect(option.GetEnum(output, aHTMLPAlignTable)).toBe(false);
  expect(output[0]).toBe(A.Right);
  expect(option.GetEnum(output, [])).toBe(false);
  expect(output[0]).toBe(A.Right);
  const options = read('align=" left "');
  expect([options.eAdjust, options.bTableAdjust]).toEqual([A.Right, false]);
});
it.each([
  ["top", 0],
  ["middle", 2],
  ["bottom", 3],
  ["baseline", 2],
] as const)(
  "preserves source vertical alignment %s",
  /** Table top maps to NONE rather than the separate TOP constant. @param name - Value. @param expected - Native enum. @returns Nothing. */
  (name, expected) => expect(read(`valign=${name}`).eVertOri).toBe(expected),
);

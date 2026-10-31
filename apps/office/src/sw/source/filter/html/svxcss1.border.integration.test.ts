/** @fileoverview Native CSS1 border/padding parsing, pending-value copy/consumption and Markdown/Worker transport through real Writer owners. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwHTMLParser } from "./swhtml";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvxBoxItem, SvxBoxItemLine as E } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLineStyle as L } from "../../../../editeng/source/items/borderline";
import { RES_BOX } from "../../../inc/hintids";
import { MarkdownReader } from "../md/swmd";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SvxCSS1Parser, aItemIds } from "./svxcss1";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Reads real HTML, preserving the same existing-document admission as Markdown. @param style - Inline declaration. @returns Actual document. */
function html(style: string): SwDoc {
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
    new SvStream(OUStringToOString(`<p style="${style}">body</p>`, UTF8), UTF8),
  );
  try {
    parser.CallParser();
  } finally {
    parser.SourceDispose();
    pam.Dispose();
  }
  return doc;
}
/** Borrows the actual paragraph box. @param doc - Actual document. @returns Borrowed item. */
function box(doc: SwDoc): SvxBoxItem {
  const value = doc.paragraphs[0]?.GetAttr(RES_BOX);
  assert(value instanceof SvxBoxItem);
  return value;
}
it.each([
  ["thin", 1],
  ["medium", 10],
  ["thick", 15],
] as const)(
  "uses original named border width %s",
  /** The real pool slot supplies RES_BOX, without fake Which values. @param width - CSS name. @param twips - Source constant. @returns Nothing. */ (
    width,
    twips,
  ) => {
    const value = box(html(`border: ${width} solid #123456`));
    expect(aItemIds.nBox).toBe(RES_BOX);
    for (const edge of [E.TOP, E.BOTTOM, E.LEFT, E.RIGHT]) {
      const line = value.GetLine(edge);
      assert(line);
      expect([
        line.GetWidth(),
        line.GetBorderLineStyle(),
        line.GetColor().toUInt32(),
        value.GetDistance(edge),
      ]).toEqual([twips, L.SOLID, 0x123456, 28]);
    }
  },
);
it.each([
  ["solid", L.SOLID],
  ["double", L.DOUBLE],
  ["dotted", L.DOTTED],
  ["dashed", L.DASHED],
  ["groove", L.ENGRAVED],
  ["ridge", L.EMBOSSED],
  ["inset", L.INSET],
  ["outset", L.OUTSET],
] as const)(
  "maps source CSS border style %s",
  /** Source styles bind to genuine native line metrics. @param css - Name. @param native - Original style. @returns Nothing. */ (
    css,
    native,
  ) => {
    const line = box(html(`border: 3pt ${css}`)).GetTop();
    assert(line);
    expect([line.GetWidth(), line.GetBorderLineStyle()]).toEqual([60, native]);
  },
);
it("retains source shorthand pixel hairlines including zero, while explicit width zero clears the line", /** Original shorthand and width-only handlers have different pixel rules. @returns Nothing. */ () => {
  expect(box(html("border: 0px solid")).GetTop()?.GetWidth()).toBe(1);
  expect(box(html("border: 1px solid")).GetTop()?.GetWidth()).toBe(1);
  expect(box(html("border: solid; border-width: 1px")).GetTop()?.GetWidth()).toBe(15);
  expect(box(html("border: solid; border-width: 0px")).GetTop()).toBeUndefined();
});
it("copies shorthand sides in source order and clamps distances only on bordered sides", /** Top/right/bottom/left share the source partial-copy sequence. @returns Nothing. */ () => {
  const value = box(
    html(
      "border-style: solid; border-width: 1pt 2pt 3pt 4pt; border-color: red green blue black; padding: 0 2pt 3pt 4pt",
    ),
  );
  expect(
    [E.TOP, E.RIGHT, E.BOTTOM, E.LEFT].map(
      /** Reads actual edge values. @param side - Side. @returns Width and distance. */ (side) => [
        value.GetLine(side)?.GetWidth(),
        value.GetDistance(side),
      ],
    ),
  ).toEqual([
    [20, 28],
    [40, 40],
    [60, 60],
    [80, 80],
  ]);
  expect(
    [E.TOP, E.RIGHT, E.BOTTOM, E.LEFT].map(
      /** Reads native colors. @param side - Side. @returns RGB. */ (side) =>
        value.GetLine(side)?.GetColor().toUInt32(),
    ),
  ).toEqual([0xff0000, 0x008000, 0x0000ff, 0]);
});
it("retains prior color when a later shorthand omits color", /** Original bColor admission does not reset an already stored side color. @returns Nothing. */ () => {
  expect(box(html("border-color: red; border: solid")).GetTop()?.GetColor().toUInt32()).toBe(
    0xff0000,
  );
});
it("drops padding from sides without border lines", /** Original SetBoxItem explicitly writes zero distance for an absent line. @returns Nothing. */ () => {
  const value = box(html("border-top: solid; padding: 3pt"));
  expect(
    [E.TOP, E.BOTTOM, E.LEFT, E.RIGHT].map(
      /** Reads native distance. @param side - Side. @returns Twips. */ (side) =>
        value.GetDistance(side),
    ),
  ).toEqual([60, 0, 0, 0]);
});
it("preserves original signed16 box distance narrowing after unsigned CSS saturation", /** CSS permits65534, but the real box stores sal_Int16 and its ordinary reader clamps negatives. @returns Nothing. */ () => {
  const value = box(html("border: solid; padding: 70000pt"));
  expect([value.GetDistance(E.TOP, true), value.GetDistance(E.TOP)]).toEqual([-2, 0]);
  const restored = decodeWriterDocument(
    encodeWriterDocument(html("border: solid; padding: 70000pt")),
  );
  docs.push(restored);
  expect([box(restored).GetDistance(E.TOP, true), box(restored).GetDistance(E.TOP)]).toEqual([
    -2, 0,
  ]);
});
it("copies pending colors independently and consumes pending sides after box production", /** Uses the actual grammar, property copy and item owners; no private state is supplied. @returns Nothing. */ () => {
  const doc = new SwDoc();
  docs.push(doc);
  const css = new SvxCSS1Parser(doc.GetAttrPool(), ""),
    items = new SfxItemSet(doc.GetAttrPool(), css.GetWhichMap()),
    info = new SvxCSS1PropertyInfo();
  try {
    css.ParseStyleOption("border: solid red; padding: 2pt", items, info);
    const copy = new SvxCSS1PropertyInfo(info),
      original = info.GetBorderInfo(E.TOP, false),
      copied = copy.GetBorderInfo(E.TOP, false);
    assert(original && copied);
    expect(copied === original).toBe(false);
    const blue = box(html("border: solid blue")).GetTop();
    assert(blue);
    copied.aColor.assign(blue.GetColor());
    expect(original.aColor.toUInt32()).toBe(0xff0000);
    copy.SetBoxItem(items, 28);
    expect(copy.GetBorderInfo(E.TOP, false)).toBeNull();
    expect(copy.m_nTopBorderDistance).toBe(0xffff);
    const stored = items.GetItemIfSet(RES_BOX, false);
    assert(stored instanceof SvxBoxItem);
    expect([stored.GetTop()?.GetColor().toUInt32(), stored.GetDistance(E.TOP)]).toEqual([
      0x0000ff, 40,
    ]);
    info.Clear();
    expect(info.GetBorderInfo(E.TOP, false)).toBeNull();
  } finally {
    items.Dispose();
    css.SourceDispose();
  }
});
it("transports native borders from actual Markdown HTML through Worker document encoding", /** The existing UI transport keeps real line metrics, colors and paragraph distances. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString('<p style="border: 2pt double red; padding: 3pt">body</p>', UTF8),
  );
  docs.push(doc);
  expect(box(doc).GetTop()?.GetWidth()).toBe(40);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  const value = box(restored),
    line = value.GetTop();
  assert(line);
  expect([
    line.GetBorderLineStyle(),
    line.GetWidth(),
    line.GetColor().toUInt32(),
    value.GetDistance(E.TOP),
  ]).toEqual([L.DOUBLE, 40, 0xff0000, 60]);
});

it("retains six-hex scanner admission instead of treating that token as padding length", /** Pinned scanner recognizes999999 as HEXCOLOR before considering a numeric length. @returns Nothing. */ () => {
  expect(box(html("border: solid; padding: 999999pt")).GetDistance(E.TOP)).toBe(28);
});
it("does not replace an unrepresented character box with a paragraph border", /** The native InsertAttrs char-level branch targets RES_CHRATR_BOX, absent in this core. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString('<div><span style="border: solid red">body</span></div>', UTF8),
  );
  docs.push(doc);
  expect(box(doc).GetTop()).toBeUndefined();
});

it("keeps native unitless-zero admission distinct from an explicit zero-pixel value", /** Padding ignores NUMBER, while the width handler retains its medium default for that token kind. @returns Nothing. */ () => {
  expect(box(html("border: solid; padding: 3pt; padding: 0")).GetDistance(E.TOP)).toBe(60);
  expect(box(html("border: solid; padding: 3pt; padding: 0px")).GetDistance(E.TOP)).toBe(28);
  expect(box(html("border: 3pt solid; border-width: 0")).GetTop()?.GetWidth()).toBe(10);
});

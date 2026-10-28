/** @fileoverview Source RTF paragraph/cell border ownership, metric loss, style inheritance and group restoration. */
import { expect, it } from "vitest";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxBoxItem, SvxBoxItemLine as Edge } from "../../../../editeng/source/items/frmitems";
import { BorderLineStyle as Style } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { Color } from "../../../../tools/inc/color";
import { RES_BOX, RES_PARATR_CONNECT_BORDER } from "../../../inc/hintids";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import { RtfExport } from "../../filter/ww8/rtfexport";
import { RtfDocumentImpl } from "./rtfdocumentimpl";

/** Imports a standalone source fixture. @param text - RTF text. @returns Owned document. */
function read(text: string): SwDoc {
  return new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(text));
}

/** Reads the effective native box from one body paragraph. @param document - Native document. @param index - Paragraph index. @returns Native item. */
function box(document: SwDoc, index = 0): SvxBoxItem {
  const node = document.paragraphs[index];
  if (node === undefined) throw new Error("Missing paragraph.");
  return node.GetAttr(RES_BOX) as SvxBoxItem;
}

it("imports paragraph borders with source width and point-distance quantization", /** Checks source RTF-to-OOXML metric stages before native box ownership. @returns Nothing. */ () => {
  const document = read(
    String.raw`{\rtf1{\colortbl;\red17\green34\blue51;}\pard\brdrt\brdrs\brdrw21\brdrcf1\brsp39 First\par\pard\brdrb\brdrdb\brdrw20\brsp79 Second}`,
  );
  try {
    expect(box(document).GetTop()?.GetWidth()).toBe(20);
    expect(box(document).GetTop()?.GetColor().toUInt32()).toBe(0x112233);
    expect(box(document).GetDistance(Edge.TOP)).toBe(20);
    expect(box(document, 1).GetBottom()?.GetWidth()).toBe(60);
    expect(box(document, 1).GetDistance(Edge.BOTTOM)).toBe(60);
  } finally {
    document.Dispose();
  }
});

it("applies box controls to all four borders and restores group-scoped paragraph borders", /** Checks uniform boxes and independent inherited group state. @returns Nothing. */ () => {
  const document = read(
    String.raw`{\rtf1{\pard\box\brdrs\brdrw30\brsp45 {\brdrw80} One\par}\pard Two}`,
  );
  try {
    for (const edge of [Edge.TOP, Edge.LEFT, Edge.BOTTOM, Edge.RIGHT]) {
      expect(box(document).GetLine(edge)?.GetWidth()).toBe(30);
      expect(box(document).GetDistance(edge)).toBe(40);
      expect(box(document, 1).GetLine(edge)).toBeUndefined();
    }
  } finally {
    document.Dispose();
  }
});

it("retains stylesheet borders and accepts explicit direct no-border overrides", /** Checks native style ownership and border clearing rather than a display-only projection. @returns Nothing. */ () => {
  const document = read(
    String.raw`{\rtf1{\stylesheet{\s1\brdrb\brdrs\brdrw20\brsp40 Styled;}}\pard\s1 Inherited\par\pard\s1\brdrb\brdrnone Reset}`,
  );
  try {
    expect(box(document).GetBottom()?.GetWidth()).toBe(20);
    expect(box(document).GetDistance(Edge.BOTTOM)).toBe(40);
    expect(box(document, 1).GetBottom()).toBeUndefined();
    expect(box(document, 1).GetDistance(Edge.BOTTOM)).toBe(0);
  } finally {
    document.Dispose();
  }
});

it("maps consecutive between borders to native top borders and clears the prior bottom border", /** Checks source handlePreviousParagraphBorderInBetween and connect-border state. @returns Nothing. */ () => {
  const document = read(
    String.raw`{\rtf1\pard\brdrb\brdrs\brdrw20\brdrbtw\brdrs\brdrw30 One\par\pard\brdrbtw\brdrs\brdrw30 Two}`,
  );
  try {
    expect(box(document).GetBottom()).toBeUndefined();
    expect(box(document, 1).GetTop()?.GetWidth()).toBe(30);
    for (const node of document.paragraphs)
      expect((node.GetAttr(RES_PARATR_CONNECT_BORDER) as SfxBoolItem).GetValue()).toBe(false);
  } finally {
    document.Dispose();
  }
});

it("preserves the source thick-border export flag and its ignored import behavior", /** Checks the retained upstream wide-border round-trip loss. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const node = document.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  node.SetText("Wide");
  const borders = new SvxBoxItem(RES_BOX);
  borders.SetLine(new SvxBorderLine(new Color(0), 300, Style.SOLID), Edge.BOTTOM);
  node.SetAttr(borders);
  let restored: SwDoc | undefined;
  try {
    const bytes = RtfExport.WriteDocument(document);
    expect(new TextDecoder().decode(bytes)).toContain("\\brdrb\\brdrs\\brdrth\\brdrw150");
    restored = new RtfDocumentImpl().ResolveBytes(bytes);
    expect(box(restored).GetBottom()?.GetWidth()).toBe(150);
  } finally {
    restored?.Dispose();
    document.Dispose();
  }
});

it("keeps direct paragraph border items through the existing Worker document codec", /** Checks the newly admitted text-node item at the existing browser boundary. @returns Nothing. */ () => {
  const document = read(String.raw`{\rtf1\brdrb\brdrs\brdrw30\brsp40 Native}`);
  let restored: SwDoc | undefined;
  try {
    restored = decodeWriterDocument(encodeWriterDocument(document));
    expect(box(restored).GetBottom()?.GetWidth()).toBe(30);
    expect(box(restored).GetDistance(Edge.BOTTOM)).toBe(40);
  } finally {
    restored?.Dispose();
    document.Dispose();
  }
});

it("exports explicit border clearing over an inherited paragraph style", /** Checks direct empty native boxes survive RTF export/import. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const style = document.MakeTextFormatColl("Bordered", document.GetDfltTextFormatColl());
  const borders = new SvxBoxItem(RES_BOX);
  borders.SetLine(new SvxBorderLine(new Color(0), 30, Style.SOLID), Edge.BOTTOM);
  style.SetFormatAttr(borders);
  const node = document.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  node.ChgFormatColl(style);
  node.SetText("Clear");
  node.SetAttr(new SvxBoxItem(RES_BOX));
  let restored: SwDoc | undefined;
  try {
    const bytes = RtfExport.WriteDocument(document);
    expect(new TextDecoder().decode(bytes)).toContain(
      "\\brdrt\\brdrnone\\brdrl\\brdrnone\\brdrb\\brdrnone\\brdrr\\brdrnone",
    );
    restored = new RtfDocumentImpl().ResolveBytes(bytes);
    expect(box(restored).GetBottom()).toBeUndefined();
  } finally {
    restored?.Dispose();
    document.Dispose();
  }
});

it.each([
  [Style.SOLID, 90],
  [Style.DOTTED, 90],
  [Style.DASHED, 90],
  [Style.DOUBLE, 90],
  [Style.DOUBLE_THIN, 90],
  [Style.THINTHICK_SMALLGAP, 90],
  [Style.THINTHICK_MEDIUMGAP, 90],
  [Style.THINTHICK_LARGEGAP, 90],
  [Style.THICKTHIN_SMALLGAP, 90],
  [Style.THICKTHIN_MEDIUMGAP, 90],
  [Style.THICKTHIN_LARGEGAP, 90],
  [Style.EMBOSSED, 90],
  [Style.ENGRAVED, 90],
  [Style.OUTSET, 95],
  [Style.INSET, 95],
  [Style.FINE_DASHED, 90],
  [Style.DASH_DOT, 90],
  [Style.DASH_DOT_DOT, 90],
] as const)(
  "exports and imports native paragraph border style %i",
  /** Checks each represented source border style through the actual filters. @param style - Native line style. @param width - Source-exact width. @returns Nothing. */ (
    style,
    width,
  ) => {
    const document = createWriterDocument();
    const node = document.paragraphs[0];
    if (node === undefined) throw new Error("Missing paragraph.");
    node.SetText("Border");
    const borders = new SvxBoxItem(RES_BOX);
    for (const edge of [Edge.TOP, Edge.LEFT, Edge.BOTTOM, Edge.RIGHT])
      borders.SetLine(new SvxBorderLine(new Color(0x112233), width, style), edge);
    borders.SetAllDistances(47);
    node.SetAttr(borders);
    let restored: SwDoc | undefined;
    try {
      const bytes = RtfExport.WriteDocument(document);
      expect(new TextDecoder().decode(bytes)).toContain("\\box\\brdr");
      restored = new RtfDocumentImpl().ResolveBytes(bytes);
      for (const edge of [Edge.TOP, Edge.LEFT, Edge.BOTTOM, Edge.RIGHT]) {
        const line = box(restored).GetLine(edge);
        expect(line?.GetBorderLineStyle()).toBe(style === Style.DOUBLE_THIN ? Style.DOUBLE : style);
        expect(line?.GetWidth()).toBe(width);
        expect(line?.GetColor().toUInt32()).toBe(0x112233);
        expect(box(restored).GetDistance(edge)).toBe(40);
      }
    } finally {
      restored?.Dispose();
      document.Dispose();
    }
  },
);

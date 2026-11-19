/** @fileoverview Native paragraph mark formatting through DOCX and ODF automatic text styles. */
import { readFileSync } from "node:fs";
import { assert, expect, it, vi } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontItalic, FontStrikeout, FontWeight } from "../../../../tools/inc/fontenum";
import { Color } from "../../../../tools/inc/color";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "../../core/doc/doc";
import { resolveSwNumberPortionFont } from "../../core/text/txtfld";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
import { MakeTextAttr } from "../../core/txtnode/thints";
import { SwFormatAutoFormat } from "../../core/txtnode/txatbase";
import * as H from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { importWriterXml } from "../xml/xmlimp";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

// These fixtures unpack and reopen native document packages under coverage.
vi.setConfig({ testTimeout: 120_000 });

/** Reads the first paragraph's actual ListAutoFormat set. @param document - Model. @returns Borrowed marker formatting. */
function marker(document: SwDoc) {
  const item = document.paragraphs[0]?.GetAttr(H.RES_PARATR_LIST_AUTOFMT);
  assert(item instanceof SwFormatAutoFormat);
  const properties = item.GetStyleHandle();
  assert(properties);
  return properties;
}

/** Tests color on the marker separately from the visible text. @param document - Native document. @param rgb - Expected color. @returns Nothing. */
function expectMarkerColor(document: SwDoc, rgb: number): void {
  const color = marker(document).GetItemIfSet(H.RES_CHRATR_COLOR, false);
  assert(color instanceof SvxColorItem);
  expect(color.GetValue().IsRGBEqual(new Color(rgb))).toBe(true);
}

it.each([false, true])(
  "emits terminal auto formatting with western overrides %s",
  /** Checks the original shared western/CJK and independent CTL branches on a native EOF hint. @param western - Whether western items are also explicit. @returns Completion. */ async (
    western,
  ) => {
    const doc = new SwDoc();
    const items = new SfxItemSet(doc.GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
    try {
      const node = doc.paragraphs[0];
      assert(node);
      node.SetText("Word");
      const cjk = new SvxFontItem(H.RES_CHRATR_CJK_FONT);
      const ctl = new SvxFontItem(H.RES_CHRATR_CTL_FONT);
      cjk.SetFamilyName("Marker CJK");
      ctl.SetFamilyName("Marker CTL");
      items.Put(cjk);
      items.Put(ctl);
      items.Put(new SvxFontHeightItem(180, 100, H.RES_CHRATR_CJK_FONTSIZE));
      items.Put(new SvxFontHeightItem(240, 100, H.RES_CHRATR_CTL_FONTSIZE));
      items.Put(new SvxPostureItem(FontItalic.ITALIC_NORMAL, H.RES_CHRATR_CJK_POSTURE));
      items.Put(new SvxPostureItem(FontItalic.ITALIC_NORMAL, H.RES_CHRATR_CTL_POSTURE));
      items.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_CJK_WEIGHT));
      items.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_CTL_WEIGHT));
      items.Put(new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_DOUBLE, H.RES_CHRATR_CROSSEDOUT));
      items.Put(new SvxEscapementItem(33, 58, H.RES_CHRATR_ESCAPEMENT));
      items.Put(new SvxAutoKernItem(true, H.RES_CHRATR_AUTOKERN));
      if (western) {
        items.Put(new SvxFontHeightItem(200, 100, H.RES_CHRATR_FONTSIZE));
        items.Put(new SvxPostureItem(FontItalic.ITALIC_NONE, H.RES_CHRATR_POSTURE));
        items.Put(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, H.RES_CHRATR_WEIGHT));
      }
      node.InsertHint(MakeTextAttr(doc, items, node.Len(), node.Len()), SetAttrMode.NOHINTADJUST);
      const bytes = await DocxExport.WriteDocument(doc);
      const xml = await (await DocumentArchive.open(bytes)).readTextEntry("word/document.xml");
      const properties = xml.match(
        /<w:pPr>(?:(?!<\/w:pPr>)[\s\S])*?<w:rPr>([\s\S]*?)<\/w:rPr>/u,
      )?.[1];
      assert(properties);
      expect(properties).toContain(western ? '<w:sz w:val="20"/>' : '<w:sz w:val="18"/>');
      expect(properties).toContain(western ? '<w:b w:val="false"/>' : "<w:b/>");
      expect(properties).toContain(western ? '<w:i w:val="false"/>' : "<w:i/>");
      for (const element of [
        '<w:szCs w:val="24"/>',
        '<w:kern w:val="2"/>',
        '<w:vertAlign w:val="superscript"/>',
        "<w:iCs/>",
        "<w:bCs/>",
        "<w:dstrike/>",
        'w:eastAsia="Marker CJK"',
        'w:cs="Marker CTL"',
      ])
        expect(properties).toContain(element);
    } finally {
      items.Dispose();
      doc.Dispose();
    }
  },
);

it("resolves a terminal named character style through the DOCX style table", /** Checks the native character-format hint branch without giving the visible run a style. @returns Completion. */ async () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("Word");
    const style = doc.MakeCharFormat("Marker Style", doc.GetDfltCharFormat());
    const item = new SwFormatCharFormat(style);
    try {
      node.InsertItem(item, node.Len(), node.Len(), SetAttrMode.NOHINTADJUST);
    } finally {
      item.Dispose();
    }
    const bytes = await DocxExport.WriteDocument(doc);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("word/document.xml");
    expect(xml).toContain('<w:rPr><w:rStyle w:val="MarkerStyle"/></w:rPr></w:pPr>');
    expect(xml.match(/<w:rStyle\b/gu)).toHaveLength(1);
  } finally {
    doc.Dispose();
  }
});

it.each([
  ["paragraph-marker", 0xff0000],
  ["paragraph-marker-formatted-run", 0x008000],
] as const)(
  "retains the original unocore marker-format regression %s",
  /** Compares the marker and visible run across both native file filters. @param fixture - Pinned original. @param color - Original marker RGB. @returns Completion. */ async (
    fixture,
    color,
  ) => {
    const data = readFileSync(
      "../../vendor/libreoffice-reference/sw/qa/core/unocore/data/" + fixture + ".docx",
    );
    const source = await importOOXML(new Uint8Array(data), {});
    const meta = { title: "Paragraph marker" };
    let restored: SwDoc | undefined, exported: SwDoc | undefined;
    try {
      expectMarkerColor(source, color);
      const odt = await writeOdtDocument(source, meta);
      const archive = await DocumentArchive.open(odt);
      const content = await archive.readTextEntry("content.xml");
      expect(content).toMatch(/loext:marker-style-name="T\d+"/u);
      expect(await archive.readTextEntry("settings.xml")).toContain(
        'config:name="ApplyParagraphMarkFormatToNumbering" config:type="boolean">true',
      );
      restored = (await readOdtDocument(odt, meta)).document;
      expectMarkerColor(restored, color);
      const paragraph = restored.paragraphs[0];
      assert(paragraph);
      const markerFont = resolveSwNumberPortionFont(paragraph);
      expect(markerFont?.color).toBe("#" + color.toString(16).padStart(6, "0"));
      const markerWeight = marker(restored).Get(H.RES_CHRATR_WEIGHT);
      assert(markerWeight instanceof SvxWeightItem);
      expect(markerWeight.GetWeight()).toBe(FontWeight.WEIGHT_NORMAL);
      if (fixture === "paragraph-marker-formatted-run") {
        expect(markerFont?.weight).toBe(FontWeight.WEIGHT_NORMAL);
        const run = paragraph.GetCharacterItemsAt(0).Get(H.RES_CHRATR_WEIGHT);
        assert(run instanceof SvxWeightItem);
        expect(run.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
      }
      const docx = await DocxExport.WriteDocument(restored);
      const xml = await (await DocumentArchive.open(docx)).readTextEntry("word/document.xml");
      const properties = xml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/u)?.[0];
      expect(properties).toContain("<w:rPr>");
      expect(properties).toMatch(
        new RegExp('w:val="' + color.toString(16).padStart(6, "0") + '"', "iu"),
      );
      exported = await importOOXML(docx, {});
      expectMarkerColor(exported, color);
    } finally {
      exported?.Dispose();
      restored?.Dispose();
      source.Dispose();
    }
  },
);

it("preserves the original ParagraphMarkerMarkup marker style with a separate text style", /** Replays the two ODF export assertions over the original automatic declarations and paragraph. @returns Completion. */ async () => {
  const flat = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data/ParagraphMarkerMarkup.fodt",
    "utf8",
  );
  const content = flat
    .replaceAll("office:document", "office:document-content")
    .replace(' office:mimetype="application/vnd.oasis.opendocument.text"', "");
  const meta = { title: "Original marker markup" };
  const source = importWriterXml(undefined, content, meta).document;
  let restored: SwDoc | undefined;
  try {
    const odt = await writeOdtDocument(source, meta);
    const xml = await (await DocumentArchive.open(odt)).readTextEntry("content.xml");
    const name = xml.match(/loext:marker-style-name="(T\d+)"/u)?.[1];
    assert(name);
    const style = xml.match(
      new RegExp('<style:style style:name="' + name + '"[^>]*>[\\s\\S]*?</style:style>', "u"),
    )?.[0];
    expect(style).toContain('fo:font-size="9pt"');
    expect(style).toContain('fo:color="#ff0000"');
    restored = (await readOdtDocument(odt, meta)).document;
    expectMarkerColor(restored, 0xff0000);
    const height = marker(restored).GetItemIfSet(H.RES_CHRATR_FONTSIZE, false);
    assert(height instanceof SvxFontHeightItem);
    expect(height.GetHeight()).toBe(180);
    const runSize = restored.paragraphs[0]?.GetCharacterItemsAt(0)?.Get(H.RES_CHRATR_FONTSIZE);
    assert(runSize instanceof SvxFontHeightItem);
    expect(runSize.GetHeight()).toBe(160);
  } finally {
    restored?.Dispose();
    source.Dispose();
  }
});

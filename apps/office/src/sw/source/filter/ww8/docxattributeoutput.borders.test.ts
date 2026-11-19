/** @fileoverview Original Writer page-border QA through DOCX, ODF and the Worker graph. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SvxBoxItemLine as Edge } from "../../../../editeng/source/items/frmitems";
import { SvxShadowLocation } from "../../../../editeng/inc/svxenum";
import type { SvxShadowItem } from "../../../../editeng/source/items/frmitems.shadow";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2 as borderType,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { RES_SHADOW } from "../../../inc/hintids";
import { SwDoc } from "../../core/doc/doc";
import { unicode } from "../../core/unocore/unocrsrhelper";
import { SwXPageStyle } from "../../core/unocore/unostyle";
import { NS_ooxml as N } from "../../writerfilter/inc/ooxml/resourceids";
import { PageBordersHandler } from "../../writerfilter/dmapper/PageBordersHandler";
import { SectionPropertyMap } from "../../writerfilter/dmapper/PropertyMap";
import {
  OOXMLProperty,
  OOXMLPropertyType,
  OOXMLValue,
} from "../../writerfilter/ooxml/OOXMLPropertySet";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { importWriterXml } from "../xml/xmlimp";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

/** Reads an unchanged pinned upstream export fixture. @param name - Original DOCX filename. @returns Fixture. */
function fixture(name: string): Uint8Array {
  return new Uint8Array(
    readFileSync(`../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/${name}`),
  );
}

/** Exports the genuine Word package and reads its body. @param doc - Writer graph. @returns Main part XML. */
async function body(doc: SwDoc): Promise<string> {
  return (await DocumentArchive.open(await DocxExport.WriteDocument(doc))).readTextEntry(
    "word/document.xml",
  );
}

/** Changes a single fixture part through the production package writer. @param input - Original package. @param part - Existing XML part. @param change - Source transformation. @returns Modified fixture. */
async function modify(
  input: Uint8Array,
  part: string,
  change: (xml: string) => string,
): Promise<Uint8Array> {
  const archive = await DocumentArchive.open(input);
  const output = new DocumentArchiveWriter();
  for (const name of archive.getEntryNames())
    output.putNextEntry(
      name,
      name === part
        ? new TextEncoder().encode(change(await archive.readTextEntry(name)))
        : await archive.readEntry(name),
    );
  return output.finish();
}

/** Sets the original page-style property and releases its temporary values. @param style - Target UNO style. @param property - Original name. @param value - UNO value. @returns Nothing. */
function set(style: SwXPageStyle, property: string, value: Any): void {
  const name = unicode(property);
  try {
    style.setPropertyValue(name, value);
  } finally {
    value.dispose();
    name.dispose();
  }
}

it("ports testPageBorderShadow and preserves the page shadow through browser storage", /** Checks the native item, Worker clone, primary ODT and DOCX output. @returns Completion. */ async () => {
  const doc = await importOOXML(fixture("page-border-shadow.docx"), {});
  let worker: SwDoc | undefined;
  let loaded: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    const odt = await writeOdtDocument(worker, { title: "Page borders" });
    loaded = (await readOdtDocument(odt, { title: "Page borders" })).document;
    for (const owner of [doc, worker, loaded]) {
      const master = owner.GetPageDesc().GetMaster();
      const shadow = master.GetAttrSet().Get(RES_SHADOW) as SvxShadowItem;
      expect(shadow.GetColor().toUInt32()).toBe(0);
      expect(shadow.GetLocation()).toBe(SvxShadowLocation.BottomRight);
      expect(shadow.GetWidth()).toBe(120);
      expect(master.GetBox().GetRight()?.GetScaledWidth()).toBe(120);
    }
    const xml = await body(loaded);
    expect(xml).toMatch(/<w:pgBorders[^>]*><w:top[^>]*w:shadow="1"/u);
    expect(xml).toMatch(/<w:right[^>]*w:sz="48"[^>]*w:shadow="1"/u);
    const reopened = await importOOXML(await DocxExport.WriteDocument(loaded), {});
    try {
      expect(reopened.GetPageDesc().GetMaster().GetBox().GetRight()?.GetScaledWidth()).toBe(120);
    } finally {
      reopened.Dispose();
    }
  } finally {
    loaded?.Dispose();
    worker?.Dispose();
    doc.Dispose();
  }
});

it("ports testPageBorderSpacingExportCase2 with the real page-edge fixture", /** Tests the native offset heuristic and two independently exported sides. @returns Completion. */ async () => {
  const doc = await importOOXML(fixture("page-borders-export-case-2.docx"), {});
  try {
    const xml = await body(doc);
    expect(xml).toContain('<w:pgBorders w:display="allPages" w:offsetFrom="page">');
    expect(xml).toMatch(/<w:left[^>]*w:space="24"/u);
    expect(xml).toMatch(/<w:right[^>]*w:space="24"/u);
  } finally {
    doc.Dispose();
  }
});

it("ports testNegativePageBorder without moving the Word page text margin", /** Covers the upstream negative signed distance on a UNO-created page style. @returns Completion. */ async () => {
  const doc = new SwDoc();
  try {
    doc.paragraphs[0]?.SetText("test");
    const page = doc.GetPageDesc();
    const style = new SwXPageStyle(doc, page);
    const line = new BorderLine2();
    line.LineWidth = line.OuterLineWidth = 159;
    set(style, "TopMargin", new Any([501], "sal_Int32"));
    set(style, "TopBorder", new Any(line, borderType));
    set(style, "TopBorderDistance", new Any([-646], "sal_Int32"));
    expect(page.GetMaster().GetBox().GetDistance(Edge.TOP, true)).toBe(-366);
    const xml = await body(doc);
    expect(xml).toMatch(/<w:pgMar[^>]*w:top="284"/u);
    expect(xml).toMatch(/<w:top[^>]*w:sz="36" w:space="28"/u);
  } finally {
    doc.Dispose();
  }
});

it("keeps the source display and shadow asymmetry for the page box", /** Uses the source test package but makes left the only shadowed side and suppresses an explicit none. @returns Completion. */ async () => {
  const input = await modify(
    fixture("page-border-shadow.docx"),
    "word/document.xml",
    /** Changes only the native page-border options. @param xml - Original Word body. @returns Mutated body. */ (
      xml,
    ) =>
      xml.replace(
        /<w:pgBorders\b[^>]*>[\s\S]*?<\/w:pgBorders>/u,
        '<w:pgBorders w:display="firstPage" w:offsetFrom="text"><w:top w:val="none"/><w:left w:val="dotted" w:sz="8" w:space="4" w:color="A1B2C3" w:shadow="1"/></w:pgBorders>',
      ),
  );
  const doc = await importOOXML(input, {});
  try {
    const master = doc.GetPageDesc().GetMaster();
    expect(master.GetBox().GetTop()).toBeUndefined();
    expect(master.GetBox().GetDistance(Edge.LEFT)).toBe(80);
    expect((master.GetAttrSet().Get(RES_SHADOW) as SvxShadowItem).GetLocation()).toBe(
      SvxShadowLocation.NONE,
    );
    const xml = await body(doc);
    expect(xml).toContain(
      '<w:pgBorders w:display="allPages" w:offsetFrom="text"><w:left w:val="dotted" w:sz="8" w:space="4" w:color="A1B2C3"/>',
    );
  } finally {
    doc.Dispose();
  }
});

it.each([false, true])(
  "preserves the gutter and the native offset formula (top: %s)",
  /** Uses actual Word and ODF import and export settings. @param gutterAtTop - Physical gutter placement. @returns Completion. */ async (
    gutterAtTop,
  ) => {
    const fixtureBytes = fixture("page-border-shadow.docx");
    const bodyBytes = await modify(
      fixtureBytes,
      "word/document.xml",
      /** Sets an edge offset and a quarter-inch gutter. @param xml - Body fixture. @returns Modified XML. */ (
        xml,
      ) =>
        xml
          .replace(/w:gutter="\d+"/u, 'w:gutter="360"')
          .replace(
            /<w:pgBorders\b[^>]*>[\s\S]*?<\/w:pgBorders>/u,
            '<w:pgBorders w:display="notFirstPage" w:offsetFrom="page"><w:top w:val="single" w:sz="8" w:space="24"/><w:left w:val="single" w:sz="8" w:space="24"/></w:pgBorders>',
          ),
    );
    const bytes = gutterAtTop
      ? await modify(
          bodyBytes,
          "word/settings.xml",
          /** Sets the original top gutter switch. @param xml - Settings XML. @returns Modified settings. */ (
            xml,
          ) => xml.replace("</w:settings>", "<w:gutterAtTop/></w:settings>"),
        )
      : bodyBytes;
    const doc = await importOOXML(bytes, {});
    let restored: SwDoc | undefined;
    try {
      const master = doc.GetPageDesc().GetMaster();
      expect(master.GetLRSpace().GetGutterMargin()).toBe(360);
      expect(master.GetLRSpace().ResolveLeft()).toBe(gutterAtTop ? 480 : 120);
      expect(master.GetULSpace().GetUpper()).toBe(gutterAtTop ? 120 : 480);
      restored = (
        await readOdtDocument(await writeOdtDocument(doc, { title: "Gutter" }), { title: "Gutter" })
      ).document;
      expect(restored.GetPageDesc().GetMaster().GetLRSpace().GetGutterMargin()).toBe(360);
      expect(restored.GetDocumentSettingManager().get("GUTTER_AT_TOP")).toBe(gutterAtTop);
      const xml = await body(restored);
      expect(xml).toMatch(/<w:pgBorders[^>]*w:offsetFrom="page"/u);
      expect(xml).toMatch(/<w:top[^>]*w:space="24"/u);
      expect(xml).toMatch(/<w:left[^>]*w:space="24"/u);
    } finally {
      restored?.Dispose();
      doc.Dispose();
    }
  },
);

it("ignores stacking order and side modifiers with no properties", /** Exercises native generated attributes and missing nested input. @returns Nothing. */ () => {
  const handler = new PageBordersHandler();
  const section = new SectionPropertyMap(true);
  try {
    const empty = new OOXMLValue();
    handler.attribute(N.LN_CT_PageBorders_zOrder, OOXMLValue.createInteger(92382));
    handler.attribute(N.LN_CT_PageBorders_display, OOXMLValue.createInteger(92383));
    handler.sprm(new OOXMLProperty(N.LN_CT_PageBorders_bottom, empty, OOXMLPropertyType.SPRM));
    handler.sprm(new OOXMLProperty(N.LN_CT_PageMar_right, empty, OOXMLPropertyType.SPRM));
    handler.SetBorders(section);
  } finally {
    section.dispose();
  }
});

it("ignores invalid page-layout border values while retaining the valid shorthand", /** Tests ODF compatibility through the actual page style reader. @returns Completion. */ async () => {
  const doc = new SwDoc();
  let reopened: SwDoc | undefined;
  try {
    const archive = await DocumentArchive.open(
      await writeOdtDocument(doc, { title: "Page layout" }),
    );
    const xml = (await archive.readTextEntry("styles.xml")).replace(
      "<style:page-layout-properties ",
      '<style:page-layout-properties fo:border="1pt solid #123456" fo:border-top="broken" style:border-line-width-left="broken" fo:padding="2pt" fo:padding-left="bogus" loext:margin-gutter="bogus" ',
    );
    reopened = importWriterXml(xml, undefined, { title: "Page layout" }).document;
    const master = reopened.GetPageDesc().GetMaster();
    expect(master.GetBox().GetTop()?.GetColor().toUInt32()).toBe(0x123456);
    expect(master.GetBox().GetLeft()?.GetWidth()).toBe(20);
    expect(master.GetBox().GetDistance(Edge.LEFT)).toBe(40);
    expect(master.GetLRSpace().GetGutterMargin()).toBe(0);
  } finally {
    reopened?.Dispose();
    doc.Dispose();
  }
});

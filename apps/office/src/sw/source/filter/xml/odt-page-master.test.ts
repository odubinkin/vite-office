/** @fileoverview Writer ODF page-layout regression cases for native page descriptor items. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { getPageBodyGeometry, UseOnPage } from "../../core/layout/pagedesc";
import { SwTextGrid } from "../../../inc/tgrditem";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { exportSettingsXml } from "./xmlexp-settings";
import { exportStylesXml } from "./xmlexp";
import { importWriterXml } from "./xmlimp";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = { title: "Page masters" };
const root = "../../vendor/libreoffice-reference/sw/qa/extras";
const namespaces = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:loext="${ODF_NAMESPACES.loext}"`;

/** Creates independent page style XML. @param attributes - Attributes on the layout element. @param properties - Layout property attributes. @param defaults - Global defaults. @returns Styles document. */
function styles(attributes: string, properties: string, defaults = ""): string {
  return `<office:document-styles ${namespaces}><office:styles>${defaults}</office:styles><office:automatic-styles><style:page-layout style:name="pm1" ${attributes}><style:page-layout-properties fo:page-width="8in" fo:page-height="11in" ${properties}/></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm1"/></office:master-styles></office:document-styles>`;
}

/** Reads the exported master properties independently of the native model. @param xml - Styles stream. @returns Named page properties. */
function layoutProperties(xml: string): Element {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const layout = document.getElementsByTagNameNS(ODF_NAMESPACES.style, "page-layout")[0];
  const properties = layout?.firstElementChild;
  assert(properties);
  return properties;
}

it("ports testGutterLeft with the pinned gutter-left fixture", /** Checks the base margin, binding allowance, and serialized sum. @returns Completion. */ async () => {
  const source = await readOdtDocument(
    new Uint8Array(readFileSync(`${root}/odfexport/data/gutter-left.odt`)),
    metadata,
  );
  let reopened: ReturnType<typeof createWriterDocument> | undefined;
  try {
    const page = source.document.GetPageDesc(0);
    expect(page.GetValue().leftMargin).toBe(1440);
    expect(page.GetMaster().GetLRSpace().GetGutterMargin()).toBe(720);
    expect(getPageBodyGeometry(page).leftMargin).toBe(2160);
    const bytes = await writeOdtDocument(source.document, metadata);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("styles.xml");
    const properties = layoutProperties(xml);
    expect(properties.getAttributeNS(ODF_NAMESPACES.fo, "margin-left")).toBe("3.81cm");
    expect(properties.getAttributeNS(ODF_NAMESPACES.loext, "margin-gutter")).toBe("1.27cm");
    reopened = (await readOdtDocument(bytes, metadata)).document;
    expect(reopened.GetPageDesc(0).GetValue().leftMargin).toBe(1440);
    expect(reopened.GetPageDesc(0).GetMaster().GetLRSpace().GetGutterMargin()).toBe(720);
  } finally {
    reopened?.Dispose();
    source.document.Dispose();
  }
});

it("ports testPageStyleLayoutDefault with the pinned hello fixture", /** Checks source absence and the default emission contract. @returns Completion. */ async () => {
  const { document } = await readOdtDocument(
    new Uint8Array(readFileSync(`${root}/odfimport/data/hello.odt`)),
    metadata,
  );
  try {
    expect(document.GetPageDesc(0).GetUseOn()).toBe(UseOnPage.All);
    const properties = layoutProperties(exportStylesXml(document));
    expect(properties.parentElement?.hasAttributeNS(ODF_NAMESPACES.style, "page-usage")).toBe(
      false,
    );
  } finally {
    document.Dispose();
  }
});

it("round-trips mirrored layout, signed overrides and RTL binding through Worker and ODT", /** Checks shared margin fallback, physical gutter sides and page-format transfer. @returns Nothing. */ () => {
  const document = importWriterXml(
    styles(
      'style:page-usage="mirrored"',
      'fo:margin="1in" fo:margin-left="-0.1in" fo:margin-right="1in" style:writing-mode="rl-tb" loext:margin-gutter="0.25in"',
    ),
    undefined,
    metadata,
  ).document;
  const worker = decodeWriterDocument(encodeWriterDocument(document));
  const xml = exportStylesXml(worker);
  const reopened = importWriterXml(xml, undefined, metadata).document;
  try {
    for (const copy of [document, worker, reopened]) {
      const page = copy.GetPageDesc(0);
      expect(page.GetUseOn()).toBe(UseOnPage.Mirror);
      expect(page.GetValue()).toMatchObject({
        leftMargin: -144,
        rightMargin: 1080,
        topMargin: 1440,
        bottomMargin: 1440,
      });
      expect(page.GetMaster().GetRtlGutter()).toBe(true);
      expect(page.GetLeft().GetLRSpace().ResolveLeft()).toBe(1080);
      expect(page.GetFirstLeft().GetLRSpace().GetRightGutterMargin()).toBe(360);
      expect(getPageBodyGeometry(page).rightMargin).toBe(1440);
    }
    const properties = layoutProperties(xml);
    expect(properties.parentElement?.getAttributeNS(ODF_NAMESPACES.style, "page-usage")).toBe(
      "mirrored",
    );
    expect(properties.getAttributeNS(ODF_NAMESPACES.style, "writing-mode")).toBe("rl-tb");
    expect(properties.getAttributeNS(ODF_NAMESPACES.fo, "margin-right")).toBe("2.54cm");
  } finally {
    reopened.Dispose();
    worker.Dispose();
    document.Dispose();
  }
});

it("retains shorthand margin before adding gutter and exports native line grid mode", /** Checks the original shorthand distinction and squared grid emission. @returns Nothing. */ () => {
  const { document } = importWriterXml(
    styles(
      'style:page-usage="right"',
      'fo:margin="1in" loext:margin-gutter="0.25in" style:layout-grid-mode="line" style:layout-grid-standard-mode="false"',
    ),
    undefined,
    metadata,
  );
  try {
    const page = document.GetPageDesc(0);
    expect(page.GetUseOn()).toBe(UseOnPage.Right);
    expect(page.GetValue().leftMargin).toBe(1440);
    expect(getPageBodyGeometry(page).leftMargin).toBe(1800);
    expect(page.GetMaster().GetTextGrid().GetGridType()).toBe(SwTextGrid.LinesOnly);
    const properties = layoutProperties(exportStylesXml(document));
    expect(properties.getAttributeNS(ODF_NAMESPACES.style, "layout-grid-mode")).toBe("line");
    expect(properties.hasAttributeNS(ODF_NAMESPACES.style, "layout-grid-base-width")).toBe(false);
    expect(properties.hasAttributeNS(ODF_NAMESPACES.style, "layout-grid-snap-to")).toBe(false);
  } finally {
    document.Dispose();
  }
});

it("retains top gutter settings and CJK grid property order across ODT", /** Checks the document setting before style import and the default grid style. @returns Completion. */ async () => {
  const settings = createWriterDocument();
  settings.GetDocumentSettingManager().set("GUTTER_AT_TOP", true);
  const document = importWriterXml(
    styles(
      'style:page-usage="left"',
      'fo:margin="1in" fo:margin-top="1.25in" loext:margin-gutter="0.25in" style:layout-grid-color="#112233" style:layout-grid-lines="36" style:layout-grid-base-height="20pt" style:layout-grid-ruby-height="8pt" style:layout-grid-mode="both" style:layout-grid-base-width="18pt" style:layout-grid-snap-to="false" style:layout-grid-display="false"',
      '<style:default-page-layout><style:page-layout-properties style:layout-grid-standard-mode="true"/></style:default-page-layout>',
    ),
    undefined,
    metadata,
    undefined,
    { settingsXml: exportSettingsXml(settings) },
  ).document;
  let reopened: ReturnType<typeof createWriterDocument> | undefined;
  try {
    reopened = (await readOdtDocument(await writeOdtDocument(document, metadata), metadata))
      .document;
    for (const copy of [document, reopened]) {
      const page = copy.GetPageDesc(0);
      expect(page.GetUseOn()).toBe(UseOnPage.Left);
      expect(page.GetValue().topMargin).toBe(1440);
      expect(getPageBodyGeometry(page).topMargin).toBe(1800);
      const grid = page.GetMaster().GetTextGrid();
      expect(grid.GetGridType()).toBe(SwTextGrid.LinesAndChars);
      expect(grid.GetLines()).toBe(36);
      expect(grid.GetBaseWidth()).toBe(360);
      expect(grid.GetBaseHeight()).toBe(400);
      expect(grid.GetRubyHeight()).toBe(160);
      expect(grid.IsSquaredMode()).toBe(false);
      expect(grid.IsSnapToChars()).toBe(false);
      expect(grid.IsDisplayGrid()).toBe(false);
      expect(grid.GetColor().toInt32() & 0xffffff).toBe(0x112233);
    }
  } finally {
    reopened?.Dispose();
    document.Dispose();
    settings.Dispose();
  }
});

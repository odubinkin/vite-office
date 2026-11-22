/** @fileoverview Calc ODS page master retention and native print property round trips. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScVObjMode } from "../../../inc/global";
import type { ScPageHFItem, ScPageScaleToItem, ScViewObjectModeItem } from "../../../inc/attrib";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import type { SfxUInt16Item } from "../../../../svl/inc/intitem";
import type { SvxSetItem } from "../../../../svx/inc/pageitem";
import type { SvxSizeItem } from "../../../../editeng/inc/sizeitem";
import type { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import type { SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import type { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { SvxBoxItemLine, type SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import {
  ATTR_BACKGROUND,
  ATTR_BORDER,
  ATTR_LRSPACE,
  ATTR_ULSPACE,
  ATTR_PAGE_CHARTS,
  ATTR_PAGE_DYNAMIC,
  ATTR_PAGE_HEADERRIGHT,
  ATTR_PAGE_HEADERFIRST,
  ATTR_PAGE_HEADERSET,
  ATTR_PAGE_FOOTERRIGHT,
  ATTR_PAGE_FOOTERFIRST,
  ATTR_PAGE_FOOTERSET,
  ATTR_PAGE_ON,
  ATTR_PAGE_SHARED,
  ATTR_PAGE_SHARED_FIRST,
  ATTR_PAGE_SIZE,
  ATTR_PAGE_DRAWINGS,
  ATTR_PAGE_OBJECTS,
  ATTR_PAGE_NOTES,
  ATTR_PAGE_FORMULAS,
  ATTR_PAGE_NULLVALS,
  ATTR_PAGE_FIRSTPAGENO,
  ATTR_PAGE_SCALE,
  ATTR_PAGE_SCALETOPAGES,
  ATTR_PAGE_SCALETO,
} from "../../../inc/scitems";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

/** Gets the actual Calc style owner. @param document - Workbook. @param name - Native name. @returns Page item set. */
function items(document: ScDocument, name: string) {
  const result = document.GetStyleSheetPool()?.GetPageStyle(name)?.GetItemSet();
  assert(result);
  return result;
}

/** Reads the exported XML property element referenced by a named master. @param xml - Styles stream. @param name - Programmatic master name. @returns Layout properties. */
function layout(xml: string, name: string): Element {
  const dom = new DOMParser().parseFromString(xml, "application/xml");
  const style = ODF_NAMESPACES.style;
  const find =
    /** Looks up a named style in the exported XML. @param element - Local element name. @param value - XML style name. @returns Matching style. */ (
      element: string,
      value: string,
    ) =>
      Array.from(dom.getElementsByTagNameNS(style, element)).find(
        /** Matches the source style:name attribute. @param entry - Candidate element. @returns Whether the name matches. */
        (entry) => entry.getAttributeNS(style, "name") === value,
      );
  const master = find("master-page", name);
  assert(master);
  const reference = master.getAttributeNS(style, "page-layout-name");
  assert(reference);
  const result = find("page-layout", reference)?.firstElementChild;
  assert(result);
  return result;
}

it("ports testTdf154445_unused_pagestyles with the pinned tdf108188 package", /** Confirms an unused named page master remains after Worker and ODS export. @returns Completion. */ async () => {
  const source = await readOdsDocument(
    new Uint8Array(
      readFileSync(
        "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf108188_pagestyle.ods",
      ),
    ),
  );
  try {
    expect(source.GetPageStyle(0)).toBe("TestPageStyle");
    source.SetPageStyle(0, "Default");
    const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    try {
      const bytes = await writeOdsDocument(worker);
      const reopened = await readOdsDocument(bytes);
      try {
        for (const copy of [worker, reopened]) {
          expect(copy.GetPageStyle(0)).toBe("Default");
          expect(copy.GetStyleSheetPool()?.GetPageStyle("TestPageStyle")).toBeTruthy();
        }
        const xml = await (await DocumentArchive.open(bytes)).readTextEntry("styles.xml");
        expect(layout(xml, "Default")).toBeDefined();
        expect(layout(xml, "TestPageStyle")).toBeDefined();
      } finally {
        reopened.Dispose();
      }
    } finally {
      worker.Dispose();
    }
  } finally {
    source.Dispose();
  }
});

it("preserves direct print options and signed scale values without materializing defaults", /** Checks independent native flag, direct-state and serialized XML contracts. @returns Completion. */ async () => {
  const source = new ScDocument();
  const importer = new ScXMLImport(source);
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:table="${ODF_NAMESPACES.table}"`;
  const definitions = [
    [
      "Selected",
      'style:print="objects  formulas annotations&#9;grid drawings" style:scale-to="85.6%" style:first-page-number="-2"',
    ],
    ["Empty", 'style:print="" style:scale-to="0%"'],
    ["Default", ""],
    [
      "Fitted",
      'style:scale-to-X="2" style:scale-to-pages="3" style:scale-to="75%" style:scale-to-Y="0"',
    ],
  ];
  try {
    importer.importStyles(
      `<office:document-styles ${ns}><office:automatic-styles>${definitions
        .map(
          /** Serializes an independent input page layout. @param entry - Layout name and literal attributes. @returns XML. */
          ([name, value]) =>
            `<style:page-layout style:name="p${name}"><style:page-layout-properties ${value}/></style:page-layout>`,
        )
        .join("")}</office:automatic-styles><office:master-styles>${definitions
        .map(
          /** Associates an input master with its page layout. @param entry - Master name and attributes. @returns XML. */
          ([name]) => `<style:master-page style:name="${name}" style:page-layout-name="p${name}"/>`,
        )
        .join("")}</office:master-styles></office:document-styles>`,
    );
    importer.importContent(
      `<office:document-content ${ns}><office:body><office:spreadsheet><table:table table:name="Sheet1"/></office:spreadsheet></office:body></office:document-content>`,
    );
    const bytes = await writeOdsDocument(source);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("styles.xml");
    const style = ODF_NAMESPACES.style;
    expect(layout(xml, "Selected").getAttributeNS(style, "print")).toBe(
      "drawings formulas objects",
    );
    expect(layout(xml, "Selected").getAttributeNS(style, "scale-to")).toBe("86%");
    expect(layout(xml, "Selected").getAttributeNS(style, "first-page-number")).toBe("-2");
    expect(layout(xml, "Empty").getAttributeNS(style, "print")).toBe("");
    expect(layout(xml, "Empty").hasAttributeNS(style, "scale-to")).toBe(false);
    expect(layout(xml, "Default").hasAttributeNS(style, "print")).toBe(false);
    expect(layout(xml, "Default").hasAttributeNS(style, "table-centering")).toBe(false);
    expect(layout(xml, "Fitted").getAttributeNS(style, "scale-to-X")).toBe("2");
    for (const name of ["scale-to", "scale-to-pages", "scale-to-Y"])
      expect(layout(xml, "Fitted").hasAttributeNS(style, name)).toBe(false);

    const reopened = await readOdsDocument(bytes);
    try {
      for (const copy of [source, reopened]) {
        const selected = items(copy, "Selected");
        expect((selected.Get(ATTR_PAGE_CHARTS) as ScViewObjectModeItem).GetValue()).toBe(
          ScVObjMode.VOBJ_MODE_HIDE,
        );
        for (const which of [ATTR_PAGE_DRAWINGS, ATTR_PAGE_OBJECTS])
          expect((selected.Get(which) as ScViewObjectModeItem).GetValue()).toBe(
            ScVObjMode.VOBJ_MODE_SHOW,
          );
        expect((selected.Get(ATTR_PAGE_FORMULAS) as SfxBoolItem).GetValue()).toBe(true);
        for (const which of [ATTR_PAGE_NOTES, ATTR_PAGE_NULLVALS])
          expect((selected.Get(which) as SfxBoolItem).GetValue()).toBe(false);
        expect((selected.Get(ATTR_PAGE_FIRSTPAGENO) as SfxUInt16Item).GetValue()).toBe(65534);
        const fitted = items(copy, "Fitted");
        expect(fitted.GetItemIfSet(ATTR_PAGE_SCALE, false)).toBeUndefined();
        expect(fitted.GetItemIfSet(ATTR_PAGE_SCALETOPAGES, false)).toBeUndefined();
        const fit = fitted.Get(ATTR_PAGE_SCALETO) as ScPageScaleToItem;
        expect([fit.GetWidth(), fit.GetHeight()]).toEqual([2, 0]);
      }
    } finally {
      reopened.Dispose();
    }
  } finally {
    source.Dispose();
  }
});

it("keeps different page usages in separate ODS layouts", /** Checks layout deduplication across different page usages. @returns Completion. */ async () => {
  const source = new ScDocument();
  const importer = new ScXMLImport(source);
  const { office, style, table } = ODF_NAMESPACES;
  const ns = `xmlns:office="${office}" xmlns:style="${style}" xmlns:table="${table}"`;
  try {
    importer.importStyles(`<office:document-styles ${ns}>
      <office:automatic-styles>
        <style:page-layout style:name="left" style:page-usage="left"><style:page-layout-properties/></style:page-layout>
        <style:page-layout style:name="right" style:page-usage="right"><style:page-layout-properties/></style:page-layout>
      </office:automatic-styles>
      <office:master-styles>
        <style:master-page style:name="LeftPage" style:page-layout-name="left"/>
        <style:master-page style:name="RightPage" style:page-layout-name="right"/>
      </office:master-styles>
    </office:document-styles>`);
    importer.importContent(
      `<office:document-content ${ns}><office:body><office:spreadsheet><table:table table:name="Sheet1"/></office:spreadsheet></office:body></office:document-content>`,
    );
    const bytes = await writeOdsDocument(source);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("styles.xml");
    expect(layout(xml, "LeftPage").parentElement?.getAttributeNS(style, "page-usage")).toBe("left");
    expect(layout(xml, "RightPage").parentElement?.getAttributeNS(style, "page-usage")).toBe(
      "right",
    );
  } finally {
    source.Dispose();
  }
});

/** Reads the native plain text of a master page's center region. @param document - Workbook. @param which - Variant slot. @returns Center text. */
function centerText(document: ScDocument, which: number): string {
  const item = items(document, "Default").Get(which) as ScPageHFItem;
  const region = item.GetCenterArea();
  assert(region);
  const value = region.GetText(0);
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}

/** Reads one native header/footer property set. @param document - Workbook. @param name - Page style. @param which - Header or footer WhichId. @returns Nested native items. */
function headerFooterItems(document: ScDocument, name: string, which: number) {
  return (items(document, name).Get(which) as SvxSetItem).GetItemSet();
}

it("ports testHeaderFooterContentODS with pinned Default and Report master pages", /** Replays native first and right content through Worker and ODS. @returns Completion. */ async () => {
  const source = await readOdsDocument(
    new Uint8Array(
      readFileSync(
        "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/header-footer-content.ods",
      ),
    ),
  );
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    const bytes = await writeOdsDocument(worker);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("styles.xml");
    expect(xml).toContain("<style:header><text:p>header</text:p></style:header>");
    expect(xml).toContain('<style:header-left style:display="false"/>');
    expect(xml).toContain(
      "<style:footer-first><text:p>first<text:s/>page<text:s/>footer</text:p></style:footer-first>",
    );
    reopened = await readOdsDocument(bytes);
    for (const document of [source, worker, reopened]) {
      expect(centerText(document, ATTR_PAGE_HEADERRIGHT)).toBe("header");
      expect(centerText(document, ATTR_PAGE_HEADERFIRST)).toBe("first page header");
      expect(centerText(document, ATTR_PAGE_FOOTERRIGHT)).toBe("footer");
      expect(centerText(document, ATTR_PAGE_FOOTERFIRST)).toBe("first page footer");
      const report = headerFooterItems(document, "Report", ATTR_PAGE_HEADERSET);
      expect((report.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize().Height()).toBe(425);
      expect((report.Get(ATTR_ULSPACE) as SvxULSpaceItem).GetLower()).toBe(142);
      expect((report.Get(ATTR_BACKGROUND) as SvxBrushItem).GetColor().toUInt32()).toBe(0xc0c0c0);
      expect((report.Get(ATTR_BORDER) as SvxBoxItem).GetLine(SvxBoxItemLine.LEFT)).toBeDefined();
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("preserves nested layout members, independent sharing and empty region omission", /** Exercises Calc's original native property slots and serialized regional grammar. @returns Completion. */ async () => {
  const source = new ScDocument();
  const importer = new ScXMLImport(source);
  const ns = Object.entries(ODF_NAMESPACES)
    .map(
      /** Emits the source vocabulary. @param entry - Namespace definition. @returns Declaration. */ ([
        prefix,
        uri,
      ]) => `xmlns:${prefix}="${uri}"`,
    )
    .join(" ");
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    importer.importStyles(`<office:document-styles ${ns}><office:automatic-styles>
      <style:page-layout style:name="p"><style:page-layout-properties/>
        <style:header-style><style:header-footer-properties fo:min-height="16pt" fo:margin="3pt" fo:margin-left="4pt" fo:margin-bottom="7pt" fo:background-color="#abcdef" fo:border="1pt solid #123456" fo:padding="2pt" fo:padding-top="3pt"/></style:header-style>
        <style:footer-style><style:header-footer-properties svg:height="18pt" fo:margin-top="4pt" fo:background-color="transparent"/></style:footer-style>
      </style:page-layout>
      </office:automatic-styles><office:master-styles><style:master-page style:name="Default" style:page-layout-name="p">
        <style:header><style:region-left><text:p/></style:region-left><style:region-center><text:p>center</text:p></style:region-center></style:header>
        <style:header-left><style:region-left><text:p>left</text:p></style:region-left><style:region-center><text:p/></style:region-center><style:region-right><text:p>right</text:p></style:region-right></style:header-left>
        <style:header-first style:display="false"><text:p>stored<text:s/>first</text:p></style:header-first>
        <style:footer style:display="false"><text:p>stored footer</text:p></style:footer>
        <style:footer-left><text:p>stored<text:s/>left<text:s/>footer</text:p></style:footer-left>
      </style:master-page></office:master-styles></office:document-styles>`);
    importer.importContent(
      `<office:document-content ${ns}><office:body><office:spreadsheet><table:table table:name="Sheet1"/></office:spreadsheet></office:body></office:document-content>`,
    );
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    const bytes = await writeOdsDocument(worker);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("styles.xml");
    expect(xml).toContain("<style:header><text:p>center</text:p></style:header>");
    expect(xml).toContain(
      "<style:header-left><style:region-left><text:p>left</text:p></style:region-left><style:region-right><text:p>right</text:p></style:region-right></style:header-left>",
    );
    expect(xml).toContain(
      '<style:header-first style:display="false"><text:p>stored<text:s/>first</text:p></style:header-first>',
    );
    expect(xml).toContain(
      '<style:footer-left style:display="false"><text:p>stored<text:s/>left<text:s/>footer</text:p></style:footer-left>',
    );
    const headerProperties = layout(xml, "Default").parentElement?.getElementsByTagNameNS(
      ODF_NAMESPACES.style,
      "header-footer-properties",
    )[0];
    assert(headerProperties);
    expect(headerProperties.getAttributeNS(ODF_NAMESPACES.fo, "background-color")).toBe("#abcdef");
    expect(headerProperties.getAttributeNS(ODF_NAMESPACES.fo, "border")).toMatch(/solid #123456$/u);
    expect(headerProperties.hasAttributeNS(ODF_NAMESPACES.fo, "border-left")).toBe(false);
    expect(headerProperties.hasAttributeNS(ODF_NAMESPACES.fo, "padding")).toBe(false);
    reopened = await readOdsDocument(bytes);
    for (const document of [source, worker, reopened]) {
      const header = headerFooterItems(document, "Default", ATTR_PAGE_HEADERSET);
      const footer = headerFooterItems(document, "Default", ATTR_PAGE_FOOTERSET);
      const margins = header.Get(ATTR_LRSPACE) as SvxLRSpaceItem;
      const box = header.Get(ATTR_BORDER) as SvxBoxItem;
      expect([margins.ResolveLeft(), margins.ResolveRight()]).toEqual([80, 60]);
      expect(box.GetDistance(SvxBoxItemLine.TOP)).toBe(60);
      expect(box.GetDistance(SvxBoxItemLine.BOTTOM)).toBe(40);
      expect((header.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize().Height()).toBe(320);
      expect((header.Get(ATTR_ULSPACE) as SvxULSpaceItem).GetLower()).toBe(140);
      expect((header.Get(ATTR_PAGE_DYNAMIC) as SfxBoolItem).GetValue()).toBe(true);
      expect((header.Get(ATTR_PAGE_SHARED) as SfxBoolItem).GetValue()).toBe(false);
      expect((header.Get(ATTR_PAGE_SHARED_FIRST) as SfxBoolItem).GetValue()).toBe(true);
      expect((footer.Get(ATTR_PAGE_ON) as SfxBoolItem).GetValue()).toBe(false);
      expect((footer.Get(ATTR_PAGE_SHARED) as SfxBoolItem).GetValue()).toBe(true);
      expect((footer.Get(ATTR_PAGE_DYNAMIC) as SfxBoolItem).GetValue()).toBe(false);
      expect((footer.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize().Height()).toBe(360);
      expect((footer.Get(ATTR_ULSPACE) as SvxULSpaceItem).GetUpper()).toBe(80);
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("requires the right-page declaration before its left and first-page variants", /** Replays original master-page child gating and page-style reset. @returns Nothing. */ () => {
  const document = new ScDocument();
  const importer = new ScXMLImport(document);
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}"`;
  /** Imports the header and footer declarations into the same native master. @param children - Master page XML. @returns Nothing. */
  function importMaster(children: string): void {
    importer.importStyles(
      `<office:document-styles ${ns}><office:master-styles><style:master-page style:name="Default">${children}</style:master-page></office:master-styles></office:document-styles>`,
    );
  }
  try {
    importMaster(
      "<style:header><text:p>right header</text:p></style:header><style:header-first><text:p>first header</text:p></style:header-first>",
    );
    expect(centerText(document, ATTR_PAGE_HEADERRIGHT)).toBe("right header");
    expect(centerText(document, ATTR_PAGE_HEADERFIRST)).toBe("first header");
    importMaster(
      "<style:header-first><text:p>ignored</text:p></style:header-first><style:header><text:p>new right</text:p></style:header><style:header><text:p>duplicate right</text:p></style:header>",
    );
    expect(centerText(document, ATTR_PAGE_HEADERRIGHT)).toBe("new right");
    const first = items(document, "Default").Get(ATTR_PAGE_HEADERFIRST) as ScPageHFItem;
    expect(first.GetCenterArea()).toBeNull();
  } finally {
    document.Dispose();
  }
});

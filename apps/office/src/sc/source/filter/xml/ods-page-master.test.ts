/** @fileoverview Calc ODS page master retention and native print property round trips. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScVObjMode } from "../../../inc/global";
import type { ScPageScaleToItem, ScViewObjectModeItem } from "../../../inc/attrib";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import type { SfxUInt16Item } from "../../../../svl/inc/intitem";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import {
  ATTR_PAGE_CHARTS,
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

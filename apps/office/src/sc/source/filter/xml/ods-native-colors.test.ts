/** @fileoverview Native font and cell-background colors through real ODS packages and independent XML. */
import { expect, it } from "vitest";
import { createCalcSession } from "../../../browser/composition/calc-module";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { Color, COL_AUTO, COL_TRANSPARENT } from "../../../../tools/inc/color";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
it("writes original text and table-cell color groups and retains RGB/automatic/transparent across reopens", /** Checks actual package bytes and item state. @returns Completion. */ async () => {
  const session = createCalcSession(),
    c = session.controller;
  try {
    c.EnterString("Color data");
    c.SetColor("font", new SvxColorItem(new Color(0x123456), 10017));
    c.SetColor("background", new SvxColorItem(new Color(0xfedcba), 10186));
    let bytes = writeOdsDocument(c.shell.GetDocument());
    const xml = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(xml).toContain('fo:color="#123456"');
    expect(xml).toContain('<style:table-cell-properties fo:background-color="#fedcba"/>');
    for (let i = 0; i < 3; i++) {
      const doc = await readOdsDocument(bytes),
        pattern = doc.GetPattern(new ScAddress());
      expect((pattern?.GetItem(109) as SvxColorItem).GetValue().toUInt32()).toBe(0x123456);
      expect((pattern?.GetItem(148) as SvxBrushItem).GetColor().toUInt32()).toBe(0xfedcba);
      bytes = writeOdsDocument(doc);
      doc.DisposeAttributes();
    }
    c.SetColor("font", new SvxColorItem(COL_AUTO, 10017));
    c.SetColor("background", new SvxColorItem(COL_TRANSPARENT, 10186));
    const defaults = await readOdsDocument(writeOdsDocument(c.shell.GetDocument())),
      pattern = defaults.GetPattern(new ScAddress());
    expect((pattern?.GetItem(109) as SvxColorItem).GetValue().equals(COL_AUTO)).toBe(true);
    expect((pattern?.GetItem(148) as SvxBrushItem).GetColor().GetAlpha()).toBe(0);
    defaults.DisposeAttributes();
  } finally {
    session.Close();
  }
});

it("diagnoses failed color conversion while preserving independent native transparency and empty groups", /** Checks the two source background properties rather than rejecting them as one combined value. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    diagnostics: string[] = [],
    importer = new ScXMLImport(doc, {
      onDiagnostic:
        /** Records actual unsupported metadata. @param item - Import diagnostic. @returns Nothing. */ (
          item,
        ) => {
          diagnostics.push(item.name);
        },
    });
  importer.importContent(
    '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="Color" style:family="table-cell"><style:text-properties fo:color="invalid"/><style:table-cell-properties/><style:table-cell-properties fo:background-color="invalid"><style:paragraph-properties/><loext:background-complex-color xmlns:loext="urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0"/></style:table-cell-properties></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Data"><table:table-row><table:table-cell table:style-name="Color"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>',
  );
  const pattern = doc.GetPattern(new ScAddress());
  expect((pattern?.GetItem(109) as SvxColorItem).GetValue().equals(COL_AUTO)).toBe(true);
  expect((pattern?.GetItem(148) as SvxBrushItem).GetColor().toUInt32()).toBe(0xffffff);
  expect(diagnostics).toEqual([
    "invalid cell font color",
    "invalid cell background color",
    "cell style property subtree",
    "cell style property subtree",
  ]);
  doc.DisposeAttributes();
});
it("preserves source automatic-color precedence in both XML attribute orders and independent background properties", /** Inputs are hand-authored rather than produced by the exporter. @returns Nothing. */ () => {
  for (const attributes of [
    'fo:color="#abcdef" style:use-window-font-color="true"',
    'style:use-window-font-color="true" fo:color="#abcdef"',
    'fo:color="#abcdef" style:use-window-font-color="false"',
  ]) {
    const doc = new ScDocument(),
      diagnostics: string[] = [],
      importer = new ScXMLImport(doc, {
        onDiagnostic:
          /** Records unsupported format metadata. @param item - Diagnostic. @returns Nothing. */ (
            item,
          ) => {
            diagnostics.push(item.name);
          },
      });
    importer.importContent(
      `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="Color" style:family="table-cell"><style:text-properties ${attributes}/><style:table-cell-properties fo:background-color="#102030"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Data"><table:table-row><table:table-cell table:style-name="Color"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
    );
    const pattern = doc.GetPattern(new ScAddress());
    expect((pattern?.GetItem(109) as SvxColorItem).GetValue().toUInt32()).toBe(
      attributes.includes('"false"') ? 0xabcdef : 0xffffffff,
    );
    expect((pattern?.GetItem(148) as SvxBrushItem).GetColor().toUInt32()).toBe(0x102030);
    expect(diagnostics).toEqual([]);
    doc.DisposeAttributes();
  }
});

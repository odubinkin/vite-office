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
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ColorSet } from "../../../../docmodel/inc/theme/ColorSet";
import { Theme } from "../../../../docmodel/inc/theme/Theme";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { ScXMLExport } from "./xmlexprt";
import { ATTR_BACKGROUND } from "../../../inc/scitems";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
it("writes original text and table-cell color groups and retains RGB/automatic/transparent across reopens", /** Checks actual package bytes and item state. @returns Completion. */ async () => {
  const session = createCalcSession(),
    c = session.controller;
  try {
    c.EnterString("Color data");
    c.SetColor("font", new SvxColorItem(new Color(0x123456), 10017));
    c.SetColor("background", new SvxColorItem(new Color(0xfedcba), 10186));
    let bytes = await writeOdsDocument(c.shell.GetDocument());
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(xml).toContain('fo:color="#123456"');
    expect(xml).toContain('<style:table-cell-properties fo:background-color="#fedcba"/>');
    for (let i = 0; i < 3; i++) {
      const doc = await readOdsDocument(bytes),
        pattern = doc.GetPattern(new ScAddress());
      expect((pattern?.GetItem(109) as SvxColorItem).GetValue().toUInt32()).toBe(0x123456);
      expect((pattern?.GetItem(148) as SvxBrushItem).GetColor().toUInt32()).toBe(0xfedcba);
      bytes = await writeOdsDocument(doc);
      doc.DisposeAttributes();
    }
    c.SetColor("font", new SvxColorItem(COL_AUTO, 10017));
    c.SetColor("background", new SvxColorItem(COL_TRANSPARENT, 10186));
    const defaults = await readOdsDocument(await writeOdsDocument(c.shell.GetDocument())),
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

it("imports ODF theme slots and transformation records with native optional values", /** Uses independently authored named styles alongside a blank ODF theme. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const namedStyles =
    'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:loext="urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0"';
  const importer = new ScXMLImport(doc);
  try {
    importer.importStyles(
      `<office:document-styles ${namedStyles}><office:styles><loext:theme><loext:color/><loext:theme-colors/></loext:theme></office:styles></office:document-styles>`,
    );
    expect(doc.theme).toBeUndefined();
    importer.importStyles(
      `<office:document-styles ${namedStyles}><office:styles><loext:theme><loext:theme-colors loext:name="Custom"><loext:theme/><loext:color loext:name="unknown" loext:color="#ffffff"/><loext:color loext:name="accent6"/></loext:theme-colors></loext:theme></office:styles></office:document-styles>`,
    );
    expect(doc.theme?.name).toBe("");
    expect(doc.theme?.colorSet?.name).toBe("Custom");
    importer.importStyles(
      `<office:document-styles ${namedStyles}><office:automatic-styles><style:style style:name="custom" style:family="table-cell"><style:text-properties fo:color="#123456"><loext:char-complex-color loext:theme-type="accent6" loext:color-type="theme"><loext:color/><loext:transformation loext:type="shade" loext:value="5000"/><loext:transformation loext:value="bad"/></loext:char-complex-color></style:text-properties></style:style></office:automatic-styles></office:document-styles>`,
    );
    const item = importer.GetAutoStyle("custom")?.GetItem(109) as SvxColorItem;
    expect(item.GetValue().toUInt32()).toBe(0x123456);
    const transforms = item.getComplexColor().getTransformations();
    expect(transforms).toHaveLength(2);
    expect(transforms[0]?.mnValue).toBe(5000);
    expect(transforms[1]?.mnValue).toBe(0);
  } finally {
    importer.DisposeStyles();
    doc.Dispose();
  }
});

it("matches the native ODF theme with an empty color-set name", /** Verifies the upstream omission rule and twelve-slot order. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const restored = new ScDocument();
  const importer = new ScXMLImport(restored);
  try {
    doc.theme = new Theme("Palette");
    expect(new ScXMLExport(doc).exportStyles()).toContain('<loext:theme loext:name="Palette"/>');
    const colors = new ColorSet("");
    colors.add(ThemeColorType.Unknown, new Color(0xff0000));
    expect(colors.getColor(ThemeColorType.Unknown).equals(COL_AUTO)).toBe(true);
    colors.add(ThemeColorType.Accent5, new Color(0x999999));
    doc.theme.colorSet = colors;
    const styles = new ScXMLExport(doc).exportStyles();
    expect(styles).toContain("<loext:theme-colors>");
    expect(styles).toContain('<loext:color loext:name="accent5" loext:color="#999999"/>');
    expect(styles.match(/<loext:color /g)).toHaveLength(12);
    importer.importStyles(styles);
    expect(restored.theme).toBeUndefined();
  } finally {
    importer.DisposeStyles();
    restored.Dispose();
    doc.Dispose();
  }
});

it("applies the import-only table background before cell overrides and saves it as sparse cell formatting", /** Exercises the native table style, Worker and ODS save. @returns Completion. */ async () => {
  const doc = new ScDocument();
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  const ns = ODF_NAMESPACES;
  try {
    new ScXMLImport(doc).importContent(`
      <office:document-content xmlns:office="${ns.office}" xmlns:style="${ns.style}" xmlns:table="${ns.table}" xmlns:fo="${ns.fo}" xmlns:loext="${ns.loext}">
        <office:automatic-styles>
          <style:style style:name="Sheet" style:family="table">
            <style:table-properties fo:background-color="#aabbcc">
              <loext:background-complex-color loext:theme-type="accent1"/>
            </style:table-properties>
          </style:style>
          <style:style style:name="Override" style:family="table-cell">
            <style:table-cell-properties fo:background-color="transparent"/>
          </style:style>
        </office:automatic-styles>
        <office:body><office:spreadsheet>
          <table:table table:name="Data" table:style-name="Sheet">
            <table:table-row>
              <table:table-cell table:style-name="Override" office:value-type="float" office:value="2"/>
              <table:table-cell office:value-type="float" office:value="3"/>
            </table:table-row>
          </table:table>
        </office:spreadsheet></office:body>
      </office:document-content>`);
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(doc)));
    const output = await writeOdsDocument(worker);
    const content = await (await DocumentArchive.open(output)).readTextEntry("content.xml");
    expect(content).toMatch(/<style:table-cell-properties[^>]*fo:background-color="#aabbcc"/u);
    expect(content).not.toMatch(/<style:table-properties[^>]*fo:background-color/u);
    reopened = await readOdsDocument(output);
    for (const model of [doc, worker, reopened]) {
      const first = model.GetPattern(new ScAddress())?.GetItem(ATTR_BACKGROUND) as SvxBrushItem;
      const next = model
        .GetPattern(new ScAddress(1, 0, 0))
        ?.GetItem(ATTR_BACKGROUND) as SvxBrushItem;
      const far = model
        .GetPattern(new ScAddress(model.MaxCol(), model.MaxRow(), 0))
        ?.GetItem(ATTR_BACKGROUND) as SvxBrushItem;
      expect(first.GetColor().GetAlpha()).toBe(0);
      expect(next.GetColor().toUInt32()).toBe(0xaabbcc);
      expect(far.GetColor().toUInt32()).toBe(0xaabbcc);
      expect(far.getComplexColor().isValidThemeType()).toBe(false);
      expect(model.FetchTable(0)?.GetAllocatedColumnsCount()).toBeLessThan(5);
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    doc.Dispose();
  }
});

/** @fileoverview Native five-field three-script cell fonts survive the actual shared font pool and ODS package path. */
import type { ScDocumentPool } from "../../core/data/docpool";
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScPatternAttr } from "../../../inc/patattr";
import { ScXMLImport } from "./xmlimprt";
import { ScAddress } from "../../../inc/address";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_SYMBOL, RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
/** Reads actual pooled script font state. @param doc - Model. @param which - Native font identity. @returns Concrete font. */
function font(doc: ScDocument, which: number): SvxFontItem {
  return (doc.GetPattern(new ScAddress()) as ScPatternAttr).GetItem(which) as SvxFontItem;
}
it("round-trips distinct font declarations and every represented metadata field across actual ODS reopens", /** No font-family-only shadow model participates. @returns Completion. */ async () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Fonts"));
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  const expected = [
    new SvxFontItem(
      FontFamily.FAMILY_ROMAN,
      "Shared & Face",
      "Regular",
      FontPitch.PITCH_VARIABLE,
      RTL_TEXTENCODING_UTF8,
      100,
    ),
    new SvxFontItem(
      FontFamily.FAMILY_MODERN,
      "Shared & Face",
      "CJK",
      FontPitch.PITCH_FIXED,
      RTL_TEXTENCODING_UTF8,
      111,
    ),
    new SvxFontItem(
      FontFamily.FAMILY_DECORATIVE,
      "Symbols",
      "Glyphs",
      FontPitch.PITCH_FIXED,
      RTL_TEXTENCODING_SYMBOL,
      116,
    ),
  ];
  for (const item of expected) pattern.ItemSetPut(item);
  doc.ApplyPatternAreaTab(0, 0, 0, 0, 0, pattern);
  pattern.Dispose();
  const bytes = writeOdsDocument(doc);
  const xml = await new ZipFile(bytes).readTextEntry("content.xml");
  expect(xml).toContain("<office:font-face-decls>");
  expect(xml).toContain('style:font-adornments="CJK"');
  expect(xml).toContain('style:font-charset="x-symbol"');
  expect(xml).toContain("style:font-name-asian=");
  expect(xml).toContain("style:font-name-complex=");
  const loaded = await readOdsDocument(bytes);
  const again = await readOdsDocument(writeOdsDocument(loaded));
  for (const item of expected) {
    expect(font(loaded, item.Which()).equals(item)).toBe(true);
    expect(font(again, item.Which()).equals(item)).toBe(true);
  }
  for (const model of [doc, loaded, again]) model.DisposeAttributes();
});
it("retains missing-face defaults and diagnoses unported resources and invalid styles roots", /** Checks actual import boundaries without silently inventing a font. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    diagnostics: string[] = [];
  const importer = new ScXMLImport(doc, {
    onDiagnostic:
      /** Records original diagnostic names. @param diagnostic - Parser diagnostic. @returns Nothing. */ (
        diagnostic,
      ) => {
        diagnostics.push(diagnostic.name);
      },
  });
  importer.registerFontFace("Default", "Native Default", undefined);
  expect(importer.GetFontFace("Default")?.QueryValue()).toEqual({
    familyName: "Native Default",
    styleName: "",
    family: FontFamily.FAMILY_DONTKNOW,
    pitch: FontPitch.PITCH_DONTKNOW,
    charSet: RTL_TEXTENCODING_UTF8,
  });
  importer.registerEmbeddedFont({
    faceName: "Default",
    familyName: "Native Default",
    path: "Fonts/test.ttf",
    format: "truetype",
    weight: "normal",
    style: "normal",
  });
  expect(diagnostics).toContain("embedded font resources are not preserved");
  expect(
    /** Rejects another known ODF root. @returns Nothing. */ () =>
      importer.importStyles(
        '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"/>',
      ),
  ).toThrow("document-styles expected");
  expect(
    /** Rejects unknown root vocabulary. @returns Nothing. */ () =>
      importer.importStyles('<other:document xmlns:other="urn:test"/>'),
  ).toThrow("unknown styles root");
  importer.importContent(
    '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="ce" style:family="table-cell"><style:text-properties style:font-name="Absent"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Data"><table:table-row><table:table-cell table:style-name="ce"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>',
  );
  expect(diagnostics).toContain("missing font declaration");
  expect(
    font(doc, 100).equals((doc.GetPool() as ScDocumentPool).GetUserOrPoolDefaultItem(100)),
  ).toBe(true);
  doc.DisposeAttributes();
});
it("resolves an independently authored styles-stream declaration referenced by content", /** Exercises the actual package wrapper and common XMLFontStylesContext. @returns Completion. */ async () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const seed = new ZipFile(writeOdsDocument(doc));
  const styles =
    '<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"><office:font-face-decls><style:font-face style:name="Face" svg:font-family="Independent Face" style:font-adornments="Book" style:font-family-generic="roman" style:font-pitch="fixed" style:font-charset="x-symbol"/></office:font-face-decls><office:styles><style:style style:name="Named" style:family="table-cell"/></office:styles><office:master-styles/></office:document-styles>';
  const content =
    '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="ce" style:family="table-cell"><style:text-properties style:font-name="Face"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Data"><table:table-row><table:table-cell table:style-name="ce"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>';
  const zip = new ZipOutputStream(),
    encoder = new TextEncoder();
  for (const name of seed.getEntryNames()) {
    let value = await seed.readTextEntry(name);
    if (name === "content.xml") value = content;
    if (name === "META-INF/manifest.xml")
      value = value.replace(
        "</manifest:manifest>",
        '<manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/></manifest:manifest>',
      );
    zip.putNextEntry(name, encoder.encode(value));
  }
  zip.putNextEntry("styles.xml", encoder.encode(styles));
  const diagnostics: string[] = [];
  const loaded = await readOdsDocument(zip.finish(), {
    onDiagnostic:
      /** Retains explicit unsupported style diagnostics. @param item - Import diagnostic. @returns Nothing. */ (
        item,
      ) => {
        diagnostics.push(item.name);
      },
  });
  expect(
    diagnostics.filter(
      /** Selects unsupported native style scopes. @param name - Diagnostic name. @returns Whether named or master styles. */ (
        name,
      ) => name === "named and master styles are not preserved",
    ),
  ).toHaveLength(2);
  expect(
    font(loaded, 100).equals(
      new SvxFontItem(
        FontFamily.FAMILY_ROMAN,
        "Independent Face",
        "Book",
        FontPitch.PITCH_FIXED,
        RTL_TEXTENCODING_SYMBOL,
        100,
      ),
    ),
  ).toBe(true);
  doc.DisposeAttributes();
  loaded.DisposeAttributes();
});

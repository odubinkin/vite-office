/** @fileoverview Native Calc embedding defaults and shared ODF font resources through ODS and Worker. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { packXmlPackage } from "../../../../package/source/zippackage/xml-package";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScDocument } from "../../../inc/document";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "./xmlwrap";

it("keeps the native testEmptyCalcDocDefaults font embedding flags", /** Ports the original Calc embedding defaults. @returns Nothing. */ () => {
  const document = new ScDocument();
  try {
    expect(document.IsEmbedFonts()).toBe(false);
    expect(document.IsEmbedUsedFontsOnly()).toBe(false);
    expect(document.IsEmbedFontScriptLatin()).toBe(true);
    expect(document.IsEmbedFontScriptAsian()).toBe(true);
    expect(document.IsEmbedFontScriptComplex()).toBe(true);
  } finally {
    document.Dispose();
  }
});

it("retains the original Manbow font resource through ODS and the Worker", /** Uses the original LibreOffice shared ODF font declaration and bytes in a Calc package. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(
    new Uint8Array(
      readFileSync(
        "../../vendor/libreoffice-reference/sw/qa/extras/embedded_fonts/data/embed-unrestricted1.odt",
      ),
    ),
  );
  const [path] = source.getEntryNames().filter((name) => name.startsWith("Fonts/"));
  assert(path);
  const bytes = await source.readEntry(path);
  const original = await source.readTextEntry("content.xml");
  const fontFaces = /<office:font-face-decls>[\s\S]*?<\/office:font-face-decls>/u.exec(
    original,
  )?.[0];
  assert(typeof fontFaces === "string" && fontFaces.includes(path));
  const blank = new ScDocument();
  let imported: ScDocument | undefined;
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    const sheet = unicode("Sheet1");
    try {
      assert(blank.InsertTab(0, sheet));
    } finally {
      sheet.dispose();
    }
    blank.SetEmbedFontScriptComplex(false);
    const { files } = await writeOdsXml(blank);
    const content = files["content.xml"];
    const manifest = files["META-INF/manifest.xml"];
    assert(typeof content === "string" && typeof manifest === "string");
    const input = await packXmlPackage({
      ...files,
      "content.xml": content.replace(
        /<office:font-face-decls>[\s\S]*?<\/office:font-face-decls>/u,
        fontFaces,
      ),
      "META-INF/manifest.xml": manifest.replace(
        "</manifest:manifest>",
        `<manifest:file-entry manifest:full-path="${path}" manifest:media-type="application/x-font-ttf"/></manifest:manifest>`,
      ),
      [path]: bytes,
    });
    imported = await readOdsDocument(input);
    expect(imported.IsEmbedFonts()).toBe(true);
    expect(imported.IsEmbedFontScriptComplex()).toBe(false);
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(imported)));
    const saved = await writeOdsDocument(worker);
    const savedArchive = await DocumentArchive.open(saved);
    expect(await savedArchive.readEntry(path)).toEqual(bytes);
    reopened = await readOdsDocument(saved);
    expect(reopened.IsEmbedFonts()).toBe(true);
    expect(reopened.IsEmbedFontScriptComplex()).toBe(false);
    const [font] = reopened.GetEmbeddedFonts();
    expect(font).toMatchObject({ path, familyName: "Manbow Solid", canLoad: true });
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    imported?.Dispose();
    blank.Dispose();
  }
});

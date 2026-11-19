/** @fileoverview Native Writer named and run theme colors through DOCX and primary ODT. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { TransformationType } from "../../../../docmodel/inc/color/Transformation";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { getFromXComplexColor } from "../../../../docmodel/inc/uno/UnoComplexColor";
import { XComplexColor } from "../../../../offapi/com/sun/star/util/XComplexColor";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import type { SwDoc } from "../../core/doc/doc";
import { GetPropertyValue } from "../../core/unocore/unocrsrhelper";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { importWriterXml } from "../xml/xmlimp";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

/** Queries the real character property at a named fixture's first paragraph or first character. @param doc - Native document. @param run - Select the first character. @returns Native value copy. */
function actualColor(doc: SwDoc, run: boolean) {
  const node = doc.paragraphs[0];
  assert(node);
  const start = new SwPosition(node, 0);
  const end = new SwPosition(node, run ? 1 : 0);
  const pam = new SwPaM(start, end);
  const reference = new Reference<XComplexColor>();
  try {
    const value = GetPropertyValue(pam, "CharComplexColor");
    try {
      expect(value.extract(reference.getAddress(), XComplexColor.static_type)).toBe(true);
      return getFromXComplexColor(reference);
    } finally {
      value.dispose();
    }
  } finally {
    reference.dispose();
    pam.Dispose();
    end.Dispose();
    start.Dispose();
  }
}

it.each([
  ["sw/qa/core/theme/data/ThemeColorInHeading.docx", ThemeColorType.Accent1, false],
  [
    "sw/qa/extras/ooxmlexport/data/Test_ThemePortionLevel_CharColor.docx",
    ThemeColorType.Accent2,
    true,
  ],
] as const)(
  "retains source theme color from %s through DOCX and ODT",
  /** Ports original Writer heading/character theme assertions and checks the supplied palette part. @param path - Pinned workbook fixture. @param type - Color slot. @param run - Whether to select an explicit text run. @returns Completion. */ async (
    path,
    type,
    run,
  ) => {
    const source = await importOOXML(
      new Uint8Array(readFileSync("../../vendor/libreoffice-reference/" + path)),
      {},
    );
    let odt: SwDoc | undefined;
    let docx: SwDoc | undefined;
    try {
      assert(source.theme?.colorSet);
      const expectedColor = source.theme.colorSet.getColor(type).toUInt32();
      const output = await DocxExport.WriteDocument(source);
      const zip = await DocumentArchive.open(output);
      expect(await zip.readTextEntry("word/_rels/document.xml.rels")).toContain(
        'Target="theme/theme1.xml"',
      );
      const xml = await zip.readTextEntry(run ? "word/document.xml" : "word/styles.xml");
      expect(xml).toContain(`w:themeColor="accent${run ? 2 : 1}"`);
      if (run) {
        expect(await zip.readTextEntry("word/styles.xml")).toContain(
          '<w14:ligatures w14:val="standardContextual"/>',
        );
      }
      const nativeODT = await writeOdtDocument(source, { title: "Theme" });
      const odtZip = await DocumentArchive.open(nativeODT);
      const styles = await odtZip.readTextEntry("styles.xml");
      expect(styles).toContain("<loext:theme loext:name=");
      expect(run ? await odtZip.readTextEntry("content.xml") : styles).toContain(
        `loext:theme-type="accent${run ? 2 : 1}"`,
      );
      odt = (await readOdtDocument(nativeODT, { title: "Theme" })).document;
      docx = await importOOXML(output, {});
      for (const copy of [source, docx, odt]) {
        const color = actualColor(copy, run);
        expect(color.getThemeColorType()).toBe(type);
        expect(copy.theme?.colorSet?.getColor(type).toUInt32()).toBe(expectedColor);
        if (run) {
          const [tint] = color.getTransformations();
          expect(color.getTransformations()).toHaveLength(1);
          expect(tint?.meType).toBe(TransformationType.Tint);
          expect(tint?.mnValue).toBe(4000);
        }
      }
    } finally {
      docx?.Dispose();
      odt?.Dispose();
      source.Dispose();
    }
  },
);

it("reads the pinned Writer ODF themed heading and explicit run", /** Ports both original flat ODF regressions. @returns Nothing. */ () => {
  for (const [path, type, run] of [
    ["sw/qa/core/theme/data/ThemeColorInHeading.fodt", ThemeColorType.Accent1, false],
    [
      "sw/qa/extras/ooxmlexport/data/Test_ThemePortionLevel_CharColor.fodt",
      ThemeColorType.Accent2,
      true,
    ],
  ] as const) {
    const flat = readFileSync("../../vendor/libreoffice-reference/" + path, "utf8");
    const root = /<office:document\s([^>]+)>/u.exec(flat)?.[1];
    assert(root);
    const attrs = root.replace(/office:mimetype="[^"]+"/u, "");
    const part =
      /** Reuses the original flat fixture's unmodified package sections. @param name - Section name. @returns Section XML. */ (
        name: string,
      ): string =>
        new RegExp(`<office:${name}(?:\\s[^>]*)?>[\\s\\S]*?</office:${name}>`, "u").exec(
          flat,
        )?.[0] ?? "";
    const common = part("font-face-decls");
    const styles = `<office:document-styles ${attrs}>${common}${part("styles")}</office:document-styles>`;
    const content = `<office:document-content ${attrs}>${common}${part("automatic-styles")}${part("body")}</office:document-content>`;
    const { document } = importWriterXml(styles, content, { title: "Theme" });
    try {
      const color = actualColor(document, run);
      expect(color.getThemeColorType()).toBe(type);
      if (run) {
        expect(color.getTransformations()[0]?.meType).toBe(TransformationType.Tint);
        expect(color.getTransformations()[0]?.mnValue).toBe(4000);
      }
    } finally {
      document.Dispose();
    }
  }
});

it("preserves native Word numeric typography on runs and named styles", /** Exercises both character property owners and schema order. @returns Completion. */ async () => {
  const fixture = await DocumentArchive.open(
    new Uint8Array(
      readFileSync(
        "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/Test_ThemePortionLevel_CharColor.docx",
      ),
    ),
  );
  const writer = new DocumentArchiveWriter();
  for (const part of fixture.getEntryNames()) {
    if (part === "word/document.xml") {
      const xml = (await fixture.readTextEntry(part)).replace(
        /<\/w:rPr>(?=<w:t>Sample Text)/u,
        '<w14:numSpacing w14:val="tabular"/><w14:numForm w14:val="oldStyle"/></w:rPr>',
      );
      writer.putNextEntry(part, new TextEncoder().encode(xml));
    } else if (part === "word/styles.xml") {
      const xml = (await fixture.readTextEntry(part)).replace(
        "</w:styles>",
        '<w:style w:type="character" w:styleId="Typography"><w:name w:val="Typography"/><w:rPr><w14:numForm w14:val="lining"/><w14:ligatures/></w:rPr></w:style></w:styles>',
      );
      writer.putNextEntry(part, new TextEncoder().encode(xml));
    } else {
      writer.putNextEntry(part, await fixture.readEntry(part));
    }
  }
  const doc = await importOOXML(await writer.finish(), {});
  try {
    const result = await DocumentArchive.open(await DocxExport.WriteDocument(doc));
    expect(await result.readTextEntry("word/document.xml")).toContain(
      '<w14:numForm w14:val="oldStyle"/><w14:numSpacing w14:val="tabular"/>',
    );
    expect(await result.readTextEntry("word/styles.xml")).toContain(
      '<w14:ligatures/><w14:numForm w14:val="lining"/>',
    );
    const odt = await DocumentArchive.open(await writeOdtDocument(doc, { title: "Typography" }));
    const content = await odt.readTextEntry("content.xml");
    expect(content).toContain("Sample<text:s/>Text");
    expect(content).toContain('loext:theme-type="accent2"');
  } finally {
    doc.Dispose();
  }
});

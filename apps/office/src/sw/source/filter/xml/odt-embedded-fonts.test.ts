/** @fileoverview Checks pinned Writer embedded-font fixtures through package, model, Worker and export paths. */

import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { createWriterDocument } from "../../core/doc/doc";
import { SvxFontItem } from "../../../../editeng/source/items/textitem";
import { RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT, RES_CHRATR_FONT } from "../../../inc/hintids";
import { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";

const fixture = new Uint8Array(
  fs.readFileSync("src/sw/qa/extras/embedded_fonts/data/embed-unrestricted1.odt"),
);
const metadata = { title: "Pinned embedded font" };
const fontPath = "Fonts/Font_Manbow_Solid_1.ttf";

/** Imports a fixture without emitting unrelated upstream parser warnings. @param bytes - ODT bytes. @returns Imported document. */
function readFontFixture(bytes: Uint8Array): ReturnType<typeof readOdtDocument> {
  return readOdtDocument(bytes, metadata, undefined, {
    onDiagnostic: /** Records no raw fixture content. @returns Nothing. */ () => undefined,
  });
}

/** Mutates one ZIP entry without changing package order. @param source - ODT package. @param name - Entry path. @param transform - Byte mutation. @returns New ODT. */
async function replaceEntry(
  source: Uint8Array,
  name: string,
  transform: (bytes: Uint8Array) => Uint8Array,
): Promise<Uint8Array> {
  const zip = new ZipFile(source);
  const output = new ZipOutputStream();
  for (const entry of zip.getEntryNames())
    output.putNextEntry(
      entry,
      entry === name ? transform(await zip.readEntry(entry)) : await zip.readEntry(entry),
    );
  return output.finish();
}

describe("pinned Writer embedded font resources", /** Mirrors source-backed import and export assertions. @returns Nothing. */ () => {
  it("rejects malformed references, missing ZIP entries and oversized font data", /** Bounds package references before browser loading. @returns Completion. */ async () => {
    const malformedPath = await replaceEntry(
      fixture,
      "content.xml",
      /** Rewrites one package reference. @param bytes - XML bytes. @returns Modified XML. */ (
        bytes,
      ) =>
        new TextEncoder().encode(
          new TextDecoder().decode(bytes).replace(fontPath, "Fonts/../bad.ttf"),
        ),
    );
    await expect(readFontFixture(malformedPath)).rejects.toThrow("font path is invalid");
    const archive = new ZipFile(fixture);
    const output = new ZipOutputStream();
    for (const name of archive.getEntryNames())
      if (name !== fontPath) output.putNextEntry(name, await archive.readEntry(name));
    await expect(readFontFixture(output.finish())).rejects.toThrow("font package entry is missing");
    const oversized = await replaceEntry(
      fixture,
      fontPath,
      /** Exceeds the per-font ceiling. @returns Oversized bytes. */ () =>
        new Uint8Array(4 * 1024 * 1024 + 1),
    );
    await expect(readFontFixture(oversized)).rejects.toThrow("fonts exceed size limit");
  });

  it("enforces font format and embedding rights while retaining a nonviewable resource", /** Uses bounded OpenType table headers to probe validation and fsType. @returns Completion. */ async () => {
    const malformed = [
      { bytes: new Uint8Array(4), error: "font is invalid" },
      { bytes: new Uint8Array(12), error: "font format is invalid" },
      {
        bytes: new Uint8Array([0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]),
        error: "font tables are invalid",
      },
    ];
    for (const variant of malformed) {
      const changed = await replaceEntry(
        fixture,
        fontPath,
        /** Supplies one invalid OpenType header. @returns Variant bytes. */ () => variant.bytes,
      );
      await expect(readFontFixture(changed)).rejects.toThrow(variant.error);
    }
    const font = new Uint8Array(38);
    const view = new DataView(font.buffer);
    view.setUint32(0, 0x00010000);
    view.setUint16(4, 1);
    view.setUint32(12, 0x4f532f32);
    view.setUint32(20, 28);
    view.setUint32(24, 10);
    view.setUint16(36, 0x0002);
    const restricted = await replaceEntry(
      fixture,
      fontPath,
      /** Supplies an embedding-restricted OS/2 table. @returns Font bytes. */ () => font,
    );
    const opened = await readFontFixture(restricted);
    expect(opened.document.GetEmbeddedFonts()[0]).toMatchObject({ canLoad: false });
    expect(opened.document.GetEmbeddedFonts()[0]?.bytes).toEqual(font);
    view.setUint32(20, 37);
    const badRights = await replaceEntry(
      fixture,
      fontPath,
      /** Supplies an out-of-range rights table. @returns Font bytes. */ () => font,
    );
    await expect(readFontFixture(badRights)).rejects.toThrow("rights table is invalid");
    view.setUint16(4, 0);
    const absentRights = await replaceEntry(
      fixture,
      fontPath,
      /** Supplies a font without an OS/2 table. @returns Font bytes. */ () => font,
    );
    expect((await readFontFixture(absentRights)).document.GetEmbeddedFonts()[0]?.canLoad).toBe(
      false,
    );
    view.setUint32(0, 0x4f54544f);
    view.setUint16(4, 1);
    view.setUint32(20, 28);
    view.setUint16(36, 0);
    const openType = await replaceEntry(
      fixture,
      fontPath,
      /** Supplies a viewable OpenType font header. @returns Font bytes. */ () => font,
    );
    expect((await readFontFixture(openType)).document.GetEmbeddedFonts()[0]?.canLoad).toBe(true);
  });

  it("rejects an unsupported manifest media type and invalid font descriptors", /** Keeps the SAX font source context strict. @returns Completion. */ async () => {
    const wrongMedia = await replaceEntry(
      fixture,
      "META-INF/manifest.xml",
      /** Changes the font MIME without changing its path. @param bytes - Manifest bytes. @returns XML bytes. */ (
        bytes,
      ) =>
        new TextEncoder().encode(
          new TextDecoder()
            .decode(bytes)
            .replace(/(Font_Manbow_Solid_1\.ttf" manifest:media-type=")[^"]+/u, "$1text/plain"),
        ),
    );
    await expect(readFontFixture(wrongMedia)).rejects.toThrow("font manifest entry is invalid");
    for (const attribute of ['fo:font-weight="heavy"', 'fo:font-style="oblique"']) {
      const changed = await replaceEntry(
        fixture,
        "content.xml",
        /** Injects an invalid URI descriptor. @param bytes - Content bytes. @returns XML bytes. */ (
          bytes,
        ) =>
          new TextEncoder().encode(
            new TextDecoder()
              .decode(bytes)
              .replace('xlink:type="simple"', `xlink:type="simple" ${attribute}`),
          ),
      );
      await expect(readFontFixture(changed)).rejects.toThrow("ODF XML is malformed");
    }
  });

  it("rejects conflicting document registrations and export without package bytes", /** Prevents divergent source declarations and invalid output packages. @returns Nothing. */ () => {
    const document = createWriterDocument();
    const reference = {
      faceName: "Face",
      familyName: "Face",
      path: "Fonts/Face.ttf",
      format: "truetype",
      style: "normal" as const,
      weight: "normal" as const,
    };
    document.RegisterEmbeddedFont(reference);
    document.RegisterEmbeddedFont(reference);
    expect(
      /** Registers a conflicting face. @returns Nothing. */ () =>
        document.RegisterEmbeddedFont({ ...reference, familyName: "Other" }),
    ).toThrow("Conflicting ODF embedded font");
    expect(
      /** Attaches bytes to an undeclared path. @returns Nothing. */ () =>
        document.SetEmbeddedFontBytes("Fonts/unknown.ttf", new Uint8Array(1), true),
    ).toThrow("Unknown ODF embedded font");
    expect(
      /** Attempts an incomplete package export. @returns ODT bytes. */ () =>
        writeOdtDocument(document, metadata),
    ).toThrow("font bytes are missing");
  });

  it("deduplicates exported face URIs and rejects malformed transfer records", /** Preserves one canonical package reference across source streams. @returns Nothing. */ () => {
    const pool = new XMLFontAutoStylePool();
    const font = {
      faceName: "Face",
      familyName: "Face",
      path: "Fonts/Face.ttf",
      format: "truetype",
      style: "normal" as const,
      weight: "normal" as const,
    };
    pool.AddEmbedded(font);
    pool.AddEmbedded(font);
    expect(pool.exportXML().match(/<svg:font-face-uri/gu)).toHaveLength(1);
    const record = encodeWriterDocument(createWriterDocument());
    expect(
      /** Decodes one invalid font transfer record. @returns Writer document. */ () =>
        decodeWriterDocument({
          ...record,
          embeddedFonts: [{ ...font, bytes: "invalid" }],
        } as unknown as typeof record),
    ).toThrow("Stored Writer embedded font is invalid");
    expect(
      decodeWriterDocument({
        ...record,
        embeddedFonts: undefined,
      } as unknown as typeof record).GetEmbeddedFonts(),
    ).toHaveLength(0);
    expect(
      decodeWriterDocument({ ...record, embeddedFonts: [font] }).GetEmbeddedFonts(),
    ).toHaveLength(1);
  });

  it("routes font source, URI and optional format children through their owning contexts", /** Unknown child nodes cannot become phantom package resources. @returns Completion. */ async () => {
    for (const [element, replacement] of [
      ["font-face-src", "font-face-format"],
      ["font-face-uri", "font-face-format"],
      ["font-face-format", "font-face-src"],
    ]) {
      const changed = await replaceEntry(
        fixture,
        "content.xml",
        /** Renames one nested SVG element. @param bytes - Content bytes. @returns XML bytes. */ (
          bytes,
        ) =>
          new TextEncoder().encode(
            new TextDecoder().decode(bytes).replaceAll(`svg:${element}`, `svg:${replacement}`),
          ),
      );
      await expect(readFontFixture(changed)).rejects.toThrow(
        `Unsupported ODF XML element: svg:${replacement}`,
      );
    }
  });

  it("preserves Manbow Solid font bytes and identity through transfer and ODT reimport", /** Follows upstream embedded_fonts.cxx::testTdf167849 with package persistence assertions. @returns Completion. */ async () => {
    const opened = await readOdtDocument(fixture, metadata, undefined, {
      onDiagnostic: /** Ignores unrelated fixture declarations. @returns Nothing. */ () =>
        undefined,
    });
    const fonts = opened.document.GetEmbeddedFonts();
    expect(fonts).toHaveLength(1);
    expect(fonts[0]).toMatchObject({
      familyName: "Manbow Solid",
      format: "truetype",
      weight: "normal",
      style: "normal",
      canLoad: true,
    });
    expect(fonts[0]?.bytes).toHaveLength(26932);
    const defaultStyle = opened.document.GetDfltTextFormatColl().GetAttrSet();
    expect((defaultStyle.Get(RES_CHRATR_FONT, true) as SvxFontItem).GetFamilyName()).toBe(
      "Liberation Serif",
    );
    expect((defaultStyle.Get(RES_CHRATR_CJK_FONT, true) as SvxFontItem).GetFamilyName()).toBe(
      "NSimSun",
    );
    expect((defaultStyle.Get(RES_CHRATR_CTL_FONT, true) as SvxFontItem).GetFamilyName()).toBe(
      "Mangal",
    );
    const transferred = decodeWriterDocument(encodeWriterDocument(opened.document));
    expect(transferred.GetEmbeddedFonts()[0]?.bytes).toEqual(fonts[0]?.bytes);
    const saved = writeOdtDocument(transferred, metadata);
    const archive = new ZipFile(saved);
    expect(archive.getEntryNames()).toContain(fonts[0]?.path);
    expect(await archive.readTextEntry("styles.xml")).toContain("<svg:font-face-src>");
    const reopened = await readOdtDocument(saved, metadata, undefined, {
      onDiagnostic: /** Ignores unrelated fixture declarations. @returns Nothing. */ () =>
        undefined,
    });
    expect(reopened.document.GetEmbeddedFonts()).toEqual(transferred.GetEmbeddedFonts());
  });

  it("keeps font family and page state when the upstream properties fixture has no package font", /** Uses embedded_fonts.cxx::testEmbeddedFontProps without inventing unavailable bytes. @returns Completion. */ async () => {
    const bytes = new Uint8Array(
      fs.readFileSync("src/sw/qa/extras/embedded_fonts/data/embedded-font-props.odt"),
    );
    const opened = await readOdtDocument(bytes, metadata, undefined, {
      onDiagnostic: /** Ignores unrelated fixture declarations. @returns Nothing. */ () =>
        undefined,
    });
    expect(opened.document.GetEmbeddedFonts()).toHaveLength(0);
    const page = opened.document.GetPageDesc().GetValue();
    const reopened = await readOdtDocument(
      writeOdtDocument(opened.document, metadata),
      metadata,
      undefined,
      {
        onDiagnostic: /** Ignores unrelated fixture declarations. @returns Nothing. */ () =>
          undefined,
      },
    );
    expect(reopened.document.GetPageDesc().GetValue()).toEqual(page);
  });

  it("rejects a font reference absent from the validated manifest", /** Keeps package font resolution within the ODT manifest. @returns Completion. */ async () => {
    const changed = await replaceEntry(
      fixture,
      "META-INF/manifest.xml",
      /** Removes the declared font. @param bytes - Manifest bytes. @returns Modified bytes. */ (
        bytes,
      ) =>
        new TextEncoder().encode(
          new TextDecoder()
            .decode(bytes)
            .replace(/<manifest:file-entry[^>]*Font_Manbow_Solid_1\.ttf[^>]*\/>/u, ""),
        ),
    );
    await expect(readOdtDocument(changed, metadata)).rejects.toThrow(
      "font manifest entry is invalid",
    );
  });
});

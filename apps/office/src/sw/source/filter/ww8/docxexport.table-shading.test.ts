/** @fileoverview Ports original Writer table shading assertions over the native DOCX file path. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { RES_BACKGROUND } from "../../../inc/hintids";
import { COL_AUTO } from "../../../../tools/inc/color";
import type { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import type { SwDoc } from "../../core/doc/doc";
import { ThrowFilterLoadError } from "../../../../sfx2/source/doc/objstor";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { text } from "../../core/unocore/unocrsrhelper";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

const sourcePath = "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/";
const metadata = { title: "Table shading" };
const auto = COL_AUTO.toUInt32();

const fixtures = [
  ["table-style-cell-back-color.docx", [[0, 0, 0x00ff00]], 0],
  ["tdf97090.docx", [[0, 0, 0x95b3d7]], undefined],
  [
    "tdf138020_undefined_firstCol.docx",
    [
      [0, 0, 0xd9f2d0],
      [0, 1, auto],
    ],
    undefined,
  ],
  [
    "tdf138020_all_rows_tblHeader.docx",
    [
      [0, 1, 0xffc000],
      [6, 2, 0xffc000],
      [7, 0, 0xffc000],
    ],
    0,
  ],
  [
    "tdf167843_tblLook_firstRow_tblHeader.docx",
    [
      [0, 1, auto],
      [0, 0, 0xd9d9d9],
      [0, 6, 0xbfbfbf],
      [7, 0, 0xc1e4f5],
    ],
    0,
  ],
  [
    "tdf90906_colAutoB.docx",
    [
      [0, 0, 0x00ff00],
      [1, 0, auto],
      [0, 1, auto],
      [1, 1, 0x0000ff],
    ],
    undefined,
  ],
] as const;

/** Reads the original Writer cell item. @param document - Active document. @param row - Cell row. @param column - Cell column. @returns Native color. */
function colorAt(document: SwDoc, row: number, column: number): number | undefined {
  const line = document.GetTables()[0]?.GetTabLines()[row];
  const format = line?.GetTabBoxes()[column]?.GetFrameFormat();
  return (format?.GetAttrSet().GetItem(RES_BACKGROUND) as SvxBrushItem | undefined)
    ?.GetColor()
    .toUInt32();
}

/** Keeps the two table fixtures' native table and style parts intact while isolating their unimplemented drawing resources. @param file - Original test package. @returns Complete table fixture. */
async function tableFixture(file: string): Promise<Uint8Array> {
  const bytes = new Uint8Array(readFileSync(sourcePath + file));
  if (file !== "tdf97090.docx" && file !== "tdf90906_colAutoB.docx") return bytes;
  const original = await DocumentArchive.open(bytes);
  const packageWriter = new DocumentArchiveWriter();
  for (const entry of original.getEntryNames()) {
    if (entry !== "word/document.xml")
      packageWriter.putNextEntry(entry, await original.readEntry(entry));
    else {
      const xml = await original.readTextEntry(entry);
      const drawing =
        file === "tdf97090.docx"
          ? /<w:drawing>(?:(?!<\/w:drawing>)[\s\S])*<\/w:drawing>/u
          : /<w:background w:color="CCCCCC"\/>/u;
      expect(xml).toMatch(drawing);
      packageWriter.putNextEntry(entry, new TextEncoder().encode(xml.replace(drawing, "")));
    }
  }
  return packageWriter.finish();
}

it.each(fixtures)(
  "%s resolves original base, conditional and direct cell fills",
  /** Checks the original Writer assertions and both XML file owners. @param file - Pinned source. @param samples - Cell and expected color triples. @param headerCount - Expected repeat count. @returns Completion. */
  async (file, samples, headerCount) => {
    const document = await importOOXML(await tableFixture(file), {}).catch(ThrowFilterLoadError);
    try {
      for (const [row, col, color] of samples) expect(colorAt(document, row, col)).toBe(color);
      if (headerCount !== undefined)
        expect(document.GetTables()[0]?.GetRowsToRepeat()).toBe(headerCount);

      const output = await DocxExport.WriteDocument(document);
      const archive = await DocumentArchive.open(output);
      if (file === "table-style-cell-back-color.docx") {
        const styles = await archive.readTextEntry("word/styles.xml");
        expect(styles).toMatch(/<w:tcPr><w:shd [^>]*w:fill="00FF00"[^>]*\/>/u);
        expect(await archive.readTextEntry("word/document.xml")).toMatch(
          /<w:shd [^>]*w:fill="00FF00"/u,
        );
      }
      if (file === "tdf138020_undefined_firstCol.docx") {
        const styles = await archive.readTextEntry("word/styles.xml");
        expect(styles).toMatch(/<w:shd [^>]*w:themeFill="accent6"[^>]*\/>/u);
      }
      const reopened = await importOOXML(output, {}).catch(ThrowFilterLoadError);
      try {
        for (const [row, col, color] of samples) expect(colorAt(reopened, row, col)).toBe(color);
      } finally {
        reopened.Dispose();
      }
      const { document: odt } = await readOdtDocument(
        await writeOdtDocument(document, metadata),
        metadata,
      );
      try {
        for (const [row, col, color] of samples) expect(colorAt(odt, row, col)).toBe(color);
      } finally {
        odt.Dispose();
      }
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      const message = text(error.Message);
      error.dispose();
      throw new Error(message || "Native table conversion threw an exception without a message.", {
        cause: error,
      });
    } finally {
      document.Dispose();
    }
  },
);

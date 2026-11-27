/** @fileoverview Port of the pinned Calc testCellNoteExportODS scenario. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

it("testCellNoteExportODS preserves imported and newly created notes on empty cells", /** Executes the native fixture scenario across both transfer paths. @returns Completion. */ async () => {
  const document = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/single-note.ods"),
    ),
  );
  const a1 = new ScAddress(0, 0, 0);
  const a2 = new ScAddress(0, 1, 0);
  expect(document.HasNote(a1)).toBe(true);
  expect(document.GetNote(a1)?.GetText()).toBe("a");
  expect(document.GetNote(a1)?.GetDate()).toBe("2014-02-02T00:00:00");

  const note = document.GetOrCreateNote(a2);
  assert(note);
  note.SetText(a2, "Note One");
  note.SetAuthor("Author One");
  expect(document.HasNote(a2)).toBe(true);

  const restored = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
  const reopened = await readOdsDocument(await writeOdsDocument(restored));
  for (const workbook of [restored, reopened]) {
    expect(workbook.HasNote(a1)).toBe(true);
    expect(workbook.HasNote(a2)).toBe(true);
    expect(workbook.GetNote(a1)?.GetText()).toBe("a");
    expect(workbook.GetNote(a2)?.GetText()).toBe("Note One");
    expect(workbook.GetNote(a2)?.GetAuthor()).toBe("Author One");
    expect(workbook.GetCellType(a1)).toBe(CellType.CELLTYPE_NONE);
    expect(workbook.GetCellType(a2)).toBe(CellType.CELLTYPE_NONE);
  }
});

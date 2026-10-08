/** @fileoverview Verifies primitive transport and ODF reconstruction of native row-split items. */
import { expect, it } from "vitest";
import { SwDoc } from "../../../source/core/doc/doc";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { encodeWriterDocument, decodeWriterDocument } from "./writer-document-codec";
import {
  encodeRowFormat,
  decodeRowFormat,
  type WriterRowFormatRecord,
} from "./writer-table-item-codec";
import { exportContentXml } from "../../../source/filter/xml/xmlexp";
import { writeOdtDocument } from "../../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../../source/filter/xml/swxml";
/** Requires a connected native owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing transported row");
  return value;
}
it.each([undefined, false, true])(
  "primitive records reconstruct independent concrete item value=%s",
  /** Tests actual structured-clone and JSON boundaries. @param value - Optional authored flag. @returns Nothing. */
  (value) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Transport");
    table.AddColumnWidth(3000);
    const input = value === undefined ? undefined : new SwFormatRowSplit(value);
    const row = doc.nodes.AppendTableRow(table, 1, { rowSplit: input });
    const encoded = encodeWriterDocument(doc),
      record = required(required(encoded.tables?.[0]).rows[0]).format;
    expect(record.rowSplit).toBe(value);
    expect(record).not.toHaveProperty("keepTogether");
    for (const primitive of [structuredClone(encoded), JSON.parse(JSON.stringify(encoded))]) {
      const reopened = decodeWriterDocument(primitive),
        native = required(required(reopened.GetTables()[0]).GetTabLines()[0]);
      expect(native.GetRowSplit()).toBeInstanceOf(SwFormatRowSplit);
      expect(native.GetRowSplit().GetValue()).toBe(value ?? true);
      expect(native.GetFormat()).not.toHaveProperty("keepTogether");
      native.SetFormat({ rowSplit: new SwFormatRowSplit(!(value ?? true)) });
      expect(row.GetRowSplit().GetValue()).toBe(value ?? true);
      if (value === undefined) expect(row.GetFormat().rowSplit).toBeUndefined();
    }
    const direct = decodeRowFormat(structuredClone(encodeRowFormat(row.GetFormat())));
    expect(direct.rowSplit?.GetValue()).toBe(value);
    if (input !== undefined) expect(direct.rowSplit).not.toBe(input);
  },
);
it.each([false, true])(
  "legacy inverse flag enters only storage ingestion keepTogether=%s",
  /** Checks legacy reconstruction and canonical re-encoding. @param inverse - Stored legacy flag. @returns Nothing. */
  (inverse) => {
    const native = decodeRowFormat({ keepTogether: inverse });
    expect(native.rowSplit).toBeInstanceOf(SwFormatRowSplit);
    expect(native.rowSplit?.GetValue()).toBe(!inverse);
    expect(native).not.toHaveProperty("keepTogether");
    expect(encodeRowFormat(native).rowSplit).toBe(!inverse);
    expect(encodeRowFormat(native)).not.toHaveProperty("keepTogether");
  },
);
it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
] as const)(
  "native flag wins legacy inverse rowSplit=%s keepTogether=%s",
  /** Tests both authored booleans retain priority. @param split - Native flag. @param inverse - Legacy inverse. @returns Nothing. */
  (split, inverse) => {
    expect(decodeRowFormat({ rowSplit: split, keepTogether: inverse }).rowSplit?.GetValue()).toBe(
      split,
    );
  },
);
for (const key of ["rowSplit", "keepTogether"] as const)
  it.each([null, 0, 1, "false", {}, []])(
    "rejects invalid primitive " + key + "=%s",
    /** Checks untrusted scalar admission. @param invalid - Malformed scalar. @returns Nothing. */
    (invalid) => {
      expect(
        /** Decodes the malformed primitive. @returns Format or error. */ () =>
          decodeRowFormat({ [key]: invalid } as unknown as WriterRowFormatRecord),
      ).toThrow("Stored Writer row split is invalid.");
    },
  );
it.each([undefined, false, true])(
  "ODF stores inverse XML while reopening native ownership value=%s",
  /** Checks actual archive export/reopen with exact row attributes. @param value - Optional authored flag. @returns Completion. */
  async (value) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("ODF");
    table.AddColumnWidth(3000);
    doc.nodes.AppendTableRow(table, 1, {
      rowSplit: value === undefined ? undefined : new SwFormatRowSplit(value),
    });
    const xml = exportContentXml(doc);
    if (value === undefined) expect(xml).not.toContain("fo:keep-together=");
    else expect(xml).toContain('fo:keep-together="' + (value ? "auto" : "always") + '"');
    const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "ODF" }), {
        title: "ODF",
      }),
      row = required(required(reopened.document.GetTables()[0]).GetTabLines()[0]);
    expect(row.GetRowSplit()).toBeInstanceOf(SwFormatRowSplit);
    expect(row.GetRowSplit().GetValue()).toBe(value ?? true);
    expect(row.GetFormat()).not.toHaveProperty("keepTogether");
    if (value !== undefined) expect(row.GetFormat().rowSplit).toBeInstanceOf(SwFormatRowSplit);
  },
);

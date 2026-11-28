/** @fileoverview Ports original Calc ODS number-format placeholder round trips. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ExcelFilter } from "../oox/excelfilter";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

const fixtures = "../../vendor/libreoffice-reference/sc/qa/unit/data/ods";
const firstCell = new ScAddress();

/** Reads the actual compiled number format assigned to the original test cell. @param document - Calc document. @returns Native format code. */
function code(document: ScDocument): string {
  const formatter = document.GetFormatTable();
  const key = document.GetPattern(firstCell)?.GetNumberFormat(formatter) ?? 0;
  const entry = formatter.GetEntry(key);
  assert(entry);
  return text(entry.GetFormatstring());
}

it.each([
  ["tdf152724-Blank-width-char.ods", "[>0]_-?0;[<0]-?0;_-?0;@"],
  ["tdf170670-Blank-width-char.ods", '[>0]#,##0_);[<0](#,##0);"-"_)'],
  ["tdf156449-Blank-In-Exponent.ods", "0.00E+?0"],
  ["tdf153993-Exponent-lower-case.ods", '0.000" "000" "e+" "0'],
])(
  "preserves the native number format from %s through ODS",
  /** Replays the original tdf152724, tdf170670, testBlankInExponent and testLowercaseExponent asserts. @param name - Original document. @param expected - Original format string. @returns Completion. */
  async (name, expected) => {
    const original = await readOdsDocument(new Uint8Array(readFileSync(fixtures + "/" + name)));
    try {
      const copy = await readOdsDocument(await writeOdsDocument(original));
      try {
        expect(code(copy)).toBe(expected);
      } finally {
        copy.Dispose();
      }
      if (name === "tdf156449-Blank-In-Exponent.ods") {
        const format = unicode("0.00E+??");
        try {
          const check: [number] = [0];
          const key: [number] = [0];
          original.GetFormatTable().PutEntry(format, check, [0], key);
          expect(check[0]).toBe(0);
          original.SetNumberFormat(firstCell, key[0]);
        } finally {
          format.dispose();
        }
        const reloaded = await readOdsDocument(await writeOdsDocument(original));
        try {
          expect(code(reloaded)).toBe(expected);
        } finally {
          reloaded.Dispose();
        }
      }
    } finally {
      original.Dispose();
    }
  },
);

it.each([
  ["embedded-text-in-decimal.xlsx", '#,##0.000" "###" "###'],
  ["seconds-without-truncate-and-decimals.xlsx", "[SS].00"],
])(
  "saves the number format from %s through ODS",
  /** Ports testEmbeddedTextInDecimal and testSecondsWithoutTruncateAndDecimals. @param name - Original XLSX document. @param expected - Pinned native format. @returns Completion. */
  async (name, expected) => {
    const bytes = readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/" + name);
    const original = await ExcelFilter.importDocument(new Uint8Array(bytes));
    try {
      const copy = await readOdsDocument(await writeOdsDocument(original));
      try {
        expect(code(copy)).toBe(expected);
      } finally {
        copy.Dispose();
      }
    } finally {
      original.Dispose();
    }
  },
);

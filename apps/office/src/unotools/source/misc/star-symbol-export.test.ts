/** @fileoverview Compares every UTF16 key with unchanged compiled native StarSymbol export mapping. */
import { expect, it } from "vitest";
import native from "./star-symbol-export.native.json" with { type: "json" };
import { CreateStarSymbolToMSMultiFont } from "./fontcvt";
import { bestFitOpenSymbolToMSFont } from "../../../filter/source/msfilter/util";
import {
  RTL_TEXTENCODING_MS_1252,
  RTL_TEXTENCODING_SYMBOL,
  RTL_TEXTENCODING_UCS2,
} from "../../../sal/inc/rtl/textenc";
it("matches every native UTF16 key and its selected reverse byte and font", /** Uses all65536 compiled cases, including equivalent-key preference and absent-key preservation. @returns Nothing. */ () => {
  const converter = CreateStarSymbolToMSMultiFont();
  const hits = new Map(
    native.hits.map(
      /** Builds the independently compiled oracle index. @param row - Original output. @returns Key/value pair. */ (
        row,
      ) => [row[0] as number, row],
    ),
  );
  try {
    for (let unit = 0; unit < native.domain; ++unit) {
      const expected = hits.get(unit),
        character = { value: unit };
      const font = converter.ConvertChar(character);
      if (font !== (expected?.[2] ?? "") || character.value !== (expected?.[1] ?? unit))
        throw new Error(`Native StarSymbol mismatch at ${unit}`);
    }
  } finally {
    converter.Dispose();
  }
});
it("preserves the original public, standardized and private-area fallback branches", /** Verifies the actual shared utility and its in/out scalars. @returns Nothing. */ () => {
  const charset = { value: RTL_TEXTENCODING_MS_1252 },
    family = { value: "OpenSymbol;Fallback" };
  const selected = native.hits.find(
    /** Selects a known public bullet. @param row - Native result. @returns Match. */ (row) =>
      row[0] === 0x2022,
  );
  expect(bestFitOpenSymbolToMSFont(0x2022, charset, family)).toBe(
    (selected?.[1] as number) | 0xf000,
  );
  expect(charset.value).toBe(RTL_TEXTENCODING_SYMBOL);
  expect(family.value).toBe(selected?.[2]);
  charset.value = RTL_TEXTENCODING_MS_1252;
  family.value = "OpenSymbol;Fallback";
  expect(bestFitOpenSymbolToMSFont(0x4e00, charset, family)).toBe(0x4e00);
  expect(charset.value).toBe(RTL_TEXTENCODING_UCS2);
  expect(family.value).toBe("OpenSymbol");
  charset.value = RTL_TEXTENCODING_MS_1252;
  family.value = "OpenSymbol";
  expect(bestFitOpenSymbolToMSFont(0xe7ff, charset, family)).toBe(0x6c);
  expect(charset.value).toBe(RTL_TEXTENCODING_MS_1252);
  expect(family.value).toBe("Wingdings");
});

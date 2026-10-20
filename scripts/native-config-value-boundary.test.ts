/** @fileoverview Exact original XML-value and SAL byte-view edges retain neighboring, browser and broader graph restrictions. */
import { expect, it } from "vitest";
import {
  isOriginalCharacterValueImport,
  isOriginalSalO3tlImport,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";
it("admits only the original configuration XML value consumer", /** No module-wide configmgr/xmlreader permission is added. @returns Nothing. */ () => {
  for (const target of [
    "xmlreader/inc/xmlreader.ts",
    "xmlreader/inc/span.ts",
    "xmlreader/inc/pad.ts",
  ]) {
    expect(isOriginalCharacterValueImport("configmgr/source/valueparser.ts", target)).toBe(true);
    expect(isOriginalCharacterValueImport("configmgr/source/valueparser-neighbor.ts", target)).toBe(
      false,
    );
    expect(isOriginalCharacterValueImport("configmgr/browser/valueparser.ts", target)).toBe(false);
  }
  expect(isForbiddenModuleEdge("configmgr", "xmlreader")).toBe(true);
});
it("admits only the original SAL byte integral named import", /** Original witnessed two-owner cycle rules remain unchanged. @returns Nothing. */ () => {
  const spec = "../../sal/inc/rtl/string.h",
    source = 'import { rtl_str_toInt64_WithLength } from "../../sal/inc/rtl/string.h";';
  expect(
    isOriginalSalO3tlImport("o3tl/inc/string_view.ts", "sal/inc/rtl/string.h.ts", source, spec),
  ).toBe(true);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/string_view-neighbor.ts",
      "sal/inc/rtl/string.h.ts",
      source,
      spec,
    ),
  ).toBe(false);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/string_view.ts",
      "sal/inc/rtl/string.h.ts",
      source.replace("rtl_str_toInt64_WithLength", "rtl_str_toUInt64"),
      spec,
    ),
  ).toBe(false);
});

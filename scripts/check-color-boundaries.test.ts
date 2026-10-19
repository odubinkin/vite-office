/** @fileoverview Native named-color value edges and the browser-only toolbox/document binding remain exact. */
import { expect, it } from "vitest";
import {
  isOriginalCharacterValueImport,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";
it("admits native named-color headers without opening general Sfx color-module edges", /** Checks exact include responsibilities and neighboring rejections. @returns Nothing. */ () => {
  const source = "sfx2/inc/namedcolor.ts";
  for (const target of [
    "tools/inc/color",
    "sal/inc/rtl/ustring",
    "docmodel/inc/color/ComplexColor",
    "docmodel/inc/color/Transformation",
    "docmodel/inc/theme/ThemeColorType",
  ])
    expect(isOriginalCharacterValueImport(source, target)).toBe(true);
  expect(isOriginalCharacterValueImport(source, "docmodel/inc/theme/Theme")).toBe(false);
  expect(isOriginalCharacterValueImport("sfx2/inc/other.ts", "tools/inc/color")).toBe(false);
  expect(isForbiddenModuleEdge("sfx2", "docmodel")).toBe(true);
});
it("keeps toolbox/document and name conversion edges on the actual browser binding", /** Rejects a core or unrelated palette consumer. @returns Nothing. */ () => {
  const source = "svx/browser/tbxctrls/ColorSelect.tsx";
  expect(isOriginalCharacterValueImport(source, "sfx2/source/doc/objsh")).toBe(true);
  expect(isOriginalCharacterValueImport(source, "sfx2/inc/namedcolor")).toBe(true);
  expect(isOriginalCharacterValueImport(source, "i18nlangtag/source/isolang/isolang.tables")).toBe(
    true,
  );
  expect(
    isOriginalCharacterValueImport("svx/source/tbxctrls/tbcontrl.ts", "sfx2/source/doc/objsh"),
  ).toBe(false);
  expect(isOriginalCharacterValueImport(source, "sfx2/source/doc/docfile")).toBe(false);
  expect(isForbiddenModuleEdge("svx", "sfx2")).toBe(true);
  expect(
    isOriginalCharacterValueImport(
      "sc/source/core/data/patattr.ts",
      "docmodel/inc/color/ComplexColor",
    ),
  ).toBe(true);
  expect(
    isOriginalCharacterValueImport(
      "sc/source/core/data/other.ts",
      "docmodel/inc/color/ComplexColor",
    ),
  ).toBe(false);
});

/** @fileoverview Original byte/UTF16 numeric header witnesses without permitting unrelated SAL/o3tl dependencies. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge, isOriginalSalO3tlImport } from "./check-module-boundaries.mjs";
it("admits only source-backed VCL variation and original byte/UTF16 decimal header bindings", /** Preserves reverse/application edge rejection and exact shared SAL/o3tl named bindings. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("vcl", "o3tl")).toBe(false);
  expect(isForbiddenModuleEdge("o3tl", "vcl")).toBe(true);
  expect(isForbiddenModuleEdge("vcl", "sc")).toBe(true);
  const specifier = "../../sal/inc/rtl/math.h";
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/string_view.ts",
      "sal/inc/rtl/math.h.ts",
      'import { rtl_math_stringToDouble, rtl_math_uStringToDouble } from "../../sal/inc/rtl/math.h";',
      specifier,
    ),
  ).toBe(true);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/string_view.ts",
      "sal/inc/rtl/math.h.ts",
      'import { rtl_math_uStringToDouble } from "../../sal/inc/rtl/math.h";',
      specifier,
    ),
  ).toBe(false);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/string_view.ts",
      "sal/inc/rtl/math.h.ts",
      'import { rtl_math_stringToDouble } from "../../sal/inc/rtl/math.h";',
      specifier,
    ),
  ).toBe(false);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/string_view.ts",
      "sal/inc/rtl/math.h.ts",
      'import { rtl_math_round } from "../../sal/inc/rtl/math.h";',
      specifier,
    ),
  ).toBe(false);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/other.ts",
      "sal/inc/rtl/math.h.ts",
      'import { rtl_math_uStringToDouble } from "../../sal/inc/rtl/math.h";',
      specifier,
    ),
  ).toBe(false);
});

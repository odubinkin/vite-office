/** @fileoverview Exact native rtl codepoint import and rejection of unrelated SAL/o3tl bindings. */
import { expect, it } from "vitest";
import { isOriginalSalO3tlImport } from "./check-module-boundaries.mjs";

it("admits only the original rtl_uString codepoint binding into the existing SAL/o3tl component", /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () => {
  const specifier = "../../o3tl/inc/string_view";
  expect(
    isOriginalSalO3tlImport(
      "sal/rtl/ustring.ts",
      "o3tl/inc/string_view.ts",
      `import { iterateCodePoints } from "${specifier}";`,
      specifier,
    ),
  ).toBe(true);
  expect(
    isOriginalSalO3tlImport(
      "sal/rtl/ustring.ts",
      "o3tl/inc/string_view.ts",
      `import { iterateCodePoints, toInt32 } from "${specifier}";`,
      specifier,
    ),
  ).toBe(false);
  expect(
    isOriginalSalO3tlImport(
      "sal/rtl/strtmpl.ts",
      "o3tl/inc/string_view.ts",
      `import { iterateCodePoints } from "${specifier}";`,
      specifier,
    ),
  ).toBe(false);
});

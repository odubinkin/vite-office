/** @fileoverview Exact original file.cxx token dependency; unrelated SAL imports stay rejected. */
import { expect, it } from "vitest";
import { isOriginalSalO3tlImport } from "./check-module-boundaries.mjs";
it("admits only the original setAllowedPaths token helper", /** Rejects wider symbols and different owners. @returns Nothing. */ () => {
  const source = "sal/osl/unx/file.access.ts",
    target = "o3tl/inc/string_view.ts",
    spec = "../../../o3tl/inc/string_view";
  expect(isOriginalSalO3tlImport(source, target, `import { getToken } from "${spec}";`, spec)).toBe(
    true,
  );
  expect(
    isOriginalSalO3tlImport(
      source,
      target,
      `import { getToken, starts_with } from "${spec}";`,
      spec,
    ),
  ).toBe(false);
  expect(
    isOriginalSalO3tlImport(
      "sal/osl/unx/other.ts",
      target,
      `import { getToken } from "${spec}";`,
      spec,
    ),
  ).toBe(false);
});

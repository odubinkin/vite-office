/** @fileoverview Source-backed SAX locator components retain lower-level and browser dependency isolation. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge, getRuntimeOwnershipViolation } from "./check-module-boundaries.mjs";
it("admits Library_sax cppuhelper linkage without reverse or browser edges", /** The original FastLocatorImpl derives from WeakImplHelper. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("sax", "cppuhelper")).toBe(false);
  expect(isForbiddenModuleEdge("cppuhelper", "sax")).toBe(true);
  for (const path of [
    "sax/source/fastparser/fastparser.ts",
    "sax/source/fastparser/streaminput.ts",
  ]) {
    expect(getRuntimeOwnershipViolation(path, "", "react")).toMatch(/presentation package/u);
    expect(getRuntimeOwnershipViolation(path, "vcl/browser/font-list.ts", "../font-list")).toMatch(
      /browser adapters/u,
    );
  }
});
it("admits the original oox FastParser InputSource SDK edge without reverse or browser dependencies", /** Native fastparser.hxx and fastparser.cxx consume SAX SDK InputSource. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("oox", "offapi")).toBe(false);
  expect(isForbiddenModuleEdge("offapi", "oox")).toBe(true);
  expect(getRuntimeOwnershipViolation("oox/source/core/fastparser.ts", "", "react")).toMatch(
    /presentation package/u,
  );
});

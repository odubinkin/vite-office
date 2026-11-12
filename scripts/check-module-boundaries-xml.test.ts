/** @fileoverview Source XML/exception boundaries retained independently of browser composition. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge, getRuntimeOwnershipViolation } from "./check-module-boundaries.mjs";
it("retains native DocumentBuilder dependencies while rejecting reverse browser ownership", /** The source builder consumes processfactory and UCB Content; host exception execution stays injected. @returns Nothing. */ () => {
  for (const dependency of ["comphelper", "ucbhelper", "external"])
    expect(isForbiddenModuleEdge("unoxml", dependency)).toBe(false);
  for (const dependency of ["sc", "sw", "framework"])
    expect(isForbiddenModuleEdge("unoxml", dependency)).toBe(true);
  expect(
    getRuntimeOwnershipViolation(
      "cppu/inc/com/sun/star/uno/exception-values.ts",
      "cppu/inc/uno/exception-bindings.ts",
      "../../../../uno/exception-bindings",
    ),
  ).toBeUndefined();
  expect(
    getRuntimeOwnershipViolation(
      "cppuhelper/inc/exc_hlp.ts",
      "cppuhelper/browser/exception-abi.ts",
      "../browser/exception-abi",
    ),
  ).toMatch(/injected contract/u);
});

it("retains the source metadata converter dependency without reverse Sfx coupling", /** SfxDocumentMetaData.cxx calls sax::Converter and Library_sfx links sax. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("sfx2", "sax")).toBe(false);
  expect(isForbiddenModuleEdge("sax", "sfx2")).toBe(true);
});

it("admits desktop service composition of native SAX without reverse application ownership", /** Library_sax sets expwrap as a services component and Desktop bootstrap loads the registry; the browser statically links that exact factory. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("desktop", "sax")).toBe(false);
  expect(isForbiddenModuleEdge("sax", "desktop")).toBe(true);
});

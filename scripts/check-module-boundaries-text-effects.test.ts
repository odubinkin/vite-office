/** @fileoverview Exact source-backed text effect handler dependencies retain general xmloff ownership boundaries. */
import { expect, it } from "vitest";
import {
  isOriginalCharacterValueImport,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";
it("admits only original shadow/constants value imports without permitting neighboring handlers or general owner edges", /** Tests native admission and negative ownership boundaries. @returns Nothing. */ () => {
  const shadow = "xmloff/source/style/shdwdhdl.ts",
    constants = "xmloff/source/style/XMLConstantsPropertyHandler.ts",
    any = "cppu/inc/com/sun/star/uno/Any.ts",
    type = "udkapi/com/sun/star/uno/TypeClass.ts";
  expect(isOriginalCharacterValueImport(shadow, any)).toBe(true);
  expect(isOriginalCharacterValueImport(constants, any)).toBe(true);
  expect(isOriginalCharacterValueImport(constants, type)).toBe(true);
  expect(isOriginalCharacterValueImport(shadow, type)).toBe(false);
  expect(isOriginalCharacterValueImport("xmloff/source/style/other.ts", any)).toBe(false);
  expect(isOriginalCharacterValueImport(constants, "comphelper/inc/extract.ts")).toBe(false);
  // Original Library_xo links CPPU and consumes the generated UNO property/cursor interfaces.
  expect(isForbiddenModuleEdge("xmloff", "cppu")).toBe(false);
  expect(isForbiddenModuleEdge("xmloff", "udkapi")).toBe(false);
  expect(isForbiddenModuleEdge("xmloff", "comphelper")).toBe(true);
});

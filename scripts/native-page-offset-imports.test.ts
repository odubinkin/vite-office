/** @fileoverview Pins only source-backed pagination Any imports without opening neighboring module or browser permissions. */
import { expect, it } from "vitest";
import {
  isOriginalCharacterValueImport,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";
it("admits only actual Any at represented XML pagination property owners", /** Original xmlstyle.cxx and txtparae.cxx consume Any;broader cppu access remains forbidden. @returns Nothing. */ () => {
  const any = "cppu/inc/com/sun/star/uno/Any.ts";
  for (const source of ["xmloff/source/style/xmlstyle.ts", "xmloff/source/text/txtparae.ts"]) {
    expect(isOriginalCharacterValueImport(source, any)).toBe(true);
    expect(isOriginalCharacterValueImport(source, "cppu/inc/typelib/typedescription.ts")).toBe(
      false,
    );
    expect(isOriginalCharacterValueImport(source, "vcl/browser/font-list.ts")).toBe(false);
  }
  expect(isOriginalCharacterValueImport("xmloff/source/text/other.ts", any)).toBe(false);
  // Original Library_xo links CPPU; neighboring source-path exceptions remain independently restricted.
  expect(isForbiddenModuleEdge("xmloff", "cppu")).toBe(false);
});

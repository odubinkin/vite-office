/** @fileoverview Native SfxHTMLParser table-number dependencies retain upstream header owners and reject application/browser/reverse dependencies. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge } from "./check-module-boundaries.mjs";
it("admits original sfxhtml.hxx/cxx language and string-view owners while retaining lower-layer boundaries", /** Original sfxhtml.hxx includes i18nlangtag/lang.h and sfxhtml.cxx includes o3tl/string_view.hxx. Other unapproved imports remain rejected. @returns Nothing. */ () => {
  for (const dependency of ["i18nlangtag", "o3tl"]) {
    expect(isForbiddenModuleEdge("sfx2", dependency)).toBe(false);
    expect(isForbiddenModuleEdge(dependency, "sfx2")).toBe(true);
  }
  for (const dependency of ["sw", "sc", "framework", "vcl"])
    expect(isForbiddenModuleEdge("sfx2", dependency)).toBe(true);
});

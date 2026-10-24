/** @fileoverview Exact native font-size numeric/host-field imports retain all neighboring service and blanket graph restrictions. */
import { expect, it } from "vitest";
import {
  isOriginalCharacterValueImport,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";
it.each([
  ["svtools/source/control/ctrlbox.fontsize.ts", "vcl/source/control/field.ts"],
  ["svx/browser/tbxctrls/font-size-binding.ts", "unotools/source/misc/syslocale.ts"],
  ["svl/source/config/languageoptions.ts", "i18nlangtag/source/isolang/mslangid.ts"],
  ["svl/source/config/languageoptions.ts", "i18nlangtag/source/isolang/mslangid.script.ts"],
  ["svl/source/config/languageoptions.ts", "i18nlangtag/inc/lang.ts"],
  ["svl/source/config/languageoptions.ts", "offapi/com/sun/star/i18n/ScriptType.ts"],
  ["sw/source/core/attr/hints.ts", "i18nlangtag/source/isolang/mslangid.ts"],
  ["sw/source/core/edit/edattr-script.ts", "i18npool/source/breakiterator/breakiteratorImpl.ts"],
  ["sw/source/core/edit/edattr-script.ts", "i18nlangtag/source/isolang/mslangid.ts"],
  ["sw/source/core/edit/edattr-script.ts", "i18nlangtag/inc/lang.ts"],
])(
  "admits only original font numeric/field ownership %s to %s",
  /** No directory-level permission follows this source-backed edge. @param source - Consumer. @param target - Original numeric/field owner. @returns Nothing. */ (
    source,
    target,
  ) => {
    expect(isOriginalCharacterValueImport(source, target)).toBe(true);
    expect(isOriginalCharacterValueImport(source.replace(".ts", "-neighbor.ts"), target)).toBe(
      false,
    );
    expect(isOriginalCharacterValueImport(source, target.replace(".ts", "-neighbor.ts"))).toBe(
      false,
    );
    expect(isOriginalCharacterValueImport(source, "vcl/browser/font-list.ts")).toBe(false);
  },
);
it("retains the restricted library graph", /** Source field access cannot introduce an executable module cycle or font/config service. @returns Nothing. */ () => {
  // Library_svt links VCL; sampletext and font-name previews consume real device font data.
  expect(isForbiddenModuleEdge("svtools", "vcl")).toBe(false);
  expect(isForbiddenModuleEdge("svx", "unotools")).toBe(true);
});

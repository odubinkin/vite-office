/** @fileoverview Exact native numeric/map/host-field edges preserve neighboring and blanket library graph restrictions. */
import { expect, it } from "vitest";
import {
  isOriginalCharacterValueImport,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";
it.each([
  ["svtools/source/misc/unitconv.ts", "vcl/source/outdev/map.ts"],
  [
    "svx/browser/sidebar/paragraph/ParaLineSpacingControl.tsx",
    "i18nutil/source/utility/unicode.percent.ts",
  ],
  ["svtools/source/misc/unitconv.ts", "vcl/source/weld/MetricSpinButton.ts"],
  ["svx/browser/sidebar/paragraph/ParaLineSpacingControl.tsx", "unotools/source/misc/syslocale.ts"],
])(
  "admits only original line spacing field ownership %s to %s",
  /** No directory-level permission follows exact source edges. @param source - Native consumer. @param target - Exact scalar owner. @returns Nothing. */ (
    source,
    target,
  ) => {
    expect(isOriginalCharacterValueImport(source, target)).toBe(true);
    expect(isOriginalCharacterValueImport(source.replace(/\.tsx?$/, "-neighbor.ts"), target)).toBe(
      false,
    );
    expect(isOriginalCharacterValueImport(source, target.replace(/\.tsx?$/, "-neighbor.ts"))).toBe(
      false,
    );
    expect(isOriginalCharacterValueImport(source, "vcl/browser/fake-device.ts")).toBe(false);
  },
);
it("retains the restricted shared library graph", /** Scalar fields cannot introduce general service dependencies. @returns Nothing. */ () => {
  // Library_svt links VCL; sampletext and font-name previews consume real device font data.
  expect(isForbiddenModuleEdge("svtools", "vcl")).toBe(false);
  expect(isForbiddenModuleEdge("svx", "unotools")).toBe(true);
});

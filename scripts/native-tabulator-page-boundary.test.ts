/** @fileoverview Native tab-page numeric/query/host field edges stay exact while neighboring and blanket graph restrictions remain. */
import { expect, it } from "vitest";
import {
  isOriginalCharacterValueImport,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";
it.each([
  ["cui/browser/tabpages/TabulatorTabPage.tsx", "svtools/inc/ruler.ts"],
  ["cui/browser/tabpages/TabulatorTabPage.tsx", "svtools/browser/control/RulerTabSymbol.tsx"],
  ["cui/source/tabpages/tabstpge.ts", "vcl/source/weld/MetricSpinButton.ts"],
  ["cui/source/tabpages/tabstpge.ts", "vcl/source/outdev/map.ts"],
  ["cui/source/tabpages/tabstpge.ts", "svtools/source/misc/unitconv.ts"],
  ["cui/source/tabpages/tabstpge.ts", "sfx2/source/dialog/SfxTabPage.ts"],
  ["cui/browser/tabpages/tabstpge-binding.ts", "vcl/source/weld/MetricSpinButton.ts"],
  ["cui/browser/tabpages/tabstpge-binding.ts", "vcl/inc/units.ts"],
  ["cui/browser/tabpages/tabstpge-binding.ts", "unotools/source/misc/syslocale.ts"],
])(
  "allows only source-backed native tab-page edge %s to %s",
  /** Explicit edges grant no general provider/widget dependency. @param source - Actual consumer. @param target - Actual native scalar/field owner. @returns Nothing. */ (
    source,
    target,
  ) => {
    expect(isOriginalCharacterValueImport(source, target)).toBe(true);
    expect(isOriginalCharacterValueImport(source, target.replace(/\.tsx?$/u, ""))).toBe(true);
    expect(isOriginalCharacterValueImport(source.replace(".ts", "-neighbor.ts"), target)).toBe(
      false,
    );
    expect(isOriginalCharacterValueImport(source, target.replace(".ts", "-neighbor.ts"))).toBe(
      false,
    );
    expect(isOriginalCharacterValueImport(source, "vcl/browser/native-provider.ts")).toBe(false);
  },
);
it("retains native module blanket restrictions", /** A field query cannot enable unrelated framework or configuration imports. @returns Nothing. */ () => {
  for (const target of ["vcl", "svtools", "sfx2", "unotools"])
    expect(isForbiddenModuleEdge("cui", target)).toBe(true);
});

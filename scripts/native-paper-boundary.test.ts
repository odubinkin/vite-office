/** @fileoverview Exact native paper enum/unit and existing host-locale field permissions leave neighboring service/module guards intact. */
import { expect, it } from "vitest";
import {
  isOriginalCharacterValueImport,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";
it.each([
  ["cui/source/tabpages/page.ts", "i18nutil/inc/paper.ts"],
  ["cui/source/tabpages/page.ts", "o3tl/inc/unit_conversion.ts"],
  ["svx/source/dialog/page.ts", "i18nutil/inc/paper.ts"],
  ["svx/source/dialog/papersizelistbox.ts", "i18nutil/inc/paper.ts"],
  ["sw/source/core/layout/pagedesc.ts", "i18nlangtag/source/isolang/insys.locale.ts"],
])(
  "admits only actual paper values %s to %s",
  /** Exact field/value edges do not grant directory or browser access. @param source - Original responsibility. @param target - Native field/value owner. @returns Nothing. */ (
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
    expect(isOriginalCharacterValueImport(source, "sw/browser/presentation/writer-view.tsx")).toBe(
      false,
    );
  },
);
it("keeps general library edges restricted", /** Exact original header/value witnesses do not weaken blanket graph permissions. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("cui", "i18nutil")).toBe(true);
  expect(isForbiddenModuleEdge("cui", "o3tl")).toBe(true);
  expect(isForbiddenModuleEdge("svx", "i18nutil")).toBe(true);
  // Native Markdown callbacks consume LanguageTag through Library_sw.
  expect(isForbiddenModuleEdge("sw", "i18nlangtag")).toBe(false);
  expect(isForbiddenModuleEdge("cui", "i18nlangtag")).toBe(true);
});

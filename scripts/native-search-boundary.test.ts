/** @fileoverview Exact source-backed search value imports leave module defaults and browser boundaries unchanged. */
import { expect, it } from "vitest";
import {
  isOriginalCharacterValueImport,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";

it("admits only native search and character classification value edges", /** Preserves module defaults and reverse/browser restrictions while enabling exact source consumers. @returns Nothing. */ () => {
  for (const [source, targets] of [
    ["sw/source/core/crsr/swcrsr.ts", ["i18nutil/inc/searchopt.ts"]],
    ["sw/source/core/crsr/findtxt.ts", ["i18nutil/inc/searchopt.ts"]],
    [
      "unotools/source/i18n/textsearch.ts",
      ["i18nutil/inc/searchopt.ts", "offapi/com/sun/star/util/SearchResult.ts"],
    ],
    [
      "i18npool/source/characterclassification/cclass_unicode.ts",
      [
        "external/icu/source/common/uchar.ts",
        "external/icu/source/common/unicode/uchar.ts",
        "o3tl/inc/string_view.ts",
        "offapi/com/sun/star/i18n/KCharacterType.ts",
      ],
    ],
    [
      "i18npool/source/search/textsearch.ts",
      [
        "offapi/com/sun/star/util/SearchAlgorithms.ts",
        "offapi/com/sun/star/util/SearchOptions.ts",
        "offapi/com/sun/star/util/SearchOptions2.ts",
        "offapi/com/sun/star/util/SearchAlgorithms2.ts",
        "offapi/com/sun/star/util/SearchFlags.ts",
        "offapi/com/sun/star/util/SearchResult.ts",
        "offapi/com/sun/star/i18n/KCharacterType.ts",
        "o3tl/inc/string_view.ts",
      ],
    ],
    ["offapi/com/sun/star/util/SearchOptions.ts", ["udkapi/com/sun/star/lang/Locale.ts"]],
  ] as const) {
    for (const target of targets) {
      expect(isOriginalCharacterValueImport(source, target)).toBe(true);
      expect(isOriginalCharacterValueImport(source.replace(".ts", "-neighbor.ts"), target)).toBe(
        false,
      );
    }
    expect(isOriginalCharacterValueImport(source, "sw/browser/presentation/writer-view.tsx")).toBe(
      false,
    );
  }
  expect(isForbiddenModuleEdge("unotools", "i18nutil")).toBe(true);
  expect(isForbiddenModuleEdge("i18npool", "offapi")).toBe(true);
  expect(isForbiddenModuleEdge("i18npool", "external")).toBe(true);
  expect(isForbiddenModuleEdge("offapi", "udkapi")).toBe(true);
});

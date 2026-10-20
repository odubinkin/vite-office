/** @fileoverview Keeps the consumed script service and native UTF16 helper imports narrow. */
import { expect, it } from "vitest";
import {
  isForbiddenModuleEdge,
  isOriginalCharacterValueImport,
  isOriginalSalO3tlImport,
} from "./check-module-boundaries.mjs";

it("admits the actual break-iterator headers without allowing general producer dependencies", /** Checks the exact native includes and outer browser composition ports. @returns Nothing. */ () => {
  const producer = "i18npool/source/breakiterator/breakiteratorImpl.ts";
  expect(isOriginalCharacterValueImport(producer, "o3tl/inc/string_view")).toBe(true);
  expect(isOriginalCharacterValueImport(producer, "offapi/com/sun/star/i18n/ScriptType")).toBe(
    true,
  );
  expect(isOriginalCharacterValueImport(producer, "o3tl/inc/unit_conversion")).toBe(false);
  expect(
    isOriginalCharacterValueImport("sc/browser/controller/calc-selection-script.ts", producer),
  ).toBe(true);
  expect(isOriginalCharacterValueImport("sc/browser/presentation/ScCellText.tsx", producer)).toBe(
    true,
  );
  expect(isOriginalCharacterValueImport("sc/source/core/data/documen6.ts", producer)).toBe(false);
  expect(isForbiddenModuleEdge("sc", "i18npool")).toBe(true);
  expect(isForbiddenModuleEdge("vcl", "editeng")).toBe(true);
});

it("admits exactly the original rtl surrogate helpers at the o3tl header boundary", /** Rejects neighboring files and additional SAL symbols. @returns Nothing. */ () => {
  const specifier = "../../sal/inc/rtl/character",
    source = "o3tl/inc/string_view.ts",
    target = "sal/inc/rtl/character.ts";
  const original = `import { isHighSurrogate, isLowSurrogate, combineSurrogates } from "${specifier}";`;
  expect(isOriginalSalO3tlImport(source, target, original, specifier)).toBe(true);
  expect(isOriginalSalO3tlImport("o3tl/inc/other.ts", target, original, specifier)).toBe(false);
  expect(
    isOriginalSalO3tlImport(
      source,
      target,
      original.replace("combineSurrogates", "isAscii"),
      specifier,
    ),
  ).toBe(false);
});

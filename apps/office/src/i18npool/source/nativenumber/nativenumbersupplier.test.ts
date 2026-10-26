/** @fileoverview Pinned LibreOffice NATNUM0 language gate and source table conversion. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { NativeNumberSupplierService } from "./nativenumbersupplier";

/** Calls the source wrapper with a real Locale value and releases all string owners.  @param value - Value. @param language - Language. @param country - Country. @returns The string result. */
function convert(value: string, language: string, country = ""): string {
  const input = unicode(value),
    lang = unicode(language),
    region = unicode(country),
    variant = unicode("");
  const locale = new Locale(lang, region, variant);
  try {
    const output = new NativeNumberWrapper().getNativeNumberString(input, locale, 0);
    try {
      return String.fromCharCode(...output.getStr().subarray(0, output.getLength()));
    } finally {
      output.dispose();
    }
  } finally {
    locale.dispose();
    variant.dispose();
    region.dispose();
    lang.dispose();
    input.dispose();
  }
}

it("keeps the upstream language gate even for fullwidth digits", /** Checks keeps the upstream language gate even for fullwidth digits. @returns Test completion or assertion result. */ () => {
  expect(convert("１２", "en", "US")).toBe("１２");
  expect(convert("１２", "ja", "JP")).toBe("12");
});

it("converts native digits, decimal, minus and CJK multipliers through the source tables", /** Checks converts native digits, decimal, minus and CJK multipliers through the source tables. @returns Test completion or assertion result. */ () => {
  expect(convert("١٢٣", "ar", "SA")).toBe("123");
  expect(convert("１２．３", "ja", "JP")).toBe("12.3");
  expect(convert("十", "zh", "CN")).toBe("10");
  expect(convert("二百三十", "zh", "CN")).toBe("230");
});

it("preserves the supplier's offset sequence for simple native digits", /** Checks preserves the supplier's offset sequence for simple native digits. @returns Test completion or assertion result. */ () => {
  const input = unicode("１２"),
    lang = unicode("ja"),
    region = unicode("JP"),
    variant = unicode("");
  const locale = new Locale(lang, region, variant),
    offsets: number[] = [];
  try {
    const output = new NativeNumberSupplierService().getNativeNumberString(
      input,
      locale,
      0,
      offsets,
    );
    try {
      expect(String.fromCharCode(...output.getStr().subarray(0, output.getLength()))).toBe("12");
      expect(offsets).toEqual([0, 1]);
    } finally {
      output.dispose();
    }
  } finally {
    locale.dispose();
    variant.dispose();
    region.dispose();
    lang.dispose();
    input.dispose();
  }
});

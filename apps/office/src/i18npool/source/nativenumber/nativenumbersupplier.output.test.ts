/** @fileoverview Source native-number mode, output/offset and mutable locale-cache contracts. Expected scalar helper rows were compiled unchanged by scripts/native-number-native-probe.py; this is not full native service/ABI certification. */
import { expect, it } from "vitest";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { NativeNumberSupplierService, type NativeNumberMode } from "./nativenumbersupplier";
/** Creates the actual value owner from source field strings. @param name - Language_country. @returns Owned locale. */
function locale(name: string): Locale {
  const [language, country] = name.split("_") as [string, string],
    l = unicode(language),
    c = unicode(country),
    v = unicode("");
  try {
    return new Locale(l, c, v);
  } finally {
    v.dispose();
    c.dispose();
    l.dispose();
  }
}
/** Calls the actual supplier and disposes its returned string. @param owner - Actual supplier. @param place - Actual locale. @param value - Source. @param mode - Source mode. @param offsets - Mutable output. @returns Plain assertion text. */
function output(
  owner: NativeNumberSupplierService,
  place: Locale,
  value: string,
  mode: NativeNumberMode,
  offsets?: number[],
): string {
  const input = unicode(value);
  try {
    const result = owner.getNativeNumberString(input, place, mode, offsets);
    try {
      return text(result);
    } finally {
      result.dispose();
    }
  } finally {
    input.dispose();
  }
}
const nativeCases: [string, NativeNumberMode, string, string, number[]][] = [
  ["zh_CN", 1, "1001", "一〇〇一", [0, 1, 2, 3]],
  ["zh_CN", 2, "1001", "壹零零壹", [0, 1, 2, 3]],
  ["zh_CN", 3, "1001", "１００１", [0, 1, 2, 3]],
  ["zh_CN", 4, "1001", "一千〇一", [0, 0, 1, 3]],
  ["zh_CN", 5, "1001", "壹仟零壹", [0, 0, 1, 3]],
  ["zh_CN", 6, "1001", "１千０１", [0, 0, 1, 3]],
  ["zh_CN", 7, "1001", "千一", [0, 3]],
  ["zh_CN", 8, "1001", "仟壹", [0, 3]],
  ["zh_TW", 1, "1001", "一〇〇一", [0, 1, 2, 3]],
  ["zh_TW", 2, "1001", "壹零零壹", [0, 1, 2, 3]],
  ["zh_TW", 3, "1001", "１００１", [0, 1, 2, 3]],
  ["zh_TW", 4, "1001", "一千〇一", [0, 0, 1, 3]],
  ["zh_TW", 5, "1001", "壹仟零壹", [0, 0, 1, 3]],
  ["zh_TW", 6, "1001", "１千０１", [0, 0, 1, 3]],
  ["zh_TW", 7, "1001", "千一", [0, 3]],
  ["zh_TW", 8, "1001", "仟壹", [0, 3]],
  ["ja_JP", 1, "1001", "一〇〇一", [0, 1, 2, 3]],
  ["ja_JP", 2, "1001", "壱零零壱", [0, 1, 2, 3]],
  ["ja_JP", 3, "1001", "１００１", [0, 1, 2, 3]],
  ["ja_JP", 4, "1001", "一千一", [0, 0, 3]],
  ["ja_JP", 5, "1001", "壱阡壱", [0, 0, 3]],
  ["ja_JP", 6, "1001", "１千１", [0, 0, 3]],
  ["ja_JP", 7, "1001", "一〇〇一", [0, 1, 2, 3]],
  ["ja_JP", 8, "1001", "壱零零壱", [0, 1, 2, 3]],
  ["ko_KR", 1, "1001", "一零零一", [0, 1, 2, 3]],
  ["ko_KR", 2, "1001", "壹零零壹", [0, 1, 2, 3]],
  ["ko_KR", 3, "1001", "１００１", [0, 1, 2, 3]],
  ["ko_KR", 4, "1001", "一千一", [0, 0, 3]],
  ["ko_KR", 5, "1001", "壹阡零壹", [0, 0, 1, 3]],
  ["ko_KR", 6, "1001", "１천１", [0, 0, 3]],
  ["ko_KR", 7, "1001", "千一", [0, 3]],
  ["ko_KR", 8, "1001", "阡壹", [0, 3]],
  ["ko_KR", 9, "1001", "일영영일", [0, 1, 2, 3]],
  ["ko_KR", 10, "1001", "일천일", [0, 0, 3]],
  ["ko_KR", 11, "1001", "천일", [0, 3]],
  ["he_IL", 1, "1001", "א א", [-77]],
  ["he_IL", 2, "1001", "א׳ א׳", [-77]],
  ["he_IL", 3, "1001", "１００１", [0, 1, 2, 3]],
  ["zh_CN", 2, "12,345.67", "壹贰、叁肆伍点陆柒", [0, 1, 2, 3, 4, 5, 6, 7, 8]],
  ["zh_CN", 4, "12,345.67", "一万二千三百四十五．六七", [1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8]],
  ["zh_CN", 7, "12,345.67", "万二千三百四十五．六七", [1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8]],
  ["ja_JP", 2, "12,345.67", "壱弐、参四伍・六七", [0, 1, 2, 3, 4, 5, 6, 7, 8]],
  ["ja_JP", 4, "12,345.67", "一万二千三百四十五・六七", [1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8]],
  ["ja_JP", 7, "12,345.67", "一万二三四五・六七", [1, 2, 2, 3, 4, 5, 6, 7, 8]],
  ["ko_KR", 2, "12,345.67", "壹貳,參四伍點六七", [0, 1, 2, 3, 4, 5, 6, 7, 8]],
  ["ko_KR", 4, "12,345.67", "一万二千三百四十五．六七", [1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8]],
  ["ko_KR", 7, "12,345.67", "万二千三百四十五．六七", [1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8]],
  ["ko_KR", 10, "12,345.67", "일만이천삼백사십오점육칠", [1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8]],
  ["ko_KR", 11, "12,345.67", "만이천삼백사십오점육칠", [1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8]],
  ["he_IL", 2, "12,345.67", "י״ב שמ״ה.67", [-77]],
];
it.each(nativeCases)(
  "preserves original %s mode%d conversion of %s",
  /** Real supplier tables and producers, including source grouped offsets and unchanged Hebrew offsets. @param name - Locale. @param mode - Native mode. @param input - Source. @param expected - Compiled native result. @param expectedOffsets - Native offsets. @returns Nothing. */ (
    name,
    mode,
    input,
    expected,
    expectedOffsets,
  ) => {
    const place = locale(name),
      owner = new NativeNumberSupplierService(),
      offsets = [-77];
    try {
      expect(output(owner, place, input, mode, offsets)).toBe(expected);
      expect(offsets).toEqual(expectedOffsets);
    } finally {
      owner.dispose();
      place.dispose();
    }
  },
);
it.each(["en_US", "ja_JP", "zh_CN", "he_IL", "ar_SA", "ko_KR", "cu_RU"])(
  "retains original validity and identity gates for %s",
  /** Source validity is independent of unknown-language conversion. @param name - Actual queried locale. @returns Nothing. */ (
    name,
  ) => {
    const place = locale(name),
      owner = new NativeNumberSupplierService();
    try {
      const cjk = ["ja_JP", "zh_CN", "ko_KR"].includes(name),
        known = name !== "en_US";
      for (let mode = -1; mode <= 13; mode++) {
        const expected =
          mode === 0 ||
          mode === 3 ||
          mode === 12 ||
          (mode === 1 && known) ||
          (mode === 2 && (cjk || name === "he_IL")) ||
          (mode >= 4 && mode <= 8 && cjk) ||
          (mode >= 9 && mode <= 11 && name === "ko_KR");
        expect(NativeNumberSupplierService.isValidNatNumImpl(place, mode), String(mode)).toBe(
          expected,
        );
        if (mode >= 0 && mode <= 11 && (!expected || !known)) {
          const offsets = [73];
          expect(output(owner, place, "12", mode as NativeNumberMode, offsets)).toBe("12");
          expect(offsets).toEqual([73]);
        }
      }
    } finally {
      owner.dispose();
      place.dispose();
    }
  },
);
it("preserves shared punctuation changes while an earlier supplier locale cache still matches", /** CALC-407: one service instance changes source static arrays while another instance retains its own locale identity. @returns Nothing. */ () => {
  const a = new NativeNumberSupplierService(),
    b = new NativeNumberSupplierService(),
    ja = locale("ja_JP"),
    fa = locale("fa_IR");
  try {
    expect(output(a, ja, "1.2", 3)).toBe("１．２");
    expect(output(b, fa, "1٫2", 1)).toBe("۱٫۲");
    expect(output(a, ja, "1.2", 3)).toBe("１.２");
    expect(output(a, ja, "１．２", 0)).toBe("1٫2");
  } finally {
    const restore = new NativeNumberSupplierService();
    try {
      output(restore, ja, "0", 3);
    } finally {
      restore.dispose();
    }
    b.dispose();
    a.dispose();
    fa.dispose();
    ja.dispose();
  }
});
it.each([
  ["he_IL", 1, "15", "טו"],
  ["he_IL", 2, "16", "ט״ז"],
  ["he_IL", 2, "--15suffix", "ט״וsuffix"],
  ["he_IL", 2, "0", "0"],
  ["he_IL", 2, "1000", "אלף"],
  ["he_IL", 2, "12345678901234567890", "12345678901234567890"],
  ["cu_RU", 1, "15", "є҃і"],
  ["cu_RU", 1, "10000000", "10000000"],
] as const)(
  "keeps %s alphabetic mode%d prefix/suffix and count limits for %s",
  /** Real alphabetic numeral producer, with offsets deliberately untouched. @param name - Locale. @param mode - Original mode. @param input - Source. @param expected - Original output. @returns Nothing. */ (
    name,
    mode,
    input,
    expected,
  ) => {
    const place = locale(name),
      owner = new NativeNumberSupplierService(),
      offsets = [91];
    try {
      expect(output(owner, place, input, mode, offsets)).toBe(expected);
      expect(offsets).toEqual([91]);
    } finally {
      owner.dispose();
      place.dispose();
    }
  },
);

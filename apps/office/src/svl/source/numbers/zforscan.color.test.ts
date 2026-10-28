/** @fileoverview Native color prefixes and real formatter callbacks, including cross-owner subformat copy. */
import { expect, it } from "vitest";
import { Color } from "../../../tools/inc/color";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumberFormatter } from "./zforlist";
import { ImpSvNumberformatScan, KeywordLocalization as M } from "./zforscan";
import { SvNumberformat } from "./zformat";
it.each([
  [0x0409, M.AllowEnglish, "red", "RED", 0xff0000],
  [0x0407, M.AllowEnglish, "red", "ROT", 0xff0000],
  [0x0407, M.AllowEnglish, "rOt", "ROT", 0xff0000],
  [0x0407, M.LocaleLegacy, "RED", "RED", null],
  [0x0407, M.EnglishOnly, "ROT", "ROT", null],
  [0x0407, M.EnglishOnly, "red", "RED", 0xff0000],
  [0x0407, M.LocaleLegacy, "grün", "GRÜN", 0x00ff00],
  [0x0409, M.AllowEnglish, "BLUE", "BLUE", 0x0000ff],
  [0x0409, M.AllowEnglish, "BROWN", "BROWN", 0x808000],
] as const)(
  "uses original color-name policy %i/%i/%s",
  /** Checks actual palette pointer and normalized prefix. @param language - Locale. @param mode - Keyword policy. @param source - Prefix. @param expected - Rewritten prefix. @param rgb - Native color or null. @returns Nothing. */ (
    language,
    mode,
    source,
    expected,
    rgb,
  ) => {
    const formatter = new SvNumberFormatter(language),
      scanner = formatter["m_aCurrentLanguage"].GetFormatScanner(),
      name = unicode(source);
    try {
      scanner.ChangeIntl(mode);
      const color = scanner.GetColor(name);
      expect(color?.toUInt32() ?? null).toBe(rgb);
      expect(text(name)).toBe(expected);
      if (rgb === 0xff0000) expect(color).toBe(ImpSvNumberformatScan.GetRedColor());
    } finally {
      name.dispose();
      formatter.dispose();
    }
  },
);
it("calls only the native valid one-based custom color indices and retains source spelling", /** Invalid words/digits do not manufacture a color or invoke the callback. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x0409),
    scanner = formatter["m_aCurrentLanguage"].GetFormatScanner(),
    calls: number[] = [],
    color = new Color(0x123456);
  try {
    expect(formatter.GetUserDefColor(0)).toBeNull();
    formatter.SetColorLink(
      /** Actual user callback with a borrowed color result. @param index - Zero-based source index. @returns Borrowed color. */ (
        index,
      ) => {
        calls.push(index);
        return color;
      },
    );
    for (const [source, expected, valid, index] of [
      ["color 1 ", "COLOR1", true, 0],
      ["COLOR01", "COLOR01", true, 0],
      ["COLOR64", "COLOR64", true, 63],
      ["COLOR0", "COLOR0", false, -1],
      ["COLOR65", "COLOR65", false, -1],
      ["COLOR+1", "COLOR+1", false, -1],
      ["COLOR2147483648", "COLOR2147483648", false, -1],
      ["COLOR\u00a01", "COLOR\u00a01", false, -1],
    ] as const) {
      const name = unicode(source),
        before = calls.length;
      try {
        expect(scanner.GetColor(name)).toBe(valid ? color : null);
        expect(text(name)).toBe(expected);
        expect(calls.length).toBe(before + Number(valid));
        if (valid) expect(calls[calls.length - 1]).toBe(index);
      } finally {
        name.dispose();
      }
    }
    formatter.SetColorLink(null);
    expect(formatter.GetUserDefColor(0)).toBeNull();
  } finally {
    formatter.dispose();
  }
});
it.each([
  [0x0409, 0x0407, "RED", "ROT"],
  [0x0407, 0x0409, "ROT", "RED"],
  [0x0409, 0x0407, "COLOR 7", "FARBE7"],
  [0x0407, 0x0409, "FARBE 7", "COLOR7"],
] as const)(
  "converts only original German/English color names %i to %i",
  /** Uses the existing conversion mode and original callback owner. @param from - Source language. @param to - Destination language. @param source - Prefix. @param expected - Converted prefix. @returns Nothing. */ (
    from,
    to,
    source,
    expected,
  ) => {
    const formatter = new SvNumberFormatter(from),
      scanner = formatter["m_aCurrentLanguage"].GetFormatScanner(),
      name = unicode(source);
    try {
      scanner.SetConvertMode(from, to, false, false);
      scanner.GetColor(name);
      expect(text(name)).toBe(expected);
    } finally {
      name.dispose();
      formatter.dispose();
    }
  },
);
it("rebinds callback-owned colors when copying a compiled entry to another actual scanner", /** Native copying must not retain a foreign document color pointer. @returns Nothing. */ () => {
  const source = new SvNumberFormatter(0x0409),
    destination = new SvNumberFormatter(0x0407),
    first = new Color(0x123456),
    second = new Color(0x654321),
    sourceScanner = source["m_aCurrentLanguage"].GetFormatScanner(),
    targetScanner = destination["m_aCurrentLanguage"].GetFormatScanner(),
    code = unicode("General"),
    name = unicode("COLOR7"),
    check: [number] = [0];
  try {
    source.SetColorLink(/** Borrows the source color. @returns Source pointer. */ () => first);
    destination.SetColorLink(
      /** Borrows the destination color. @returns Destination pointer. */ () => second,
    );
    const compiled = new SvNumberformat(
      code,
      sourceScanner,
      sourceScanner.GetCurrentLanguageData().pStringScanner,
      sourceScanner.getColorCallback().GetNatNum(),
      check,
      [0x0409],
    );
    try {
      compiled["NumFor"][0]?.SetColor(first, name);
      let sourceCalls = 0;
      source.SetColorLink(
        /** Counts observable source callback invocations. @returns Borrowed source color. */ () => {
          ++sourceCalls;
          return first;
        },
      );
      const sameScannerCopy = new SvNumberformat(compiled);
      try {
        expect(sameScannerCopy["NumFor"][0]?.GetColor()).toBe(first);
        expect(sourceCalls).toBe(0);
      } finally {
        sameScannerCopy.dispose();
      }

      const copy = new SvNumberformat(compiled, targetScanner);
      try {
        const copySection = copy["NumFor"][0],
          sourceSection = compiled["NumFor"][0];
        if (!copySection || !sourceSection) throw new Error("Native subformat owner is missing");
        expect(copySection.GetColor()).toBe(second);
        expect(sourceSection.GetColor()).toBe(first);
        expect(text(copySection.GetColorName())).toBe("FARBE7");
        expect(text(sourceSection.GetColorName())).toBe("COLOR7");
      } finally {
        copy.dispose();
      }
    } finally {
      compiled.dispose();
    }
  } finally {
    name.dispose();
    code.dispose();
    destination.dispose();
    source.dispose();
  }
});

/** @fileoverview Native locale-prefix metadata and calendar insertion through actual compiled-format owners. */
import { expect, it } from "vitest";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { SvNumberFormatter } from "./zforlist";
import { SvNumberformat } from "./zformat";
import { LocaleType, ImpGetLocaleType } from "./zformat.locale";
import { ImpObtainCalendarAndNumerals } from "./zformat.locale-calendar";
it("retains the source eight-digit parser closing-bracket boundary and disabled extended-code serialization", /** The source cursor rule intentionally differs when the ninth closing bracket is present. @returns Nothing. */ () => {
  for (const [source, language, position] of [
    ["10010409", 0x409, 8],
    ["10010409]", 0x3ff, 8],
    ["1001040]", 0x1040, 7],
  ] as const) {
    const input = unicode(source),
      offset: [number] = [0];
    try {
      const locale = ImpGetLocaleType(input.subView(0), offset),
        code = locale.generateCode();
      try {
        expect(locale.meLanguage).toBe(language);
        expect(offset[0]).toBe(position);
        expect(text(code)).toBe(language === 0x409 ? "409" : language === 0x1040 ? "1040" : "3FF");
      } finally {
        code.dispose();
      }
    } finally {
      input.dispose();
    }
  }
});
it("retains the original Eastern-Arabic locale predicate while inserting the actual modifier", /** Source uses != for the temporary Punjabi-Arabic language disjunct. @returns Nothing. */ () => {
  const locale = new LocaleType(),
    temporary = new LocaleType(0x02000409),
    language: [number] = [0x409],
    code = unicode("0"),
    buffer = new OUStringBuffer(code);
  locale.meLanguage = 0x409;
  try {
    const calendar = ImpObtainCalendarAndNumerals(locale, buffer, 0, language, temporary);
    try {
      expect(locale.meLanguage).toBe(0x409);
      expect(language[0]).toBe(0x409);
      expect(text(calendar)).toBe("");
      const output = buffer.toString();
      try {
        expect(text(output)).toBe("[NatNum1]0");
      } finally {
        output.dispose();
      }
    } finally {
      calendar.dispose();
    }
  } finally {
    buffer.dispose();
    code.dispose();
  }
});
it("copies the actual locale metadata and requires SYSTEM for system-format substitution after calendar selection", /** Uses a source-reachable extended system-time prefix whose calendar selects Japanese. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    scanner = formatter["m_aCurrentLanguage"].GetFormatScanner(),
    code = unicode("General"),
    check: [number] = [0],
    compiled = new SvNumberformat(
      code,
      scanner,
      scanner.GetCurrentLanguageData().pStringScanner,
      scanner.getColorCallback().GetNatNum(),
      check,
      [0x409],
    );
  try {
    compiled["maLocale"].assign(new LocaleType(0xf400));
    expect([
      compiled.IsSubstituted(),
      compiled.IsSystemTimeFormat(),
      compiled.IsSystemLongDateFormat(),
    ]).toEqual([true, true, false]);
    const buffer = new OUStringBuffer(code),
      language: [number] = [0];
    try {
      const calendar = ImpObtainCalendarAndNumerals(
        compiled["maLocale"],
        buffer,
        0,
        language,
        new LocaleType(0x0003f400),
      );
      try {
        expect(language[0]).toBe(0x411);
        expect(compiled.GetLanguage()).toBe(0x411);
        expect(compiled.IsSystemTimeFormat()).toBe(false);
      } finally {
        calendar.dispose();
      }
    } finally {
      buffer.dispose();
    }
    const copy = new SvNumberformat(compiled);
    try {
      expect(copy.GetLanguage()).toBe(0x411);
      expect(copy.IsSubstituted()).toBe(true);
      expect(copy.IsSystemTimeFormat()).toBe(false);
      expect(copy["maLocale"]).not.toBe(compiled["maLocale"]);
    } finally {
      copy.dispose();
    }
  } finally {
    compiled.dispose();
    code.dispose();
    formatter.dispose();
  }
});
it("borrows a real lazy native-number provider and source installed-locale state from the formatter", /** Original locale installation is distinct from runtime SYSTEM resolution. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x411),
    input = unicode("１２");
  try {
    const provider = formatter.GetNatNum();
    expect(formatter.GetNatNum()).toBe(provider);
    const output = provider.getNativeNumberString(
      input,
      formatter.GetLocaleData().getMyLocale(),
      0,
    );
    try {
      expect(text(output)).toBe("12");
    } finally {
      output.dispose();
    }
    expect(SvNumberFormatter.IsLocaleInstalled(0x409)).toBe(true);
    expect(SvNumberFormatter.IsLocaleInstalled(0)).toBe(false);
    expect(SvNumberFormatter.IsLocaleInstalled(0x9999)).toBe(false);
  } finally {
    input.dispose();
    formatter.dispose();
  }
});

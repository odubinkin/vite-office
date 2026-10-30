/** @fileoverview Original shared section, literal, text-color and star/blank output contracts through actual compiled formatter entries. */
import { expect, it } from "vitest";
import { SvNumberFormatter } from "./zforlist";
import { SvNumberformat } from "./zformat";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { Color } from "../../../tools/inc/color";
/** Compiles a real format through the original mutable table insertion API. @param formatter - Actual owner. @param pattern - Format code. @returns Existing or inserted native key. */
function insert(formatter: SvNumberFormatter, pattern: string): number {
  const code = unicode(pattern),
    check: [number] = [0],
    type: [number] = [0],
    key: [number] = [0];
  try {
    formatter["m_aFormatData"].PutEntry(
      formatter["m_aCurrentLanguage"],
      formatter.GetNatNum(),
      code,
      check,
      type,
      key,
      0x409,
    );
    expect(check[0]).toBe(0);
    return key[0];
  } finally {
    code.dispose();
  }
}
it.each([
  ["0;0;0", -4, 1, "4"],
  ["0;0;0", 0, 2, "0"],
  ["0;0;0", 4, 0, "4"],
  ["[<0]0;0", -4, 0, "4"],
  ["[<-2]0;0", -4, 0, "-4"],
  ["[>2]0;0", -4, 1, "4"],
  ['0;"negative";"zero"', -4, 1, "negative"],
  ['0;"negative";"zero"', 0, 2, "zero"],
  ['[>2]"large";[<0]"negative";"other"', 4, 0, "large"],
  ['[>2]"large";[<0]"negative";"other"', -4, 1, "negative"],
  ['[>2]"large";[<0]"negative";"other"', 0, 2, "other"],
  ['[>2]"large";[<0]"negative";"other"', NaN, 2, "other"],
  ['[>2]"large";[<0]"negative";"other"', Infinity, 0, "large"],
  [";;;@", 123, 0, ""],
])(
  "selects source numeric section in %s for %s",
  /** Actual conditions choose both literal and digit-only sections without synthetic token injection. @param pattern - Original code. @param value - Number. @param section - Source-selected section. @param expected - Native output. @returns Nothing. */ (
    pattern,
    value,
    section,
    expected,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      output = new OUString(),
      color: [Color | null] = [null];
    try {
      const key = insert(formatter, pattern),
        entry = formatter.GetEntry(key) as SvNumberformat;
      expect(entry.GetSubformatIndex(value)).toBe(section);
      formatter.GetOutputString(value, key, output, color);
      expect(text(output)).toBe(expected);
      expect(color[0]).toBe(entry["NumFor"][section]?.GetColor());
    } finally {
      output.dispose();
      formatter.dispose();
    }
  },
);
it.each([
  ["[RED]@", false, "value", 0],
  ['0;0;0;[RED]"t:"@', false, "t:value", 3],
  ["_M@", false, "   value", 0],
  ["@_i", false, "value ", 0],
  ["_界@", false, "  value", 0],
  ["*x@", false, "value", 0],
  ["*x@", true, "\u001bxvalue", 0],
  ["@*x", true, "value\u001bx", 0],
])(
  "expands original text tokens in %s with star flag %s",
  /** Public engine preserves the text overload, original color and actual scanner token stream. @param pattern - Format. @param star - Fill flag. @param expected - Output. @param section - Actual text section. @returns Nothing. */ (
    pattern,
    star,
    expected,
    section,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      input = unicode("value"),
      output = new OUString(),
      color: [Color | null] = [null];
    try {
      const key = insert(formatter, pattern),
        entry = formatter.GetEntry(key) as SvNumberformat;
      formatter.GetOutputString(input, key, output, color, star);
      expect(text(output)).toBe(expected);
      expect(color[0]).toBe(entry["NumFor"][section]?.GetColor());
    } finally {
      input.dispose();
      output.dispose();
      formatter.dispose();
    }
  },
);
it("retains original blank-character widths and numeric literal star return", /** Static source width table and literal output return run over real native strings. @returns Nothing. */ () => {
  const buffer = new OUStringBuffer(),
    formatter = new SvNumberFormatter(0x409),
    output = new OUString(),
    color: [Color | null] = [null];
  try {
    expect(SvNumberformat.InsertBlanks(buffer, 0, 31)).toBe(0);
    expect(SvNumberformat.InsertBlanks(buffer, 0, 77)).toBe(3);
    expect(SvNumberformat.InsertBlanks(buffer, 3, 30028)).toBe(5);
    const key = insert(formatter, '"x"*y'),
      entry = formatter.GetEntry(key) as SvNumberformat,
      current = formatter["m_aCurrentLanguage"];
    expect(
      entry.GetOutputString(
        1,
        output,
        color,
        current.GetStandardPrec(),
        46,
        current.GetFormatScanner(),
        true,
      ),
    ).toBe(true);
    expect(text(output)).toBe("x\u001by");
    formatter.GetOutputString(1, key, output, color, false);
    expect(text(output)).toBe("x");
  } finally {
    buffer.dispose();
    output.dispose();
    formatter.dispose();
  }
});

it("keeps the original numeric Text branch and actual #FMT input-line fallback", /** Actual literal producer exercises error-text fallback without replacing a formatter method or injecting compiled tokens. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    output = new OUString(),
    color: [Color | null] = [null];
  try {
    const textKey = insert(formatter, "[RED]@");
    formatter.GetOutputString(0.125, textKey, output, color);
    expect(text(output)).toBe("0.13");
    expect(color[0]).toBeNull();
    const errorKey = insert(formatter, '"#FMT"');
    formatter.GetOutputString(1.23456789, errorKey, output, color);
    expect(text(output)).toBe("#FMT");
    const input = formatter.GetInputLineString(1.23456789, errorKey, true);
    try {
      expect(text(input)).toBe("1.23456789");
    } finally {
      input.dispose();
    }
    expect(formatter.GetStandardPrec()).toBe(2);
  } finally {
    output.dispose();
    formatter.dispose();
  }
});

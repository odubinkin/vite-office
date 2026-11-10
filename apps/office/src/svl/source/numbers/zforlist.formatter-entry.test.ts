/** @fileoverview Public native formatter insertion/conversion retains actual parsed entries, keys, locale scanners and Boolean fallback without private-field injection. */
import { assert, expect, it } from "vitest";
import { SvNumberFormatter } from "./zforlist";
import { SvNumberFormatter as SplitOwner } from "./zforlist.formatter";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumFormatType as T } from "../../inc/zforlist";
import { LANGUAGE_DONTKNOW } from "../../../i18nlangtag/inc/lang";
it("retains the same canonical formatter class identity and original insertion/duplicate results", /** Public wrappers must consume the actual native table rather than a second format registry. @returns Nothing. */ () => {
  expect(SvNumberFormatter).toBe(SplitOwner);
  const formatter = new SvNumberFormatter(0x409),
    code = unicode('0.00000" html44"'),
    output = unicode(""),
    check: [number] = [0],
    type: [number] = [0],
    key: [number] = [999999];
  try {
    expect(formatter.PutEntry(code, check, type, key)).toBe(true);
    expect(check[0]).toBe(0);
    expect(type[0]).toBe(T.NUMBER);
    expect(formatter.GetType(key[0])).toBe(T.NUMBER);
    const parsed = formatter.GetEntry(key[0]);
    assert(parsed);
    expect(text(parsed.GetFormatstring())).toBe(text(code));
    const original = key[0],
      entry = formatter.GetEntry(original);
    expect(formatter.PutEntry(code, check, type, key)).toBe(false);
    expect(key[0]).toBe(original);
    expect(formatter.GetEntry(key[0])).toBe(entry);
    formatter.GetOutputString(1.25, key[0], output, [null]);
    expect(text(output)).toBe("1.25000 html44");
  } finally {
    output.dispose();
    code.dispose();
    formatter.dispose();
  }
});
it("retains empty-code error position and original key reset without inventing a format", /** Native PutEntry leaves the caller category unchanged on the source early error. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    code = unicode(""),
    check: [number] = [77],
    type: [number] = [T.SCIENTIFIC],
    key: [number] = [900];
  try {
    expect(formatter.PutEntry(code, check, type, key)).toBe(false);
    expect([check[0], type[0], key[0]]).toEqual([1, T.SCIENTIFIC, 0]);
  } finally {
    code.dispose();
    formatter.dispose();
  }
});
it.each([
  [0x409, 0x407, "0.00", "0,00"],
  [0x407, 0x409, "#.##0,00", "#,##0.00"],
  [0x409, 0x407, "MM/DD/YYYY", "TT.MM.JJJJ"],
  [0x407, 0x409, "TT.MM.JJJJ", "MM/DD/YYYY"],
  [0x409, 0x411, "MM/DD/YYYY", "YYYY/MM/DD"],
  [0x409, LANGUAGE_DONTKNOW, "MM/DD/YYYY", "TT.MM.JJJJ"],
  [0x10409, 0x10407, "0.00", "0,00"],
] as const)(
  "converts actual parsed code %s/%s/%s to %s",
  /** Original public conversion must preserve actual scanner transformations and target-language entry identity. @param source - Source locale. @param target - Destination locale or initial-language sentinel. @param input - Actual format code. @param expected - Pinned scanner result. @returns Nothing. */ (
    source,
    target,
    input,
    expected,
  ) => {
    const formatter = new SvNumberFormatter(0x407),
      code = unicode(input),
      check: [number] = [0],
      type: [number] = [0],
      key: [number] = [0];
    try {
      formatter.PutandConvertEntry(code, check, type, key, source, target, true);
      expect(check[0]).toBe(0);
      expect(text(code)).toBe(expected);
      expect(formatter.GetEntry(key[0])?.GetLanguage()).toBe(
        (target & 65535) === LANGUAGE_DONTKNOW ? 0x407 : target & 65535,
      );
      const parsed = formatter.GetEntry(key[0]);
      assert(parsed);
      expect(text(parsed.GetFormatstring())).toBe(expected);
      const laterCode = (source & 65535) === 0x407 ? '0,000000" after"' : '0.000000" after"';
      const later = unicode(laterCode);
      try {
        expect(formatter.PutEntry(later, check, type, key, source)).toBe(true);
        expect(text(later)).toBe(laterCode);
        expect(formatter.GetEntry(key[0])?.GetLanguage()).toBe(source & 65535);
      } finally {
        later.dispose();
      }
    } finally {
      code.dispose();
      formatter.dispose();
    }
  },
);
it.each([true, false])(
  "retains source Boolean conversion policy %s",
  /** Boolean target retry must remain source-controlled, with original success/duplicate semantics. @param replace - Source replacement flag. @returns Nothing. */ (
    replace,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      code = unicode('"WAHR";"WAHR";"FALSCH"'),
      check: [number] = [0],
      type: [number] = [0],
      key: [number] = [0];
    try {
      formatter.PutandConvertEntry(code, check, type, key, 0x409, 0x407, true, replace);
      expect(check[0]).toBe(0);
      expect(type[0]).toBe(replace ? T.LOGICAL : T.DEFINED);
      expect(formatter.GetType(key[0])).toBe(replace ? T.LOGICAL : T.DEFINED);
      expect(text(code)).toBe(replace ? "LOGISCH" : '"WAHR";"WAHR";"FALSCH"');
    } finally {
      code.dispose();
      formatter.dispose();
    }
  },
);

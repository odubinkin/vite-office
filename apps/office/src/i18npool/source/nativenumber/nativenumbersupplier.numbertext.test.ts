/** @fileoverview Original NatNum12 prefix/separator/cache group integrated with the real NumberText component and installed official interpreter. */
import { expect, it, vi } from "vitest";
import { getNumberText, type NumberTextFactory } from "./nativenumbersupplier.numbertext";
import { NumberText_Impl } from "../../../lingucomponent/source/numbertext/numbertext";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
let created = 0;
const createNumberText: NumberTextFactory =
  /** Actual component constructor at the source process-context binding boundary; no fake service or output is supplied. @returns Acquired component. */ () => {
    created++;
    return new Reference(new NumberText_Impl());
  };
/** Executes the production member group using actual source value owners. @param value - Complete input. @param params - Original modifier view. @param language - Original language. @returns Output text. */
function convert(value: string, params = "", language = "en"): string {
  const input = unicode(value),
    modifiers = unicode(params),
    code = unicode(language),
    locale = new Locale();
  locale.Language.assign(code);
  try {
    const output = getNumberText(locale, input, modifiers, createNumberText);
    try {
      return text(output);
    } finally {
      output.dispose();
    }
  } finally {
    input.dispose();
    modifiers.dispose();
    code.dispose();
    locale.dispose();
  }
}

it.each([
  ["1,0tail", "", "en", "tentail"],
  ["1.0tail", "", "de", "zehntail"],
  ["2 kg", "", "en", "two kg"],
  ["21x", "ordinal", "en", "twenty-firstx"],
  ["5", "cardinal", "en", "five"],
  ["1x", "unknown-prefix", "en", "1x"],
  ["January", "", "en", "January"],
  ["-January", "", "en", "-JanuaryJanuary"],
  ["123", "", "qaa", "123"],
])(
  "scans %s with %s in %s",
  /** Checks original count, locale separator, no-match and suffix branches against actual library calls. @param value - Input. @param params - Original modifiers. @param language - Original locale. @param expected - Preserved source outcome. @returns Nothing. */ (
    value,
    params,
    language,
    expected,
  ) => {
    expect(convert(value, params, language)).toBe(expected);
  },
);

it("shares the original cardinal cache before independently attaching each suffix", /** Observes real service calls without replacing conversion behavior. @returns Nothing. */ () => {
  const service = vi.spyOn(NumberText_Impl.prototype, "getNumberText");
  try {
    const first = convert("872519first", "cardinal");
    const second = convert("872519second");
    expect(first.endsWith("first")).toBe(true);
    expect(second).toBe(first.slice(0, -5) + "second");
    expect(service).toHaveBeenCalledTimes(1);
    convert("872519third", "ordinal");
    expect(service).toHaveBeenCalledTimes(2);
    expect(created).toBe(1);
  } finally {
    service.mockRestore();
  }
});

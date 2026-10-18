/** @fileoverview Original character-class uppercase QA and valid range/exception behavior, including explicit native-JS non-equivalence witnesses. */
import { afterEach, expect, it, vi } from "vitest";
import cases from "./native-uppercase-cases.json" with { type: "json" };
import { uppercase } from "../../inc/charclass";
import * as classification from "../../../i18npool/source/characterclassification/cclass_unicode";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";

/** Creates the actual native Unicode value. @param text - UTF16 input. @returns Shared value. */
function unicode(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Creates original prepared Locale fields without a language service facade. @param language - Language. @returns Locale. */
function locale(language: string): Locale {
  return new Locale(unicode(language), new OUString(), new OUString());
}
/** Reads the logical native value. @param value - Value. @returns Text. */
function text(value: OUString): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
afterEach(/** Restores test-only module spies. @returns Nothing. */ () => vi.restoreAllMocks());

it.each(cases.nativeUppercaseCases)(
  "ports uppercase assertion from %s",
  /** Retains source expected upper strings and actual prepared Locale inputs. @param _fixture - Native QA. @param language - Language. @param source - Input. @param want - Original assertion. @returns Nothing. */ (
    _fixture,
    language,
    source,
    want,
  ) => {
    expect(text(uppercase(unicode(source as string), locale(language as string)))).toBe(want);
  },
);

it.each(cases.nativeJsWitnesses)(
  "retains confirmed whole-string JS mismatch for %s %s",
  /** Checks both the source-backed output and the observed native-JS mismatch; JS is not used as the reference oracle. @param language - Locale. @param source - Input. @param want - Source output. @param js - Observed JS. @returns Nothing. */ (
    language,
    source,
    want,
    js,
  ) => {
    expect(text(uppercase(unicode(source as string), locale(language as string)))).toBe(want);
    expect((source as string).toLocaleUpperCase(language as string)).toBe(js);
    expect(js).not.toBe(want);
  },
);

it("preserves valid range/end/clamp/nul and surrogate boundaries without changing source", /** Exercises full wrapper and the actual classifier/loop owners. @returns Nothing. */ () => {
  const l = locale("en"),
    source = unicode("xßﬃy"),
    identity = source.pData;
  expect(text(uppercase(source, l, 1, 2))).toBe("ẞFFI");
  expect(text(uppercase(source, l, 1, 99))).toBe("ẞFFIY");
  expect(text(uppercase(source, l, 0, 0))).toBe("");
  expect(text(uppercase(source, l, 4, 0))).toBe("");
  expect(text(uppercase(source, l, 9, 1))).toBe("");
  expect(text(uppercase(new OUString(), l))).toBe("");
  expect(text(uppercase(unicode("a\0ßz"), l))).toBe("A\0ẞZ");
  const pair = unicode("𐐨");
  expect(text(uppercase(pair, l, 0, 1))).toBe("\ud801");
  expect(text(uppercase(pair, l, 1, 1))).toBe("\udc28");
  expect(text(uppercase(unicode("x𐐨y"), l, 1, 2))).toBe("𐐀");
  expect(text(source)).toBe("xßﬃy");
  expect(source.pData).toBe(identity);
  expect(text(uppercase(unicode("ßﬃ".repeat(1025)), l))).toBe("ẞFFI".repeat(1025));
});

it("matches native JS over all ASCII units in the tested prepared locales", /** Confirms the reusable native-JS scalar path where behavior agrees without assuming full-string equivalence. @returns Nothing. */ () => {
  const source = String.fromCharCode(
    ...Array.from(
      { length: 128 },
      /** Produces every ASCII unit. @param _value - Placeholder. @param index - Unit. @returns Unit. */ (
        _value,
        index,
      ) => index,
    ),
  );
  for (const language of ["en", "tr", "az", "lt", "el"])
    expect(text(uppercase(unicode(source), locale(language)))).toBe(
      source.toLocaleUpperCase(language),
    );
});

it("catches only actual UNO exceptions and returns the original selected range", /** Uses the real exception class and real module boundary rather than a production provider stub. @returns Nothing. */ () => {
  const native = new RuntimeException(),
    spy = vi.spyOn(classification, "toUpper").mockImplementation(
      /** Simulates the declared UNO failure at its actual service-operation boundary. @returns Never. */ () => {
        throw native;
      },
    );
  const source = unicode("aßz"),
    result = uppercase(source, locale("en"), 1, 1);
  expect(text(result)).toBe("ß");
  expect(text(source)).toBe("aßz");
  expect(spy).toHaveBeenCalledOnce();
  const other = new Error("host failure");
  spy.mockImplementation(
    /** Simulates an unrelated host failure. @returns Never. */ () => {
      throw other;
    },
  );
  expect(
    /** Invokes real wrapper propagation. @returns Value. */ () => uppercase(source, locale("en")),
  ).toThrow(other);
});

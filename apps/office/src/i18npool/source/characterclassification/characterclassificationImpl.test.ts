/** @fileoverview Original case services through the actual UNO constructor/query and word dispatcher boundaries. */
import { expect, it } from "vitest";
import { setProcessServiceFactory } from "../../../comphelper/inc/processfactory";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { lingucomponent_NumberText_get_implementation } from "../../../lingucomponent/source/numbertext/numbertext";
import { CharacterClassification } from "../../../offapi/com/sun/star/i18n/CharacterClassification";
import { ANYWORD_IGNOREWHITESPACES } from "../../../offapi/com/sun/star/i18n/WordType";
import { SAL_NO_ACQUIRE } from "../../../sal/inc/types";
import { Context, Manager, ProcessFactory } from "../../../test/numbertext-service-fixture";
import type { XMultiComponentFactory } from "../../../udkapi/com/sun/star/lang/XMultiComponentFactory";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { BreakIteratorImpl } from "../breakiterator/breakiteratorImpl";
import { com_sun_star_i18n_BreakIterator_Unicode_get_implementation } from "../breakiterator/breakiterator_unicode";
import { NativeNumberSupplierService } from "../nativenumber/nativenumbersupplier";
import { com_sun_star_i18n_CharacterClassification_Unicode_get_implementation } from "./cclass_unicode";
import { com_sun_star_i18n_CharacterClassification_get_implementation } from "./characterclassificationImpl";

const constructors = new Map([
  ["com.sun.star.linguistic2.NumberText", lingucomponent_NumberText_get_implementation],
  [
    "com.sun.star.i18n.BreakIterator_Unicode",
    com_sun_star_i18n_BreakIterator_Unicode_get_implementation,
  ],
  [
    "com.sun.star.i18n.CharacterClassification",
    com_sun_star_i18n_CharacterClassification_get_implementation,
  ],
  [
    "com.sun.star.i18n.CharacterClassification_Unicode",
    com_sun_star_i18n_CharacterClassification_Unicode_get_implementation,
  ],
]);

/** Binds an explicit prepared service registry to actual component constructors. @returns Acquired context and recorded requests. */
function contextForCaseServices() {
  const manager = new Manager(
    /** Resolves the original component name as a test registry boundary. @param context - Original context. @returns Acquired result. */
    (context) => {
      const call = manager.calls.at(-1);
      if (call === undefined) throw new Error("missing service request");
      const ctor = constructors.get(call[0]);
      if (ctor === undefined) return new Reference<XInterface>();
      const args = new (Sequence.specialize<Any>("Any", 24))();
      try {
        return new Reference(ctor(context.get(), args), SAL_NO_ACQUIRE);
      } finally {
        args.dispose();
      }
    },
  );
  const reference = new Reference<XMultiComponentFactory>(manager);
  try {
    return {
      context: new Reference<XComponentContext>(new Context(reference)),
      calls: manager.calls,
    };
  } finally {
    reference.dispose();
  }
}

/** Constructs an owned source locale. @param language - Source language. @param country - Source country. @param variant - Optional variant. @returns Source locale. */
function localeFor(language: string, country: string, variant = ""): Locale {
  const lang = unicode(language);
  const region = unicode(country);
  const alternative = unicode(variant);
  try {
    return new Locale(lang, region, alternative);
  } finally {
    lang.dispose();
    region.dispose();
    alternative.dispose();
  }
}

it("selects locale word services in the original order and reuses the full request", /** Checks real UNO calls and source sentinels. @returns Nothing. */ () => {
  const { context, calls } = contextForCaseServices();
  const iterator = new BreakIteratorImpl(context);
  const owner = new Reference(iterator);
  const hk = localeFor("zh", "HK", "variant");
  const en = localeFor("en", "US");
  const asian = unicode("漢字 ");
  const words = unicode("first\u200b\u00a0second");
  const type = ANYWORD_IGNOREWHITESPACES;
  try {
    expect(iterator.getWordBoundary(words, 6, hk, type, true)).toEqual({ startPos: 7, endPos: 13 });
    expect(iterator.getWordBoundary(words, 6, hk, type, false)).toEqual({ startPos: 0, endPos: 5 });
    expect(
      calls.map(
        /** Reads the requested service name. @param call - Recorded request. @returns Name. */ (
          call,
        ) => call[0],
      ),
    ).toEqual([
      "com.sun.star.i18n.BreakIterator_zh_HK_variant",
      "com.sun.star.i18n.BreakIterator_zh_HK",
      "com.sun.star.i18n.BreakIterator_zh_TW",
      "com.sun.star.i18n.BreakIterator_zh",
      "com.sun.star.i18n.BreakIterator_Unicode",
    ]);
    expect(
      calls.every(
        /** Compares the acquired component context. @param call - Recorded request. @returns Context identity match. */ (
          call,
        ) => call[1] === context.get(),
      ),
    ).toBe(true);
    expect(iterator.previousWord(asian, 3, en, type)).toEqual({ startPos: 2, endPos: -1 });
    expect(iterator.previousWord(asian, 4, en, type)).toEqual({ startPos: 3, endPos: 3 });
    expect(calls).toHaveLength(5);
  } finally {
    words.dispose();
    asian.dispose();
    en.dispose();
    hk.dispose();
    owner.dispose();
    context.dispose();
  }
});

it("dispatches title ranges through the locale classifier and preserves noninitial characters", /** Exercises the actual case mapper and scoped word boundaries. @returns Nothing. */ () => {
  const { context, calls } = contextForCaseServices();
  const classifier = CharacterClassification.create(context);
  const locale = localeFor("tr", "TR");
  const input = unicode("  istanBUL\u200bikinci son");
  try {
    const first = classifier.operatorStar().toTitle(input, 0, 17, locale);
    const inside = classifier.operatorStar().toTitle(input, 3, 30, locale);
    try {
      expect(text(first)).toBe("  İstanBUL\u200bİkinci");
      expect(text(inside)).toBe("stanBUL\u200bİkinci Son");
    } finally {
      inside.dispose();
      first.dispose();
    }
    expect(
      calls.map(
        /** Reads the requested service name. @param call - Recorded request. @returns Name. */ (
          call,
        ) => call[0],
      ),
    ).toEqual([
      "com.sun.star.i18n.CharacterClassification",
      "com.sun.star.i18n.CharacterClassification_Unicode",
      "com.sun.star.i18n.CharacterClassification_tr_TR",
      "com.sun.star.i18n.CharacterClassification_tr",
      "com.sun.star.i18n.BreakIterator_tr_TR",
      "com.sun.star.i18n.BreakIterator_tr",
      "com.sun.star.i18n.BreakIterator_Unicode",
      "com.sun.star.i18n.BreakIterator_tr_TR",
      "com.sun.star.i18n.BreakIterator_tr",
      "com.sun.star.i18n.BreakIterator_Unicode",
    ]);
  } finally {
    input.dispose();
    locale.dispose();
    classifier.dispose();
    context.dispose();
  }
});

it("wraps a multiple-unit title mapping in the original typed target Any", /** Verifies dynamic exception identity and message. @returns Nothing. */ () => {
  const { context } = contextForCaseServices();
  const classifier = CharacterClassification.create(context);
  const locale = localeFor("de", "DE");
  const input = unicode("ﬃ test");
  try {
    let thrown: unknown;
    try {
      classifier.operatorStar().toTitle(input, 0, input.getLength(), locale).dispose();
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(WrappedTargetRuntimeException);
    if (!(thrown instanceof WrappedTargetRuntimeException)) throw thrown;
    const name = thrown.TargetException.getValueTypeName();
    try {
      expect(text(name)).toBe("com.sun.star.i18n.MultipleCharsOutputException");
      expect(text(thrown.Message)).toBe("wrapped com.sun.star.i18n.MultipleCharsOutputException: ");
    } finally {
      name.dispose();
      thrown.dispose();
    }
  } finally {
    input.dispose();
    locale.dispose();
    classifier.dispose();
    context.dispose();
  }
});

it("replays the original character classification title, upper and lower assertions", /** Covers the original basic input and distinct title form of U+01F3. @returns Nothing. */ () => {
  const { context } = contextForCaseServices();
  const classifier = CharacterClassification.create(context);
  const locale = localeFor("en", "US");
  try {
    for (const [source, title, upper, lower] of [
      ["Some text", "Some Text", "SOME TEXT", "some text"],
      ["ǳ", "ǲ", "Ǳ", "ǳ"],
    ] as const) {
      const input = unicode(source);
      const service = classifier.operatorStar();
      const actual = [
        service.toTitle(input, 0, input.getLength(), locale),
        service.toUpper(input, 0, input.getLength(), locale),
        service.toLower(input, 0, input.getLength(), locale),
      ];
      try {
        expect(actual.map(text)).toEqual([title, upper, lower]);
      } finally {
        for (const value of actual) value.dispose();
        input.dispose();
      }
    }
  } finally {
    locale.dispose();
    classifier.dispose();
    context.dispose();
  }
});

it("connects NatNum12 casing to the real NumberText and character services", /** Exercises upstream Calc spellout values through the actual supplier. @returns Nothing. */ () => {
  const { context, calls } = contextForCaseServices();
  const factory = new Reference(new ProcessFactory(context));
  const supplier = new NativeNumberSupplierService();
  const locale = localeFor("en", "US");
  setProcessServiceFactory(factory);
  try {
    for (const [source, modifiers, expected] of [
      ["100", "cardinal", "one hundred"],
      ["100", "capitalize cardinal", "One hundred"],
      ["100", "upper cardinal", "ONE HUNDRED"],
      ["100", "lower cardinal", "one hundred"],
      ["100", "title cardinal", "One Hundred"],
      ["1.20", "title USD", "One U.S. Dollar and Twenty Cents"],
      ["22", "title", "Twenty-Two"],
      ["22", "titlecase", "22"],
    ] as const) {
      const input = unicode(source);
      const params = unicode(modifiers);
      try {
        const result = supplier.getNativeNumberStringParams(input, locale, 12, params);
        try {
          expect(text(result), modifiers).toBe(expected);
        } finally {
          result.dispose();
        }
      } finally {
        params.dispose();
        input.dispose();
      }
    }
    expect(
      calls.filter(
        /** Matches the exact service request. @param call - Recorded request. @returns Name match. */ (
          call,
        ) => call[0] === "com.sun.star.linguistic2.NumberText",
      ),
    ).toHaveLength(1);
    expect(
      calls.filter(
        /** Matches the exact service request. @param call - Recorded request. @returns Name match. */ (
          call,
        ) => call[0] === "com.sun.star.i18n.CharacterClassification",
      ),
    ).toHaveLength(1);
    expect(
      calls.some(
        /** Matches the exact service request. @param call - Recorded request. @returns Name match. */ (
          call,
        ) => call[0] === "com.sun.star.i18n.CharacterClassification_en_US",
      ),
    ).toBe(false);
  } finally {
    const empty = new Reference<ProcessFactory>();
    setProcessServiceFactory(empty);
    empty.dispose();
    locale.dispose();
    supplier.dispose();
    factory.dispose();
    context.dispose();
  }
});

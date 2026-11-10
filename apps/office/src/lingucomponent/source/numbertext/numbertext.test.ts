/** @fileoverview Actual NumberText component locale selection, installed interpreter, original empty language list and acquired weak/UNO identity. */
import { expect, it } from "vitest";
import { NumberText_Impl, lingucomponent_NumberText_get_implementation } from "./numbertext";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { SAL_NO_ACQUIRE } from "../../../sal/inc/types";
import { XNumberText } from "../../../offapi/com/sun/star/linguistic2/XNumberText";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";

/** Materializes actual source Locale fields without host tag normalization. @param language - Exact language field. @param country - Exact country field. @param variant - Exact variant field. @returns Owned Locale. */
function locale(language: string, country = "", variant = ""): Locale {
  const fields = [unicode(language), unicode(country), unicode(variant)] as const;
  try {
    return new Locale(...fields);
  } finally {
    for (const field of fields) field.dispose();
  }
}

it.each([
  ["en", "US", "", "123", "one hundred twenty-three"],
  ["en", "GB", "", "101", "one hundred and one"],
  ["fr", "BE", "", "90", "nonante"],
  ["de", "CH", "", "30", "dreissig"],
  ["nb", "NO", "", "1", "én"],
  ["qlt", "GB", "en-GB-x-private", "101", "one hundred and one"],
  ["qlt", "RS", "sr-Latn-RS", "123", "123"],
  ["qaa", "", "", "123", "123"],
  ["qaa", "", "", "A\ud800B", "A?"],
  ["qaa", "", "", "A\ud800", "A"],
  ["qaa", "", "", "A\u0000B", "A\u0000B"],
  ["en", "US", "", "not a number", ""],
  ["it", "IT", "", "ordinal 1", "$1primo"],
])(
  "selects actual locale %s/%s/%s for %s",
  /** Retains original LanguageTag getter order and library filename fallback, including accepted official JS differences. @param language - Source language. @param country - Source country. @param variant - Source variant. @param input - Full input. @param expected - Source-selected output. @returns Nothing. */ (
    language,
    country,
    variant,
    input,
    expected,
  ) => {
    const component = new Reference(new NumberText_Impl());
    const target = locale(language, country, variant),
      source = unicode(input);
    try {
      const output = (component.get() as NumberText_Impl).getNumberText(source, target);
      try {
        expect(text(output)).toBe(expected);
        expect(text(source)).toBe(input);
      } finally {
        output.dispose();
      }
    } finally {
      source.dispose();
      target.dispose();
      component.dispose();
    }
  },
);

it("retains exact service identity, acquired factory ownership and the empty source language list", /** Exercises actual shared helper query/weak lifetime and owned name sequences, not a mocked service manager. @returns Nothing. */ () => {
  const arguments_ = new (Sequence.specialize<Any>("Any", 24))();
  const raw = lingucomponent_NumberText_get_implementation(null, arguments_);
  arguments_.dispose();
  const reference = new Reference(raw, SAL_NO_ACQUIRE);
  const weak = new WeakReferenceHelper(reference);
  try {
    const number = new Reference<XNumberText>(reference, UNO_QUERY, XNumberText.static_type);
    const info = new Reference<XServiceInfo>(reference, UNO_QUERY, XServiceInfo.static_type);
    try {
      expect(number.get()).toBe(raw);
      expect(info.get()).toBe(raw);
      const languages = (number.get() as XNumberText).getAvailableLanguages();
      try {
        expect(languages.getLength()).toBe(0);
      } finally {
        languages.dispose();
      }
      const name = (info.get() as XServiceInfo).getImplementationName();
      try {
        expect(text(name)).toBe("com.sun.star.lingu2.NumberText");
      } finally {
        name.dispose();
      }
      for (const [value, supported] of [
        ["com.sun.star.linguistic2.NumberText", true],
        ["com.sun.star.lingu2.NumberText", false],
        ["com.sun.star.linguistic2.numbertext", false],
      ] as const) {
        const service = unicode(value);
        try {
          expect((info.get() as XServiceInfo).supportsService(service)).toBe(supported);
        } finally {
          service.dispose();
        }
      }
    } finally {
      info.dispose();
      number.dispose();
    }
  } finally {
    reference.dispose();
  }
  const dead = weak.get();
  try {
    expect(dead.is()).toBe(false);
  } finally {
    dead.dispose();
    weak.dispose();
  }
});

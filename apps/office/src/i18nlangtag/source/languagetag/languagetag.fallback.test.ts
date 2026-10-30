/** @fileoverview Exact original ISO/non-ISO fallback vectors and original construction dependency/borrowed owner call order. */
import { expect, it, vi } from "vitest";
import {
  getFallbackStrings,
  type LanguageTagFallbackOwner,
  type LanguageTagStringFactory,
} from "./languagetag.fallback";
import {
  decomposeCanonicalLanguageTag,
  getFallbackStrings as preparedFallbacks,
} from "./languagetag";
import { unicode } from "../isolang/isolang.tables";

/** Explicit original field/ISO decision fixture, not a canonicalization or public LanguageTag replacement. @param tag - Prepared complete value. @param language - Prepared native language. @param country - Prepared native country. @param iso - Original isIsoLocale decision. @param script - Prepared script. @param variants - Prepared variants. @returns Owner and lifetime observer. */
function owner(
  tag: string,
  language: string,
  country: string,
  iso: boolean,
  script = "",
  variants = "",
) {
  const value = unicode(tag),
    calls: string[] = [];
  const source: LanguageTagFallbackOwner = {
    /** Observes original language copy. @returns Actual owned value. */
    getLanguage() {
      calls.push("language");
      return unicode(language);
    },
    /** Observes original country copy. @returns Actual owned value. */
    getCountry() {
      calls.push("country");
      return unicode(country);
    },
    /** Supplies the original prepared ISO predicate. @returns Original decision. */
    isIsoLocale() {
      calls.push("iso");
      return iso;
    },
    /** Observes original BCP47 access. @returns Borrowed actual value. */
    getBcp47() {
      calls.push("bcp47");
      return value;
    },
    /** Observes original variants copy. @returns Actual owned value. */
    getVariants() {
      calls.push("variants");
      return unicode(variants);
    },
    /** Observes original script predicate. @returns Original script decision. */
    hasScript() {
      calls.push("hasScript");
      return script.length !== 0;
    },
    /** Observes original script copy. @returns Actual owned value. */
    getScript() {
      calls.push("script");
      return unicode(script);
    },
  };
  return { source, calls, value };
}

const unused: LanguageTagStringFactory =
  /** Rejects a fixture path that must not construct another tag; production supplies the actual original constructor. @param tag - Unexpected constructor input. @returns Never. */ (
    tag,
  ) => {
    throw new Error("Unexpected fixture constructor: " + tag);
  };

it.each([
  ["en", "US", ["en-US", "en"], ["en"]],
  ["zh", "CN", ["zh-CN", "zh"], ["zh"]],
  ["zh", "HK", ["zh-HK", "zh-TW", "zh"], ["zh-TW", "zh"]],
  ["zh", "MO", ["zh-MO", "zh-TW", "zh"], ["zh-TW", "zh"]],
  ["zh", "TW", ["zh-TW", "zh-CN", "zh"], ["zh-CN", "zh"]],
  [
    "sh",
    "RS",
    ["sh-RS", "sr-Latn-RS", "sr-Latn", "sh", "sr-RS", "sr"],
    ["sr-Latn-RS", "sr-Latn", "sh", "sr-RS", "sr"],
  ],
  [
    "ku",
    "TR",
    ["ku-TR", "kmr-Latn-TR", "kmr-TR", "kmr-Latn", "kmr", "ku"],
    ["kmr-Latn-TR", "kmr-TR", "kmr-Latn", "kmr", "ku"],
  ],
  [
    "ku",
    "SY",
    ["ku-SY", "kmr-Latn-SY", "kmr-SY", "kmr-Latn", "kmr", "ku"],
    ["kmr-Latn-SY", "kmr-SY", "kmr-Latn", "kmr", "ku"],
  ],
  ["ku", "IQ", ["ku-IQ", "ckb-IQ", "ckb"], ["ckb-IQ", "ckb"]],
  ["ku", "IR", ["ku-IR", "ckb-IR", "ckb"], ["ckb-IR", "ckb"]],
  ["ku", "US", ["ku-US"], []],
  [
    "kmr",
    "TR",
    ["kmr-TR", "ku-Latn-TR", "ku-TR", "kmr", "ku"],
    ["ku-Latn-TR", "ku-TR", "kmr", "ku"],
  ],
  ["ckb", "IQ", ["ckb-IQ", "ku-Arab-IQ", "ku-IQ", "ckb"], ["ku-Arab-IQ", "ku-IQ", "ckb"]],
  ["en", "", ["en"], []],
  ["sh", "", ["sh", "sr-Latn", "sr"], ["sr-Latn", "sr"]],
  ["pli", "", ["pli", "pi-Latn", "pi"], ["pi-Latn", "pi"]],
  ["", "", [""], []],
] as const)(
  "preserves the original ISO branch for %s/%s",
  /** ISO is an actual source input, not inferred from tag spelling by this member. @param language - Prepared native language. @param country - Prepared native country. @param full - Full source vector. @param partial - Source vector excluding full. @returns Nothing. */ (
    language,
    country,
    full,
    partial,
  ) => {
    const fixture = owner(language + (country ? "-" + country : ""), language, country, true);
    try {
      expect(getFallbackStrings.call(fixture.source, true, unused)).toEqual(full);
      expect(getFallbackStrings.call(fixture.source, false, unused)).toEqual(partial);
      expect(fixture.calls).toEqual(["language", "country", "iso", "language", "country", "iso"]);
    } finally {
      fixture.value.dispose();
    }
  },
);

it("retains Catalan nested full-vector construction, duplicates and destruction", /** Source ca-XV constructs ca-ES-valencia and always requests its full vector. @returns Nothing. */ () => {
  const fixture = owner("ca-XV", "ca", "XV", true),
    constructed: string[] = [],
    disposed: boolean[] = [];
  const create: LanguageTagStringFactory =
    /** Supplies explicit original replacement member fields, not a general parsing heuristic. @param tag - Source constructor argument. @returns Original fallback-vector fixture. */ (
      tag,
    ) => {
      constructed.push(tag);
      const replacement = owner(tag, "ca", "ES", false, "", "valencia");
      return {
        /** Executes the real full fallback member on prepared original replacement values. @param full - Original flag. @returns Real source vector. */
        getFallbackStrings(full) {
          expect(full).toBe(true);
          return getFallbackStrings.call(replacement.source, full, unused);
        },
        /** Observes original temporary destruction. @returns Nothing. */
        dispose() {
          replacement.value.dispose();
          disposed.push(true);
        },
      };
    };
  try {
    expect(getFallbackStrings.call(fixture.source, true, create)).toEqual([
      "ca-XV",
      "ca-ES-valencia",
      "ca-XV",
      "ca-valencia",
      "ca-ES",
      "ca",
    ]);
    expect(getFallbackStrings.call(fixture.source, false, create)).toEqual([
      "ca-ES-valencia",
      "ca-XV",
      "ca-valencia",
      "ca-ES",
      "ca",
    ]);
    expect(constructed).toEqual(["ca-ES-valencia", "ca-ES-valencia"]);
    expect(disposed).toEqual([true, true]);
  } finally {
    fixture.value.dispose();
  }
});

it.each([
  [
    "sr-Latn-CS",
    "sr",
    "CS",
    "Latn",
    "",
    ["sr-Latn-YU", "sh-CS", "sh-YU", "sr-Latn", "sh", "sr-CS", "sr-YU", "sr"],
  ],
  ["en-GB-oed", "en", "GB", "", "oed", ["en-GB-oxendict", "en-GB", "en"]],
  ["krm-Latn-TR", "krm", "TR", "Latn", "", ["ku-TR", "krm-Latn", "krm-TR", "krm"]],
  ["kmr-Latn-TR", "kmr", "TR", "Latn", "", ["kmr-Latn", "kmr-TR", "kmr"]],
] as const)(
  "retains original non-ISO order and source spelling for %s",
  /** Includes source krm typo and old grandfathered variant length rule. @param tag - Source complete tag. @param language - Prepared language. @param country - Prepared country. @param script - Prepared script. @param variants - Prepared variants. @param expected - Source partial vector. @returns Nothing. */ (
    tag,
    language,
    country,
    script,
    variants,
    expected,
  ) => {
    const fixture = owner(tag, language, country, false, script, variants);
    try {
      expect(getFallbackStrings.call(fixture.source, false, unused)).toEqual(expected);
      expect(getFallbackStrings.call(fixture.source, true, unused)).toEqual([tag, ...expected]);
    } finally {
      fixture.value.dispose();
    }
  },
);

it("uses the real general parser without inventing a language for grandfathered tags", /** General canonical tags use actual registered-subtag getters, not split-token assumptions. @returns Nothing. */ () => {
  for (const tag of ["i-default", "i-enochian"]) {
    const fields = decomposeCanonicalLanguageTag(tag);
    expect(fields).toEqual({ tag, language: "", script: "", country: "", variants: "" });
    expect(preparedFallbacks(fields)).toEqual([]);
  }
  expect(decomposeCanonicalLanguageTag("en-Latn-Xfoo")).toEqual({
    tag: "en-Latn-Xfoo",
    language: "en",
    script: "Latn",
    country: "",
    variants: "",
  });
});

it("destroys owned field snapshots when the Catalan constructor fails", /** Source stack unwinding must release country before language and propagate the same exception. @returns Nothing. */ () => {
  const language = unicode("ca"),
    country = unicode("XV"),
    order: string[] = [];
  const disposeLanguage = language.dispose.bind(language),
    disposeCountry = country.dispose.bind(country);
  vi.spyOn(language, "dispose").mockImplementation(
    /** Runs the actual source value destructor. @returns Nothing. */ () => {
      order.push("language");
      disposeLanguage();
    },
  );
  vi.spyOn(country, "dispose").mockImplementation(
    /** Runs the actual source value destructor. @returns Nothing. */ () => {
      order.push("country");
      disposeCountry();
    },
  );
  const fixture = owner("ca-XV", "ca", "XV", true);
  fixture.source.getLanguage =
    /** Transfers the real owned return snapshot. @returns Source value. */ () => language;
  fixture.source.getCountry =
    /** Transfers the real owned return snapshot. @returns Source value. */ () => country;
  const failure = new Error("constructor fixture");
  try {
    expect(
      /** Executes the original helper under an explicit constructor-failure fixture. @returns Source helper result or the fixture exception. */ () =>
        getFallbackStrings.call(
          fixture.source,
          true,
          /** Original constructor dependency failure. @returns Never. */ () => {
            throw failure;
          },
        ),
    ).toThrow(failure);
    expect(order).toEqual(["country", "language"]);
  } finally {
    fixture.value.dispose();
    vi.restoreAllMocks();
  }
});

it("destroys the Catalan temporary before reading its returned vector", /** Observes original full-expression lifetime through a test-only array element accessor. @returns Nothing. */ () => {
  const fixture = owner("ca-XV", "ca", "XV", true);
  let disposed = false;
  const values = ["ca-ES-valencia"];
  Object.defineProperty(values, "0", {
    /** Observes vector element access after its source owner temporary has ended. @returns Candidate value. */
    get() {
      expect(disposed).toBe(true);
      return "ca-ES-valencia";
    },
  });
  try {
    const result = getFallbackStrings.call(
      fixture.source,
      false,
      /** Supplies a vector value independent of the original temporary. @returns Explicit source-protocol fixture. */ () => ({
        /** Original vector return. @returns Observed vector value. */
        getFallbackStrings() {
          return values;
        },
        /** Original temporary end. @returns Nothing. */
        dispose() {
          disposed = true;
        },
      }),
    );
    expect(result).toEqual(["ca-ES-valencia"]);
  } finally {
    fixture.value.dispose();
  }
});

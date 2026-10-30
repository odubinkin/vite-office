/** @fileoverview Isolated original canonicalization/ISO/Locale-ID member transitions over real mapping tables and liblangtag; no public LanguageTag/registry facade is certified. */
import { afterEach, expect, it, vi } from "vitest";
import * as canon from "./languagetag.canonicalize";
import * as conversion from "./languagetag.conversion";
import * as fields from "./languagetag.fields";
import * as localeState from "./languagetag.locale-state";
import { convertLocaleToLang } from "./languagetag.locale-id";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { LANGUAGE_DONTKNOW, LANGUAGE_SYSTEM, LANGUAGE_ENGLISH_US } from "../../inc/lang";
import { MsLangId } from "../../inc/mslangid";
import { text, unicode } from "../isolang/isolang.tables";
import type { Tag } from "../../../external/liblangtag/liblangtag/lt-tag";
const D = conversion.Decision;

/** Prepared private owner using the actual production member groups; registration and known-set fixture inputs are explicit unported enclosing dependencies. */
class Owner implements canon.LanguageTagCanonicalState {
  readonly maLocale = new Locale();
  readonly maBcp47: OUString;
  readonly maCachedLanguage = new OUString();
  readonly maCachedScript = new OUString();
  readonly maCachedCountry = new OUString();
  readonly maCachedVariants = new OUString();
  mnLangID = LANGUAGE_DONTKNOW;
  mbSystemLocale = false;
  mbInitializedBcp47 = true;
  mbInitializedLocale = false;
  mbInitializedLangID = false;
  mbCachedLanguage = false;
  mbCachedScript = false;
  mbCachedCountry = false;
  mbCachedVariants = false;
  meIsIsoLocale = D.DECISION_DONTKNOW;
  meIsIsoODF = D.DECISION_DONTKNOW;
  meIsValid = D.DECISION_DONTKNOW;
  meIsLiblangtagNeeded = D.DECISION_DONTKNOW;
  mpImplLangtag: Tag | null = null;
  readonly registered: number[] = [];
  readonly refresh: string[] = [];
  knownLookups = 0;
  /** Supplies source constructor-state fields without inventing the enclosing public owner. @param tag - Original initialized BCP47. @param knowns - Prepared original known-set input. @returns Member fixture. */
  constructor(
    tag: string,
    readonly knowns: ReadonlySet<string> = new Set(),
  ) {
    this.maBcp47 = unicode(tag);
  }
  /** Source lazy known-set dependency for this isolated member fixture. @returns Prepared known set. */
  getKnowns = (): ReadonlySet<string> => {
    this.knownLookups++;
    return this.knowns;
  };
  /** Runs the real synchronization member group. @returns Source changed flag. */
  synCanonicalize(): boolean {
    return canon.synCanonicalize.call(this, this.getKnowns);
  }
  /** Runs the real ID-to-Locale group. @returns Nothing. */
  convertLangToLocale(): void {
    conversion.convertLangToLocale(this);
  }
  /** Runs the real Locale-to-tag group. @returns Nothing. */
  convertLocaleToBcp47(): void {
    conversion.convertLocaleToBcp47(this);
  }
  /** Runs the real Locale refresh and records call order only. @returns Nothing. */
  convertBcp47ToLocale(): void {
    this.refresh.push("Locale");
    localeState.convertBcp47ToLocale.call(this);
  }
  /** Runs the real ID refresh and records call order only. @returns Nothing. */
  convertBcp47ToLang(): void {
    this.refresh.push("ID");
    localeState.convertBcp47ToLang.call(this);
  }
  /** Runs the real validity group. @returns Source decision. */
  isValidBcp47(): boolean {
    return canon.isValidBcp47.call(this);
  }
  /** Runs the real ISO decision group. @returns Source decision. */
  isIsoODF(): boolean {
    return fields.isIsoODF.call(this);
  }
  /** Observes the original unconsumed ImplPtr-returning registry call; it does not fabricate registered IDs. @param id - Actual source suggestion. @returns No fixture implementation pointer. */
  registerOnTheFly(id: number): unknown {
    this.registered.push(id);
    return undefined;
  }
  /** Releases actual shared members. @returns Nothing. */
  dispose(): void {
    for (const value of [
      this.maLocale,
      this.maBcp47,
      this.maCachedLanguage,
      this.maCachedScript,
      this.maCachedCountry,
      this.maCachedVariants,
    ])
      value.dispose();
  }
}

afterEach(
  /** Restores only test spies/configuration. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(LANGUAGE_SYSTEM);
  },
);

it.each([
  ["en-US", "en-US", false],
  ["de-latn-DE", "de-DE", true],
  ["C", "en-US", true],
  ["sr-Latn-CS", "sr-Latn-CS", false],
  ["i-klingon", "tlh", true],
  ["de-Latn-DE-u-co-phonebk", "de-DE-u-co-phonebk", true],
])(
  "canonicalizes prepared %s through actual source owners",
  /** Preserves source known override and liblangtag paths rather than host canonicalization. @param input - Original private BCP47. @param expected - Source result. @param changed - Source mutation flag. @returns Nothing. */ (
    input,
    expected,
    changed,
  ) => {
    const owner = new Owner(input);
    try {
      expect(canon.canonicalize.call(owner, owner.getKnowns)).toBe(changed);
      expect(text(owner.maBcp47)).toBe(expected);
      expect(owner.meIsValid).toBe(D.DECISION_YES);
      expect(owner.mbInitializedLocale).toBe(false);
      expect(owner.mbInitializedLangID).toBe(false);
      expect(owner.mnLangID).toBe(LANGUAGE_DONTKNOW);
      expect(owner.maLocale.Language.getLength()).toBe(0);
    } finally {
      owner.dispose();
    }
  },
);

it("does not parse known ISO tags or query the known-fallback set", /** Checks original fast-path state and data-provider call boundary. @returns Nothing. */ () => {
  const owner = new Owner("en-US");
  try {
    canon.canonicalize.call(owner, owner.getKnowns);
    expect(owner.meIsLiblangtagNeeded).toBe(D.DECISION_NO);
    expect(owner.mpImplLangtag).toBeNull();
    expect(owner.knownLookups).toBe(0);
    expect(owner.synCanonicalize()).toBe(false);
    expect(owner.registered).toEqual([]);
  } finally {
    owner.dispose();
  }
});

it("retains failed parser allocation and skips repeat synchronization", /** Preserves validity independently from changed and the original mpImplLangtag guard. @returns Nothing. */ () => {
  const owner = new Owner("not_a_language");
  try {
    expect(owner.synCanonicalize()).toBe(false);
    expect(owner.meIsValid).toBe(D.DECISION_NO);
    const parsed = owner.mpImplLangtag;
    expect(parsed).not.toBeNull();
    expect(owner.synCanonicalize()).toBe(false);
    expect(owner.mpImplLangtag).toBe(parsed);
    expect(owner.isValidBcp47()).toBe(false);
  } finally {
    owner.dispose();
  }
});

it("reparses canonicalized tags so suppress-script fields disappear", /** Uses actual liblangtag field getters after source normalization. @returns Nothing. */ () => {
  const owner = new Owner("de-Latn-DE-u-co-phonebk");
  try {
    owner.synCanonicalize();
    expect(owner.mpImplLangtag).not.toBeNull();
    expect(text(fields.getScript.call(owner))).toBe("");
    expect(text(fields.getLanguage.call(owner))).toBe("de");
  } finally {
    owner.dispose();
  }
});

it("resolves system BCP47 even when liblangtag was already ruled out", /** Checks the initial getBcp47 side effect precedes the decision fast return. @returns Nothing. */ () => {
  MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(0x0407);
  const owner = new Owner("");
  owner.mbInitializedBcp47 = false;
  owner.mbSystemLocale = true;
  owner.meIsLiblangtagNeeded = D.DECISION_NO;
  try {
    expect(canon.canonicalize.call(owner, owner.getKnowns)).toBe(false);
    expect(text(owner.maBcp47)).toBe("de-DE");
    expect(owner.mnLangID).toBe(0x0407);
  } finally {
    owner.dispose();
  }
});

it.each([
  ["en-US", true, true],
  ["es-419", true, true],
  ["de-Latn-DE", true, true],
  ["sr-Latn-RS", false, true],
  ["de-DE-1901", false, false],
  ["x-private", false, false],
  ["not_a_language", false, false],
])(
  "preserves original ISO/ODF decision gates for %s",
  /** Checks actual canonicalization followed by source raw-region/length/variant rules. @param tag - Original tag. @param iso - Source ISO result. @param odf - Source ODF result. @returns Nothing. */ (
    tag,
    iso,
    odf,
  ) => {
    const owner = new Owner(tag);
    try {
      expect(fields.isIsoLocale.call(owner)).toBe(iso);
      expect(owner.isIsoODF()).toBe(odf);
    } finally {
      owner.dispose();
    }
  },
);

it("remaps legacy Locale names using original tables before optional registration", /** Uses the original GERMAN alias path and actual refreshed values. @returns Nothing. */ () => {
  const owner = new Owner("GERMAN"),
    language = unicode("GERMAN");
  owner.maLocale.Language.assign(language);
  language.dispose();
  owner.mbInitializedLocale = true;
  try {
    expect(convertLocaleToLang.call(owner, false)).toBe(true);
    expect(text(owner.maBcp47)).toBe("de-DE");
    expect(owner.mnLangID).toBe(0x0407);
    expect(owner.mbInitializedLangID).toBe(true);
    expect(owner.registered).toEqual([]);
  } finally {
    owner.dispose();
  }
});

it("refreshes existing Locale before ID after a changed override", /** Executes actual refresh members while observing source order. @returns Nothing. */ () => {
  const owner = new Owner("C"),
    language = unicode("C");
  owner.maLocale.Language.assign(language);
  language.dispose();
  owner.mbInitializedLocale = true;
  try {
    expect(owner.synCanonicalize()).toBe(true);
    expect(owner.refresh.slice(0, 2)).toEqual(["Locale", "ID"]);
    expect(text(owner.maLocale.Language)).toBe("en");
    expect(owner.mnLangID).toBe(LANGUAGE_ENGLISH_US);
  } finally {
    owner.dispose();
  }
});

it("one-way parser disable preserves known-tag fast paths", /** Uses an isolated module instance for the original process-wide flag. @returns Completion. */ async () => {
  vi.resetModules();
  const isolated = await import("./languagetag.canonicalize");
  isolated.disable_lt_tag_parse();
  for (const [input, expected] of [
    ["en-US", D.DECISION_YES],
    ["de-Latn-DE-u-co-phonebk", D.DECISION_NO],
  ] as const) {
    const owner = new Owner(input);
    try {
      isolated.canonicalize.call(owner, owner.getKnowns);
      expect(owner.meIsValid).toBe(expected);
    } finally {
      owner.dispose();
    }
  }
});

it("trusts an original known fallback even without a concrete ID", /** kmr is emitted by the original fallback list for the defined kmr-Latn-TR mapping. @returns Nothing. */ () => {
  const owner = new Owner("kmr", new Set(["kmr"]));
  try {
    expect(canon.canonicalize.call(owner, owner.getKnowns)).toBe(false);
    expect(owner.knownLookups).toBe(1);
    expect(owner.meIsLiblangtagNeeded).toBe(D.DECISION_NO);
    expect(owner.meIsValid).toBe(D.DECISION_YES);
    expect(owner.mpImplLangtag).toBeNull();
    expect(owner.mnLangID).toBe(LANGUAGE_DONTKNOW);
  } finally {
    owner.dispose();
  }
});

it("preserves changed independently from failed validation", /** Original structural casing can change an ultimately invalid tag. @returns Nothing. */ () => {
  const owner = new Owner("EN-1!");
  try {
    expect(canon.canonicalize.call(owner, owner.getKnowns)).toBe(true);
    expect(text(owner.maBcp47)).toBe("en-1!");
    expect(owner.meIsValid).toBe(D.DECISION_NO);
    expect(text(fields.getLanguage.call(owner))).toBe("en");
    expect(fields.isIsoLocale.call(owner)).toBe(true);
  } finally {
    owner.dispose();
  }
});

it.each([
  ["en", 9],
  ["de", 7],
  ["ace", LANGUAGE_DONTKNOW],
] as const)(
  "passes the original primary-ID suggestion for %s without inventing registration",
  /** Checks the genuine fallback tables and original English-last-resort suppression. @param tag - Registered language-only tag without an exact qlt ID. @param suggestion - Source suggested ID. @returns Nothing. */ (
    tag,
    suggestion,
  ) => {
    const owner = new Owner(tag),
      marker = unicode("qlt");
    owner.maLocale.Language.assign(marker);
    marker.dispose();
    owner.maLocale.Variant.assign(owner.maBcp47);
    owner.mbInitializedLocale = true;
    try {
      expect(convertLocaleToLang.call(owner, true)).toBe(false);
      expect(owner.registered).toEqual([suggestion]);
      expect(owner.mbInitializedLangID).toBe(true);
    } finally {
      owner.dispose();
    }
  },
);

it("does not register invalid tags but still initializes the failed ID lookup", /** Preserves the original allow-on-the-fly validity gate. @returns Nothing. */ () => {
  const owner = new Owner("not_a_language"),
    marker = unicode("qlt");
  owner.maLocale.Language.assign(marker);
  marker.dispose();
  owner.maLocale.Variant.assign(owner.maBcp47);
  owner.mbInitializedLocale = true;
  try {
    expect(convertLocaleToLang.call(owner, true)).toBe(false);
    expect(owner.registered).toEqual([]);
    expect(owner.mnLangID).toBe(LANGUAGE_DONTKNOW);
    expect(owner.mbInitializedLangID).toBe(true);
  } finally {
    owner.dispose();
  }
});

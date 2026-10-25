/** @fileoverview Source-derived font sample decisions over real Font, FontCharMap and native glyph-loop values; no installed-font claims. */
import { describe, expect, it, vi } from "vitest";
import { Font } from "../../../vcl/source/font/font";
import { FontCharMap } from "../../../vcl/source/font/fontcharmap";
import { hasGlyphsInFontCharMap } from "../../../vcl/source/outdev/font";
import { RTL_TEXTENCODING_SYMBOL } from "../../../sal/inc/rtl/textenc";
import {
  UnicodeCoverage as U,
  CodePageCoverage as C,
  type FontCapabilities,
} from "../../../vcl/inc/fontcapabilities";
import { UScriptCode as S } from "../../../external/icu/source/common/unicode/uscript";
import {
  canRenderNameOfSelectedFont,
  isSymbolFont,
  makeShortMinimalTextForScript,
  makeShortRepresentativeSymbolTextForSelectedFont,
  makeShortRepresentativeTextForScript,
  makeShortRepresentativeTextForSelectedFont,
  otCoverageToScript,
  type FontSampleDevice,
} from "./sampletext";

/** Actual font-map fixture; tests supply advertised OS/2 values rather than simulated sample answers. */
class FaceDevice implements FontSampleDevice {
  readonly font = new Font();
  readonly map: FontCharMap | undefined;
  /** Constructs one physical-map test value. @param name - Native family. @param map - Actual map. @param capabilities - Actual advertised bits. @returns Device. */
  constructor(
    name: string,
    map: FontCharMap | null = new FontCharMap([0x20, 0xd800, 0xe000, 0x10000]),
    readonly capabilities?: FontCapabilities,
  ) {
    this.font.SetFamilyName(name);
    this.map = map ?? undefined;
  }
  /** Reads the actual native font value. @returns Font. */
  GetFont(): Font {
    return this.font;
  }
  /** Uses the source glyph loop over this face map. @param font - Current actual font. @param text - Requested sample. @returns Source failure offset. */
  HasGlyphs(font: Font, text: string): number {
    expect(font).toBe(this.font);
    return hasGlyphsInFontCharMap(this.map, text);
  }
  /** Reads real range data. @returns Map. */
  GetFontCharMap(): FontCharMap | undefined {
    return this.map?.IsDefaultMap() === false ? this.map : undefined;
  }
  /** Reads this fixture's advertised native bitsets. @returns Capabilities. */
  GetFontCapabilities(): FontCapabilities | undefined {
    return this.capabilities;
  }
}

/** Builds a real sparse map containing only the supplied UTF16 characters. @param text - Represented glyphs. @returns Ordered native ranges. */
function charmap(text: string): FontCharMap {
  const chars = [
    ...new Set(
      text.split("").map(
        /** Projects an exact native unit. @param char - Unit. @returns Code. */
        (char) => char.charCodeAt(0),
      ),
    ),
  ].sort(
    /** Orders native endpoints. @param a - First. @param b - Second. @returns Order. */
    (a, b) => a - b,
  );
  return new FontCharMap(
    chars.flatMap(
      /** Creates half-open unit ranges. @param value - Codepoint. @returns Endpoints. */
      (value) => [value, value + 1],
    ),
  );
}

/** Computes a sample from actual advertised bitsets and charmap values. @param bits - Unicode bits. @param codepages - Optional codepage bits. @param name - Native family. @returns Native sample. */
function sample(
  bits: readonly U[] | undefined,
  codepages?: readonly C[],
  name = "Example",
): string {
  return makeShortRepresentativeTextForSelectedFont(
    new FaceDevice(name, new FontCharMap([0x20, 0xd800, 0xe000, 0x10000]), {
      oUnicodeRange: bits === undefined ? undefined : new Set(bits),
      oCodePageRange: codepages === undefined ? undefined : new Set(codepages),
    }),
  );
}

describe("native font dropdown samples", /** Defines source decisions. @returns Nothing. */ () => {
  it("uses real glyph eligibility for font names, including native symbol exceptions", /** Checks actual maps and exact name matching. @returns Nothing. */ () => {
    expect(canRenderNameOfSelectedFont(new FaceDevice("Example"))).toBe(true);
    expect(canRenderNameOfSelectedFont(new FaceDevice("Example", charmap("Examp")))).toBe(false);
    for (const name of [
      "Apple Color Emoji",
      "CMSY10",
      "cmex10",
      "esint10",
      "feta26",
      "jsMath-cmsy10",
      "jsMath-cmex10",
      "msam10",
      "msbm10",
      "wasy10",
      "Denemo",
      "GlyphBasic1",
      "GlyphBasic2",
      "GlyphBasic3",
      "GlyphBasic4",
      "Letters Laughing",
      "MusiQwik",
      "MusiSync",
      "stmary10",
      "Symbol",
      "Webdings",
      "Wingdings",
      "Wingdings 2",
      "Wingdings 3",
      "Bookshelf Symbol 7",
      "STIXIntegralsUp",
      "STIXNonUnicode",
      "STIXSizeOneSym",
      "STIXVariants",
      "OpenSymbol",
      "StarSymbol;Other",
    ])
      expect(canRenderNameOfSelectedFont(new FaceDevice(name))).toBe(false);
    expect(isSymbolFont(new FaceDevice("stixintegrals").font)).toBe(false);
    const encoded = new FaceDevice("Encoded Face");
    encoded.font.SetCharSet(RTL_TEXTENCODING_SYMBOL);
    expect(isSymbolFont(encoded.font)).toBe(true);
  });

  it("retains exact representative strings and unsupported-script emptiness", /** Pins nonlocalized native sample text. @returns Nothing. */ () => {
    expect(makeShortRepresentativeTextForScript(S.USCRIPT_GREEK)).toBe("Αλφάβητο");
    expect(makeShortRepresentativeTextForScript(S.USCRIPT_HEBREW)).toBe("אלף־בית עברי");
    expect(makeShortRepresentativeTextForScript(S.USCRIPT_LATIN)).toBe("Lorem ipsum");
    expect(makeShortRepresentativeTextForScript(S.USCRIPT_HAN)).toBe("简繁");
    expect(makeShortRepresentativeTextForScript(S.USCRIPT_KOREAN)).toBe("한글");
    expect(makeShortRepresentativeTextForScript(S.USCRIPT_JAMO)).toBe("한글");
    expect(makeShortRepresentativeTextForScript(S.USCRIPT_HANGUL)).toBe("한글");
    expect(makeShortRepresentativeTextForScript(S.USCRIPT_COMMON)).toBe("");
    expect(makeShortMinimalTextForScript(S.USCRIPT_GREEK)).toBe("ΑΒ");
    expect(makeShortMinimalTextForScript(S.USCRIPT_HEBREW)).toBe("אב");
    expect(makeShortMinimalTextForScript(S.USCRIPT_LATIN)).toBe("");
    expect(otCoverageToScript(U.BASIC_LATIN)).toBe(S.USCRIPT_LATIN);
    expect(otCoverageToScript(U.GREEK_EXTENDED)).toBe(S.USCRIPT_GREEK);
    expect(otCoverageToScript(U.NONPLANE_0)).toBe(S.USCRIPT_COMMON);
    expect(otCoverageToScript(U.RESERVED5)).toBe(S.USCRIPT_COMMON);
  });

  it("reduces actual OS/2 ranges in the original source order", /** Exercises Arabic, Indic, weak and CJK masks without changing the advertised record. @returns Nothing. */ () => {
    expect(
      sample([
        U.BASIC_LATIN,
        U.LATIN_1_SUPPLEMENT,
        U.LATIN_EXTENDED_A,
        U.LATIN_EXTENDED_B,
        U.LATIN_EXTENDED_ADDITIONAL,
      ]),
    ).toBe("");
    expect(
      sample([U.ARABIC, U.ARABIC_PRESENTATION_FORMS_A, U.ARABIC_PRESENTATION_FORMS_B, U.NKO]),
    ).toBe("أبجدية عربية");
    expect(sample([U.ARABIC, U.SYRIAC, U.ARABIC_PRESENTATION_FORMS_A])).toBe("ܣܛܪܢܓܠܐ");
    expect(sample([U.DEVANAGARI, U.BENGALI])).toBe("বাংলা লিপি");
    expect(sample([U.DEVANAGARI])).toBe("देवनागरी");
    expect(sample([U.DEVANAGARI, U.BENGALI, U.GUJARATI])).toBe("");
    expect(sample([U.GENERAL_PUNCTUATION, U.ARABIC])).toBe("أبجدية عربية");
    expect(
      sample([U.BENGALI, U.GREEK_EXTENDED, U.GREEK_AND_COPTIC, U.ARABIC_PRESENTATION_FORMS_B]),
    ).toBe("বাংলা লিপি");
    expect(sample([U.CYRILLIC, U.GEORGIAN])).toBe("დამწერლობა");
    expect(
      sample(
        [U.HANGUL_SYLLABLES, U.HIRAGANA, U.KATAKANA, U.CYRILLIC, U.THAI, U.DESERET, U.PHAGS_PA],
        [C.CP932],
      ),
    ).toBe("日本語");
    expect(sample(undefined)).toBe("");
    expect(sample([], [])).toBe("");
    expect(sample([], [C.CP932])).toBe("日本語");
    expect(sample([], [C.CP936])).toBe("简");
    expect(sample([], [C.CP950])).toBe("繁");
    expect(sample([], [C.CP1361, C.CP949])).toBe("한글");
    expect(sample([], [C.CP932, C.CP936])).toBe("简繁");
    expect(sample([U.ARABIC, U.BENGALI, U.THAI], [C.CP932])).toBe("");
    expect(makeShortRepresentativeTextForSelectedFont(new FaceDevice("Example"))).toBe("");
    expect(
      makeShortRepresentativeTextForSelectedFont(
        new FaceDevice("Example", charmap("Example"), { oUnicodeRange: new Set([U.ARABIC]) }),
      ),
    ).toBe("");
  });

  it("retains exact exceptions for incorrectly advertised font capabilities", /** Checks original family matches rather than substring-based script guesses. @returns Nothing. */ () => {
    for (const [names, script] of [
      [["GB18030 Bitmap", "Hei", "Kai"], S.USCRIPT_HAN],
      [
        ["BiauKai", "Hannotate TC", "HanziPen TC", "Heiti TC", "Weibei TC"],
        S.USCRIPT_TRADITIONAL_HAN,
      ],
      [["GungSeo", "PCMyungjo", "PilGi"], S.USCRIPT_KOREAN],
      [["Hannotate SC", "HanziPen SC", "Heiti SC", "Weibei SC"], S.USCRIPT_SIMPLIFIED_HAN],
      [["Bangla Sangam MN"], S.USCRIPT_BENGALI],
      [["Gurmukhi MN"], S.USCRIPT_GURMUKHI],
      [["Kannada MN"], S.USCRIPT_KANNADA],
      [["Lao MN"], S.USCRIPT_LAO],
      [["Malayalam MN"], S.USCRIPT_MALAYALAM],
      [["Sinhala MN"], S.USCRIPT_SINHALA],
      [["Telugu MN"], S.USCRIPT_TELUGU],
      [["Myanmar MN"], S.USCRIPT_MYANMAR],
      [["InaiMathi"], S.USCRIPT_TAMIL],
    ] as const)
      for (const name of names)
        expect(makeShortRepresentativeTextForSelectedFont(new FaceDevice(name))).toBe(
          makeShortRepresentativeTextForScript(script),
        );
    expect(makeShortRepresentativeTextForSelectedFont(new FaceDevice("Inaimathi"))).toBe("");
  });

  it("disambiguates Han by glyph coverage before source-ordered name suffixes", /** Uses actual sparse font maps for each CJK candidate. @returns Nothing. */ () => {
    for (const [probe, expected] of [
      ["乭乶奬한글", "한글"],
      ["奨枠鶏日本語", "日本語"],
      ["乡启奖简", "简"],
      ["啟雞繁", "繁"],
    ]) {
      const device = new FaceDevice("Example", charmap(probe as string), {
        oUnicodeRange: new Set([U.CJK_UNIFIED_IDEOGRAPHS]),
      });
      expect(makeShortRepresentativeTextForSelectedFont(device)).toBe(expected);
    }
    expect(sample([U.CJK_UNIFIED_IDEOGRAPHS], undefined, "Family JP SC")).toBe("简");
    expect(sample([U.CJK_UNIFIED_IDEOGRAPHS], undefined, "Family TC")).toBe("繁");
    expect(sample([U.CJK_UNIFIED_IDEOGRAPHS], undefined, "FamilyJapanese")).toBe("日本語");
    expect(sample([U.CJK_UNIFIED_IDEOGRAPHS], undefined, "FamilyKorean")).toBe("한글");
    expect(sample([U.CJK_UNIFIED_IDEOGRAPHS], undefined, "Japanese")).toBe("简繁");
  });

  it("builds symbol samples from actual map population and source fallbacks", /** Pins Apple/Adobe Symbol,OpenSymbol and sparse reverse traversal. @returns Nothing. */ () => {
    expect(makeShortRepresentativeSymbolTextForSelectedFont(new FaceDevice("Symbol"))).toBe(
      "μ∂∑∏π∫Ω√",
    );
    expect(
      makeShortRepresentativeSymbolTextForSelectedFont(new FaceDevice("Symbol", charmap("ABC"))),
    ).toBe("\uf06d\uf0b6\uf0e5\uf0d5\uf070\uf0f2\uf057\uf0d6");
    expect(makeShortRepresentativeSymbolTextForSelectedFont(new FaceDevice("OpenSymbol"))).toBe(
      "✂✈✍\ue033∑⊈",
    );
    expect(
      makeShortRepresentativeSymbolTextForSelectedFont(
        new FaceDevice("OpenSymbol", charmap("ABC")),
      ),
    ).toBe("");
    expect(
      makeShortRepresentativeSymbolTextForSelectedFont(
        new FaceDevice("Symbols", new FontCharMap([65, 75])),
      ),
    ).toBe("JIHGFED");
    expect(
      makeShortRepresentativeSymbolTextForSelectedFont(
        new FaceDevice("Symbols", new FontCharMap([65, 68])),
      ),
    ).toBe("CBA");
    expect(
      makeShortRepresentativeSymbolTextForSelectedFont(
        new FaceDevice("Symbols", new FontCharMap([0, 1])),
      ),
    ).toBe("");
    const withoutMap = new FaceDevice("Symbols", null);
    expect(makeShortRepresentativeSymbolTextForSelectedFont(withoutMap)).toBe("");
  });
});

it("synthetic-only: retains the final CP950 false branch despite the source mask invariant", /** Isolates the preserved branch body by deliberately violating Set membership consistency; no installed-font or UI reachability is claimed. @returns Nothing. */ () => {
  const pages = new Set([C.CP950]);
  const originalHas = Set.prototype.has;
  const has = vi.spyOn(Set.prototype, "has").mockImplementation(
    /** Violates only the copied codepage set's membership, leaving actual advertised data intact. @param this - Copied native set. @param bit - Queried bit. @returns Synthetic membership. */
    function (this: Set<number>, bit: number): boolean {
      if (this !== pages && bit === C.CP950) return false;
      return originalHas.call(this, bit);
    },
  );
  try {
    expect(
      makeShortRepresentativeTextForSelectedFont(
        new FaceDevice("Example", new FontCharMap([0x20, 0xd800, 0xe000, 0x10000]), {
          oUnicodeRange: new Set(),
          oCodePageRange: pages,
        }),
      ),
    ).toBe("简繁");
  } finally {
    has.mockRestore();
  }
});

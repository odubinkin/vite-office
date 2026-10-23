/** @fileoverview Native font-dropdown sample decisions from svtools/source/misc/sampletext.cxx; no font support is inferred from a CSS family name. */
import { UScriptCode as S } from "../../../external/icu/source/common/unicode/uscript";
import { unicode } from "../../../i18nutil/source/utility/unicode";
import { equalAscii } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { IsOpenSymbol } from "../../../unotools/source/misc/fontdefs";
import { RTL_TEXTENCODING_SYMBOL } from "../../../sal/inc/rtl/textenc";
import { ASIAN, WEAK } from "../../../offapi/com/sun/star/i18n/ScriptType";
import {
  UnicodeCoverage as U,
  CodePageCoverage as C,
  type FontCapabilities,
} from "../../../vcl/inc/fontcapabilities";
import type { Font } from "../../../vcl/source/font/font";
import type { FontCharMap } from "../../../vcl/source/font/fontcharmap";
import { coverageScripts, minimalSamples, shortSamples } from "./sampletext-data";

/** Actual OutputDevice read contracts consumed by the native sample helpers. */
export interface FontSampleDevice {
  GetFont(): Font;
  HasGlyphs(font: Font, text: string): number;
  GetFontCharMap(): FontCharMap | undefined;
  GetFontCapabilities(): FontCapabilities | undefined;
}

const symbolNames = [
  "Apple Color Emoji",
  "cmsy10",
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
] as const;

/** Adapts a family string to the existing native first-token OpenSymbol predicate. @param name - Exact logical family. @returns Recognition. */
function isOpenSymbol(name: string): boolean {
  const units = new Uint16Array(name.length);
  for (let i = 0; i < name.length; ++i) units[i] = name.charCodeAt(i);
  return IsOpenSymbol(units);
}

/** Retains native SYMBOL encoding, ASCII-insensitive exceptions and case-sensitive STIX prefixes. @param font - Actual font metadata. @returns Symbol classification. */
export function isSymbolFont(font: Font): boolean {
  const name = font.GetFamilyName();
  return (
    font.GetCharSet() === RTL_TEXTENCODING_SYMBOL ||
    symbolNames.some(
      /** Compares an original exception. @param value - Source spelling. @returns Match. */
      (value) => equalAscii(name, value),
    ) ||
    ["STIXIntegrals", "STIXNonUnicode", "STIXSize", "STIXVariants"].some(
      /** Matches a source case-sensitive prefix. @param value - Prefix. @returns Match. */
      (value) => name.startsWith(value),
    ) ||
    isOpenSymbol(name)
  );
}

/** Uses the actual face map rather than browser font fallback to decide name rendering. @param device - Current device. @returns Whether the face may draw its own name. */
export function canRenderNameOfSelectedFont(device: FontSampleDevice): boolean {
  const font = device.GetFont();
  return !isSymbolFont(font) && device.HasGlyphs(font, font.GetFamilyName()) === -1;
}

/** Returns the exact source short script sample, including empty unsupported scripts. @param script - Native identity. @returns Sample. */
export function makeShortRepresentativeTextForScript(script: S): string {
  return shortSamples[script] ?? "";
}

/** Returns the source partial Hebrew/Greek samples. @param script - Native identity. @returns Sample. */
export function makeShortMinimalTextForScript(script: S): string {
  return minimalSamples[script] ?? "";
}

/** Maps native OS/2 coverage identities without inferring a script from glyph shapes. @param coverage - OS/2 bit. @returns Source script. */
export function otCoverageToScript(coverage: U): S {
  return coverageScripts[coverage] ?? S.USCRIPT_COMMON;
}

/** Retains source exceptions for faces with missing or incorrectly advertised OS/2 data. @param name - Exact native family. @returns Exception or invalid sentinel. */
function hardCodedScript(name: string): S {
  if (name === "GB18030 Bitmap") return S.USCRIPT_HAN;
  if (name === "BiauKai") return S.USCRIPT_TRADITIONAL_HAN;
  if (["GungSeo", "PCMyungjo", "PilGi"].includes(name)) return S.USCRIPT_KOREAN;
  if (name === "Hei" || name === "Kai") return S.USCRIPT_HAN;
  const prefixes: readonly (readonly [string, S])[] = [
    ["Bangla ", S.USCRIPT_BENGALI],
    ["Gurmukhi ", S.USCRIPT_GURMUKHI],
    ["Kannada ", S.USCRIPT_KANNADA],
    ["Lao ", S.USCRIPT_LAO],
    ["Malayalam ", S.USCRIPT_MALAYALAM],
    ["Sinhala ", S.USCRIPT_SINHALA],
    ["Telugu ", S.USCRIPT_TELUGU],
    ["Myanmar ", S.USCRIPT_MYANMAR],
  ];
  for (const [prefix, script] of prefixes) if (name.startsWith(prefix)) return script;
  if (name === "InaiMathi") return S.USCRIPT_TAMIL;
  if (["Hannotate TC", "HanziPen TC", "Heiti TC", "Weibei TC"].includes(name))
    return S.USCRIPT_TRADITIONAL_HAN;
  if (["Hannotate SC", "HanziPen SC", "Heiti SC", "Weibei SC"].includes(name))
    return S.USCRIPT_SIMPLIFIED_HAN;
  return S.USCRIPT_INVALID_CODE;
}

/** Original getScript reduction after the caller removes common Latin bits. @param capabilities - Actual face's advertised bitsets. @returns Source script decision. */
function getScript(capabilities: FontCapabilities): S {
  const masked = new Set<number>();
  for (const bit of capabilities.oUnicodeRange ?? [])
    if (unicode.getScriptClassFromUScriptCode(otCoverageToScript(bit)) !== WEAK) masked.add(bit);
  /** Resolves the only bit using native increasing-bit iteration. @returns Script. */
  function single(): S {
    return otCoverageToScript([...masked][0] as U);
  }
  if (masked.size === 1) return single();
  if (masked.has(U.ARABIC)) {
    masked.delete(U.ARABIC_PRESENTATION_FORMS_A);
    masked.delete(U.ARABIC_PRESENTATION_FORMS_B);
    masked.delete(U.NKO);
    if (masked.size === 1) return S.USCRIPT_ARABIC;
    if (masked.size === 2 && masked.has(U.SYRIAC)) return S.USCRIPT_SYRIAC;
  }
  if (masked.has(U.DEVANAGARI)) {
    masked.delete(U.DEVANAGARI);
    if (masked.size === 1) return single();
  }
  masked.delete(U.GREEK_EXTENDED);
  masked.delete(U.GREEK_AND_COPTIC);
  masked.delete(U.ARABIC_PRESENTATION_FORMS_B);
  if (masked.size === 1) return single();
  if (masked.has(U.CYRILLIC) && masked.size === 2 && masked.has(U.GEORGIAN))
    return S.USCRIPT_GEORGIAN;
  for (const bit of masked)
    if (unicode.getScriptClassFromUScriptCode(otCoverageToScript(bit)) === ASIAN)
      masked.delete(bit);
  masked.delete(U.CYRILLIC);
  masked.delete(U.THAI);
  masked.delete(U.DESERET);
  masked.delete(U.PHAGS_PA);
  const advertisedCodepages = capabilities.oCodePageRange;
  if (masked.size === 0 && advertisedCodepages !== undefined) {
    const codepages = new Set(
      [C.CP932, C.CP936, C.CP949, C.CP950, C.CP1361].filter(
        /** Applies the original CJK mask. @param bit - Codepage bit. @returns Whether advertised. */
        (bit) => advertisedCodepages.has(bit),
      ),
    );
    if (codepages.has(C.CP1361)) {
      codepages.add(C.CP949);
      codepages.delete(C.CP1361);
    }
    if (codepages.size === 1) {
      if (codepages.has(C.CP932)) return S.USCRIPT_JAPANESE;
      if (codepages.has(C.CP949)) return S.USCRIPT_KOREAN;
      if (codepages.has(C.CP936)) return S.USCRIPT_SIMPLIFIED_HAN;
      if (codepages.has(C.CP950)) return S.USCRIPT_TRADITIONAL_HAN;
    }
    if (codepages.size !== 0) return S.USCRIPT_HAN;
  }
  return S.USCRIPT_COMMON;
}

/** Disambiguates advertised Han using native glyph tests and std::map iteration order. @param script - Initial decision. @param device - Current face. @returns Source CJK decision. */
function disambiguateHan(script: S, device: FontSampleDevice): S {
  if (script !== S.USCRIPT_HAN) return script;
  const font = device.GetFont();
  const korean = device.HasGlyphs(font, "乭乶奬") === -1;
  const japanese = device.HasGlyphs(font, "奨枠鶏") === -1;
  const traditional = device.HasGlyphs(font, "啟雞") === -1;
  const simplified = device.HasGlyphs(font, "乡启奖") === -1;
  if (korean && !japanese && !simplified && !traditional) return S.USCRIPT_KOREAN;
  if (japanese && !korean && !simplified && !traditional) return S.USCRIPT_JAPANESE;
  if (simplified && !traditional && !korean && !japanese) return S.USCRIPT_SIMPLIFIED_HAN;
  if (traditional && !simplified && !korean && !japanese) return S.USCRIPT_TRADITIONAL_HAN;
  const names: readonly (readonly [S, readonly string[]])[] = [
    [S.USCRIPT_SIMPLIFIED_HAN, [" SC", " GB", "S Chinese"]],
    [S.USCRIPT_TRADITIONAL_HAN, [" TC", " HC", " TW", " HK", " MO", "T Chinese"]],
    [S.USCRIPT_JAPANESE, [" JP", "Japanese"]],
    [S.USCRIPT_KOREAN, [" KR", "Korean"]],
  ];
  for (const [candidate, strings] of names)
    for (const value of strings) if (font.GetFamilyName().indexOf(value) > 0) return candidate;
  return script;
}

/** Native advertised-script sample, retaining common-Latin masking and glyph validation. @param device - Real face device. @returns Suitable source sample or empty text. */
export function makeShortRepresentativeTextForSelectedFont(device: FontSampleDevice): string {
  let script = hardCodedScript(device.GetFont().GetFamilyName());
  if (script === S.USCRIPT_INVALID_CODE) {
    const capabilities = device.GetFontCapabilities();
    if (capabilities === undefined) return "";
    const ranges =
      capabilities.oUnicodeRange === undefined ? undefined : new Set(capabilities.oUnicodeRange);
    for (const bit of [
      U.BASIC_LATIN,
      U.LATIN_1_SUPPLEMENT,
      U.LATIN_EXTENDED_A,
      U.LATIN_EXTENDED_B,
      U.LATIN_EXTENDED_ADDITIONAL,
    ])
      ranges?.delete(bit);
    script = getScript({ ...capabilities, oUnicodeRange: ranges });
    if (script === S.USCRIPT_COMMON) return "";
    script = disambiguateHan(script, device);
  }
  const sample = makeShortRepresentativeTextForScript(script);
  return device.HasGlyphs(device.GetFont(), sample) === -1 ? sample : "";
}

/** Original symbol sample construction, including seven-character reverse charmap traversal and UTF16 narrowing. @param device - Current font face. @returns Renderable native sample. */
export function makeShortRepresentativeSymbolTextForSelectedFont(device: FontSampleDevice): string {
  const font = device.GetFont();
  if (font.GetFamilyName() === "Symbol")
    return device.HasGlyphs(font, "μ∂∑∏π∫Ω√") === -1
      ? "μ∂∑∏π∫Ω√"
      : "\uf06d\uf0b6\uf0e5\uf0d5\uf070\uf0f2\uf057\uf0d6";
  const openSymbol = isOpenSymbol(font.GetFamilyName());
  if (!openSymbol) {
    const map = device.GetFontCharMap();
    if (map !== undefined) {
      let current = 0xff00;
      const skip = Math.max(1, Math.min(10, Math.trunc(map.GetCharCount() / 7)));
      let result = "";
      for (let i = 0; i < 7; ++i) {
        const old = current;
        for (let j = skip; --j >= 0;) current = map.GetPrevChar(current);
        if (old === current) break;
        const unit = current & 0xffff;
        // The original sal_Unicode buffer is converted as a NUL-terminated string.
        if (unit === 0) return result;
        result += String.fromCharCode(unit);
      }
      return result;
    }
  }
  const sample = openSymbol ? "✂✈✍\ue033∑⊈" : "\uf021\uf032\uf043\uf054\uf065\uf076\uf0b7\uf0c8";
  return device.HasGlyphs(font, sample) === -1 ? sample : "";
}

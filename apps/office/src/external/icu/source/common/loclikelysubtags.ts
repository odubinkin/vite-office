/** @fileoverview Original ICU78.3 LikelySubtags from loclikelysubtags.h/cpp, over the actual langInfo loader, LSR owners and serialized BytesTrie. Logical singleton/data transfer follows source; native allocation/mutex/destruction, EBCDIC and unrelated LocaleDistance matching remain uncertified. */
/* eslint-disable no-useless-assignment -- Preserve original source retain/cache bookkeeping and assertion-only assignments. */
import { BytesTrie } from "./unicode/bytestrie";
import { UStringTrieResult as R, USTRINGTRIE_HAS_NEXT } from "./unicode/ustringtrie";
import { LSR } from "./lsr";
import {
  LikelySubtagsData,
  LocaleDistanceData,
  type LocaleDistanceDataConstReference,
} from "./loclikelysubtags.data";
import { CharStringMap } from "./charstrmap";
import type { LocaleConstReference } from "./locid";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
const MACROREGION_HARDCODE = [
  "001~3",
  "005",
  "009",
  "011",
  "013~5",
  "017~9",
  "021",
  "029",
  "030",
  "034~5",
  "039",
  "053~4",
  "057",
  "061",
  "142~3",
  "145",
  "150~1",
  "154~5",
  "202",
  "419",
  "EU",
  "EZ",
  "QO",
  "UN",
];
/** Original range expansion into the release-build macroregion list. @param region - Source range. @param result - Ordered owner. @returns Nothing. */
function processMacroregionRange(region: string, result: string[]): void {
  const marker = region.indexOf("~");
  if (marker > 0) {
    const end = region.charCodeAt(marker + 1),
      prefix = region.slice(0, marker - 1);
    for (let c = region.charCodeAt(marker - 1); c <= end; ++c)
      result.push(prefix + String.fromCharCode(c));
  } else result.push(region);
}
/** Original source release static macroregion data. @returns Ordered regions. */
function getStaticMacroregions(): readonly string[] {
  const regions: string[] = [];
  for (const range of MACROREGION_HARDCODE) processMacroregionRange(range, regions);
  return regions;
}
/** Original C prefix projection used only at C-pointer overload boundaries. @param text - Narrow storage. @returns C prefix. */
function cstring(text: string): string {
  const n = text.indexOf("\0");
  return n < 0 ? text : text.slice(0, n);
}
/** Original canonical alias lookup retains unrecognized input. @param aliases - Borrowed map. @param alias - C subtag. @returns C replacement/original. */
function getCanonical(aliases: CharStringMap, alias: string): string {
  return aliases.get(alias) ?? alias;
}
/** Original likely-subtag service. */
export class LikelySubtags {
  static readonly SKIP_SCRIPT = 1;
  private static singleton: LikelySubtags | null = null;
  private static macroregions: readonly string[] | null = null;
  private readonly languageAliases: CharStringMap;
  private readonly regionAliases: CharStringMap;
  private readonly trie: BytesTrie;
  private readonly trieUndState: bigint;
  private readonly trieUndZzzzState: bigint;
  private readonly defaultLsrIndex: number;
  private readonly trieFirstLetterStates: bigint[] = Array<bigint>(26);
  private readonly lsrs: readonly LSR[];
  private readonly distanceData: LocaleDistanceData;
  private readonly langInfoBundle;
  private readonly strings;
  /** Original source data transfer and trie-prefix caches. @param data - Successfully loaded owner. @returns Service. */
  private constructor(data: LikelySubtagsData) {
    this.langInfoBundle = data.langInfoBundle;
    this.strings = data.strings.orphanCharStrings();
    this.languageAliases = CharStringMap.move(data.languageAliases);
    this.regionAliases = CharStringMap.move(data.regionAliases);
    this.trie = new BytesTrie(data.trieBytes as readonly number[]);
    this.lsrs = data.lsrs as readonly LSR[];
    this.distanceData = LocaleDistanceData.move(data.distanceData);
    // The native destructor owns these stores; retain their logical lifetime in this owner.
    void this.langInfoBundle;
    void this.strings;
    data.langInfoBundle = null;
    data.lsrs = null;
    this.trie.next(42);
    this.trieUndState = this.trie.getState64();
    this.trie.next(42);
    this.trieUndZzzzState = this.trie.getState64();
    this.trie.next(42);
    this.defaultLsrIndex = this.trie.getValue();
    this.trie.reset();
    for (let c = 97; c <= 122; ++c) {
      const result = this.trie.next(c);
      if (result === R.USTRINGTRIE_NO_VALUE)
        this.trieFirstLetterStates[c - 97] = this.trie.getState64();
      this.trie.reset();
    }
  }
  /** Original sticky incoming-error guard and lazy shared owner. @param status - Status. @returns Borrowed service/null. */
  static getSingleton(status: [number]): LikelySubtags | null {
    if (U_FAILURE(status[0])) return null;
    if (this.singleton === null) {
      const data = new LikelySubtagsData(status);
      data.load(status);
      if (U_FAILURE(status[0])) {
        data.close();
        return null;
      }
      this.singleton = new LikelySubtags(data);
      data.close();
      this.macroregions = getStaticMacroregions();
    }
    return this.singleton;
  }
  /** Original locale-distance data borrowed reference, without invoking matching services. @returns Loaded data. */
  getDistanceData(): LocaleDistanceDataConstReference {
    return this.distanceData;
  }
  /** Original public Locale dispatch, including bogus and private-use handling. @param locale - Actual Locale. @param returnInputIfUnmatch - Source control. @param status - Status. @returns LSR. */
  makeMaximizedLsrFrom(
    locale: LocaleConstReference,
    returnInputIfUnmatch: boolean,
    status: [number],
  ): LSR {
    if (U_FAILURE(status[0])) return new LSR();
    if (locale.isBogus()) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      return new LSR();
    }
    const name = locale.getName();
    if (!returnInputIfUnmatch && name.startsWith("@x="))
      return new LSR(name, "", "", LSR.EXPLICIT_LSR);
    const max = this.makeMaximizedLsr(
      locale.getLanguage(),
      locale.getScript(),
      locale.getCountry(),
      locale.getVariant(),
      returnInputIfUnmatch,
      status,
    );
    if (max.language === "" && max.script === "" && max.region === "")
      return new LSR(
        locale.getLanguage(),
        locale.getScript(),
        locale.getCountry(),
        LSR.EXPLICIT_LSR,
        status,
      );
    return max;
  }
  /** Original C overload handles pseudo locales before canonical alias maps. @param language - C language. @param script - C script. @param region - C region. @param variant - C variant. @param returnInputIfUnmatch - Source mode. @param status - Status. @returns LSR. */
  private makeMaximizedLsr(
    language: string,
    script: string,
    region: string,
    variant: string,
    returnInputIfUnmatch: boolean,
    status: [number],
  ): LSR {
    if (U_FAILURE(status[0])) return new LSR();
    language = cstring(language);
    script = cstring(script);
    region = cstring(region);
    variant = cstring(variant);
    if (!returnInputIfUnmatch) {
      if (region.length === 2 && region[0] === "X") {
        switch (region[1]) {
          case "A":
            return new LSR(39, language, script, region, LSR.EXPLICIT_LSR, status);
          case "B":
            return new LSR(43, language, script, region, LSR.EXPLICIT_LSR, status);
          case "C":
            return new LSR(44, language, script, region, LSR.EXPLICIT_LSR, status);
        }
      }
      if (variant.startsWith("PS")) {
        const flags =
          region.length === 0 ? LSR.EXPLICIT_LANGUAGE | LSR.EXPLICIT_SCRIPT : LSR.EXPLICIT_LSR;
        if (variant === "PSACCENT")
          return new LSR(39, language, script, region.length === 0 ? "XA" : region, flags, status);
        if (variant === "PSBIDI")
          return new LSR(43, language, script, region.length === 0 ? "XB" : region, flags, status);
        if (variant === "PSCRACK")
          return new LSR(44, language, script, region.length === 0 ? "XC" : region, flags, status);
      }
    }
    return this.maximize(
      getCanonical(this.languageAliases, language),
      script,
      getCanonical(this.regionAliases, region),
      returnInputIfUnmatch,
      status,
    );
  }
  /** Original counted-string macroregion lookup. @param region - Counted narrow region. @param status - Status. @returns Listed macroregion. */
  private isMacroregion(region: string, status: [number]): boolean {
    if (U_FAILURE(status[0])) return false;
    return (LikelySubtags.macroregions as readonly string[]).includes(region);
  }
  /** Original counted maximize algorithm and retain flags; no inferred fallback rules are added. @param language - Counted language. @param script - Counted script. @param region - Counted region. @param returnInputIfUnmatch - Source mode. @param status - Status. @returns LSR. */
  private maximize(
    language: string,
    script: string,
    region: string,
    returnInputIfUnmatch: boolean,
    status: [number],
  ): LSR {
    if (U_FAILURE(status[0])) return new LSR();
    if (language === "und") language = "";
    if (script === "Zzzz") script = "";
    if (region === "ZZ") region = "";
    if (script !== "" && region !== "" && language !== "")
      return new LSR(language, script, region, LSR.EXPLICIT_LSR, status);
    let retainLanguage = false,
      retainScript = false,
      retainRegion = false;
    const iter = new BytesTrie(this.trie);
    let state: bigint = 0n,
      value: number;
    const c0 = (language.charCodeAt(0) || 0) - 97;
    if (
      c0 >= 0 &&
      c0 <= 25 &&
      language.length >= 2 &&
      (state = this.trieFirstLetterStates[c0] as bigint) !== 0n
    )
      value = LikelySubtags.trieNext(iter.resetToState64(state), language, 1);
    else value = LikelySubtags.trieNext(iter, language, 0);
    const matchLanguage = value >= 0;
    let matchScript = false;
    if (value >= 0) {
      retainLanguage = language !== "";
      state = iter.getState64();
    } else {
      retainLanguage = true;
      iter.resetToState64(this.trieUndState);
      state = 0n;
    }
    if (value >= 0 && script !== "") matchScript = true;
    if (value > 0) {
      if (value === LikelySubtags.SKIP_SCRIPT) value = 0;
      retainScript = script !== "";
    } else {
      value = LikelySubtags.trieNext(iter, script, 0);
      if (value >= 0) {
        retainScript = script !== "";
        state = iter.getState64();
      } else {
        retainScript = true;
        if (state === 0n) iter.resetToState64(this.trieUndZzzzState);
        else {
          iter.resetToState64(state);
          value = LikelySubtags.trieNext(iter, "", 0);
          state = iter.getState64();
        }
      }
    }
    let matchRegion = false;
    if (value > 0) retainRegion = region !== "";
    else {
      value = LikelySubtags.trieNext(iter, region, 0);
      if (value >= 0) {
        if (region !== "" && !this.isMacroregion(region, status)) {
          retainRegion = true;
          matchRegion = true;
        }
      } else {
        retainRegion = true;
        if (state === 0n) value = this.defaultLsrIndex;
        else {
          iter.resetToState64(state);
          value = LikelySubtags.trieNext(iter, "", 0);
          if (value < 0) {
            retainLanguage = language !== "";
            retainScript = script !== "";
            retainRegion = region !== "";
            iter.resetToState64(this.trieUndState);
            value = LikelySubtags.trieNext(iter, "", 0);
            const trieUndEmptyState = iter.getState64();
            value = LikelySubtags.trieNext(iter, region, 0);
            if (value < 0) {
              iter.resetToState64(trieUndEmptyState);
              value = LikelySubtags.trieNext(iter, "", 0);
            }
          }
        }
      }
    }
    if (returnInputIfUnmatch && !(matchLanguage || matchScript || (matchRegion && language === "")))
      return new LSR("", "", "", LSR.EXPLICIT_LSR, status);
    if (language === "") language = "und";
    const matched = this.lsrs[value] as LSR;
    if (!(retainLanguage || retainScript || retainRegion))
      return new LSR(
        matched.language as string,
        matched.script as string,
        matched.region as string,
        matched.flags,
      );
    if (!retainLanguage) language = matched.language as string;
    if (!retainScript) script = matched.script as string;
    if (!retainRegion) region = matched.region as string;
    return new LSR(
      language,
      script,
      region,
      (retainLanguage ? 4 : 0) + (retainScript ? 2 : 0) + (retainRegion ? 1 : 0),
      status,
    );
  }
  /** Original likely comparison/cache bits, including source getLikelyIndex(language, region) call. @param lsr - Candidate. @param other - Other. @param likelyInfo - Negative initial or cached bits. @returns Updated bits. */
  compareLikely(lsr: LSR, other: LSR, likelyInfo: number): number {
    likelyInfo |= 0;
    if (lsr.language !== other.language) return -4;
    if (lsr.script !== other.script) {
      let index: number;
      if (likelyInfo >= 0 && (likelyInfo & 2) === 0) index = likelyInfo >> 2;
      else {
        index = this.getLikelyIndex(lsr.language as string, "");
        likelyInfo = index << 2;
      }
      return lsr.script === (this.lsrs[index] as LSR).script ? likelyInfo | 1 : likelyInfo & ~1;
    }
    if (lsr.region !== other.region) {
      let index: number;
      if (likelyInfo >= 0 && (likelyInfo & 2) !== 0) index = likelyInfo >> 2;
      else {
        index = this.getLikelyIndex(lsr.language as string, lsr.region as string);
        likelyInfo = (index << 2) | 2;
      }
      return lsr.region === (this.lsrs[index] as LSR).region ? likelyInfo | 1 : likelyInfo & ~1;
    }
    return likelyInfo & ~1;
  }
  /** Original subset lookup preserves the same source fallback/cache control flow. @param language - C language. @param script - C script. @returns Index. */
  private getLikelyIndex(language: string, script: string): number {
    language = cstring(language);
    script = cstring(script);
    if (language === "und") language = "";
    if (script === "Zzzz") script = "";
    const iter = new BytesTrie(this.trie);
    let state = 0n,
      value: number;
    const c0 = (language.charCodeAt(0) || 0) - 97;
    if (
      c0 >= 0 &&
      c0 <= 25 &&
      language.length >= 2 &&
      (state = this.trieFirstLetterStates[c0] as bigint) !== 0n
    )
      value = LikelySubtags.trieNext(iter.resetToState64(state), language, 1);
    else value = LikelySubtags.trieNext(iter, language, 0);
    if (value >= 0) state = iter.getState64();
    else {
      iter.resetToState64(this.trieUndState);
      state = 0n;
    }
    if (value > 0) {
      if (value === LikelySubtags.SKIP_SCRIPT) value = 0;
    } else {
      value = LikelySubtags.trieNext(iter, script, 0);
      if (value >= 0) state = iter.getState64();
      else if (state === 0n) iter.resetToState64(this.trieUndZzzzState);
      else {
        iter.resetToState64(state);
        value = LikelySubtags.trieNext(iter, "", 0);
        state = iter.getState64();
      }
    }
    if (value <= 0) value = LikelySubtags.trieNext(iter, "", 0);
    return value;
  }
  /** Original StringPiece trieNext, with per-subtag final high bit and star encoding; the C overload supplies its C prefix at callers. @param iter - Reader. @param s - Counted narrow subtag. @param i - Initial byte offset. @returns Minus1/no-value/skip/final index. */
  private static trieNext(iter: BytesTrie, s: string, i: number): number {
    let result: R;
    if (s.length === i) result = iter.next(42);
    else {
      let c = s.charCodeAt(i) & 255;
      for (;;) {
        if (i + 1 !== s.length) {
          if (!USTRINGTRIE_HAS_NEXT(iter.next(c))) return -1;
          c = s.charCodeAt(++i) & 255;
        } else {
          result = iter.next(c | 128);
          break;
        }
      }
    }
    switch (result) {
      case R.USTRINGTRIE_NO_MATCH:
        return -1;
      case R.USTRINGTRIE_NO_VALUE:
        return 0;
      case R.USTRINGTRIE_INTERMEDIATE_VALUE:
        return LikelySubtags.SKIP_SCRIPT;
      case R.USTRINGTRIE_FINAL_VALUE:
        return iter.getValue();
      default:
        return -1;
    }
  }
  /** Original minimization tries language, preferred pair, alternate pair, then full maximum. @param language - Counted language. @param script - Counted script. @param region - Counted region. @param favorScript - Preference. @param status - Status. @returns LSR. */
  minimizeSubtags(
    language: string,
    script: string,
    region: string,
    favorScript: boolean,
    status: [number],
  ): LSR {
    if (U_FAILURE(status[0])) return new LSR();
    const max = this.maximize(language, script, region, true, status);
    if (U_FAILURE(status[0])) return new LSR();
    if (max.language === "" && max.script === "" && max.region === "")
      return new LSR(language, script, region, LSR.EXPLICIT_LSR, status);
    let test = this.maximize(max.language as string, "", "", true, status);
    if (U_FAILURE(status[0])) return new LSR();
    if (test.isEquivalentTo(max))
      return new LSR(max.language as string, "", "", LSR.DONT_CARE_FLAGS, status);
    if (!favorScript) {
      test = this.maximize(max.language as string, "", max.region as string, true, status);
      if (U_FAILURE(status[0])) return new LSR();
      if (test.isEquivalentTo(max))
        return new LSR(
          max.language as string,
          "",
          max.region as string,
          LSR.DONT_CARE_FLAGS,
          status,
        );
    }
    test = this.maximize(max.language as string, max.script as string, "", true, status);
    if (U_FAILURE(status[0])) return new LSR();
    if (test.isEquivalentTo(max))
      return new LSR(max.language as string, max.script as string, "", LSR.DONT_CARE_FLAGS, status);
    if (favorScript) {
      test = this.maximize(max.language as string, "", max.region as string, true, status);
      if (U_FAILURE(status[0])) return new LSR();
      if (test.isEquivalentTo(max))
        return new LSR(
          max.language as string,
          "",
          max.region as string,
          LSR.DONT_CARE_FLAGS,
          status,
        );
    }
    return new LSR(
      max.language as string,
      max.script as string,
      max.region as string,
      LSR.DONT_CARE_FLAGS,
      status,
    );
  }
}

/** @fileoverview Consumed original ICU78.3 Locale constructors, ordinary init payload/getters, clone/copy, root/default ownership and strict forLanguageTag factory. Modern alias-resource canonicalization and likely-subtag APIs remain unported. */
import { ByteSinkUtil } from "./bytesinkutil";
import type { ByteStringSink } from "./unicode/bytestream";
import { ulocimp_getKeywordValue, uloc_getKeywordValue } from "./uloc.keywordvalue";
import { ulocimp_toLegacyKeyWithFallback, ulocimp_toBcpTypeWithFallback } from "./uloc.keytype";
import { ulocimp_getName } from "./uloc.normalize";
import { ulocimp_forLanguageTag } from "./uloc_tag.convert";
import { getDefaultLocale, locale_set_default_internal } from "./locid.default";
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
/** Native internal constructor discriminant; not exported as a client locale option. */
enum ELocaleType {
  eBOGUS,
}
/** Native logical Nest/Heap field ownership. Inline/heap byte capacity, allocator/move/destructor and ABI are not simulated. */
type Payload =
  | { type: "bogus" }
  | {
      type: "nest" | "heap";
      fullName: string;
      baseName: string;
      language: string;
      script: string;
      region: string;
      variantBegin: number;
    };
/** Native borrowed const reference surface for the currently ported methods. */
export type LocaleConstReference = Readonly<Omit<Locale, "assign" | "setToBogus">>;
/** Original C-string prefix boundary. @param text - Counted storage/null. @returns Prefix/null. */
function cstring(text: string | null): string | null {
  if (text === null) return null;
  const i = text.indexOf("\0");
  return i < 0 ? text : text.slice(0, i);
}
/** Original Locale owner with independent copied payload and shared borrowed root/default objects. */
export class Locale {
  private payload: Payload = { type: "bogus" };
  private static fixedCache: Locale[] | null = null;
  /* eslint-disable @typescript-eslint/unified-signatures -- Preserve the original default, copy, component and internal constructor boundaries. */
  /** Original default constructor. @returns Locale. */
  constructor();
  /** Original const-reference copy constructor. @param source - Actual Locale. @returns Locale. */
  constructor(source: LocaleConstReference);
  /** Original component constructor. @param language - C language/full ID. @param country - Optional C country. @param variant - Optional C variant. @param keywords - Optional C keyword string. @returns Locale. */
  constructor(
    language: string | null,
    country?: string | null,
    variant?: string | null,
    keywords?: string | null,
  );
  /** Original side-effect-free internal constructor. @param type - Native internal discriminant. @returns Locale. */
  constructor(type: ELocaleType);
  /* eslint-enable @typescript-eslint/unified-signatures */
  /** Original overloads retain all-null default shortcut, variant underscore trimming, keyword-vs-script separator rules and C lengths. The internal bogus discriminant skips initialization. @param language - C language/full ID, copied owner or internal type. @param country - C country/null. @param variant - C variant/null. @param keywords - C keywords/null. @returns Locale. */
  constructor(
    language: string | null | LocaleConstReference | ELocaleType = null,
    country: string | null = null,
    variant: string | null = null,
    keywords: string | null = null,
  ) {
    if (typeof language === "number") return;
    if (typeof language === "object" && language !== null) {
      this.assign(language);
      return;
    }
    language = cstring(language);
    country = cstring(country);
    variant = cstring(variant);
    keywords = cstring(keywords);
    if (language === null && country === null && variant === null) {
      this.assign(Locale.getDefault());
      return;
    }
    if (language !== null && language.length > 357913941) return;
    if (country !== null && country.length > 357913941) return;
    let togo = language ?? "";
    if (variant !== null) {
      while (variant[0] === "_") variant = variant.slice(1);
      if (variant.length > 357913941) return;
      while (variant.length > 1 && variant[variant.length - 1] === "_")
        variant = variant.slice(0, -1);
    }
    if (keywords !== null && keywords.length > 357913941) return;
    const csize = country?.length ?? 0,
      vsize = variant?.length ?? 0;
    if (vsize !== 0 || csize !== 0) togo += "_";
    if (csize !== 0) togo += country;
    if (vsize !== 0) togo += "_" + variant;
    if (keywords !== null && keywords.length !== 0) {
      if (keywords.includes("=")) togo += "@";
      else {
        togo += "_";
        if (vsize === 0) togo += "_";
      }
      togo += keywords;
    }
    this.init(togo);
  }
  /** Original ordinary init branch; source field/payload selection is retained, without certifying native capacity/OOM or modern canonicalize=true alias processing. @param localeID - Explicit non-null C locale ID. @returns This owner. */
  private init(localeID: string): this {
    this.payload = { type: "bogus" };
    const status: [number] = [0];
    let buffer = new Uint8Array(17);
    let required = ByteSinkUtil.viaByteSinkToTerminatedChars(
      buffer,
      17,
      /** Uses the actual native init parse path. @param sink - Checked owner. @param s - Status. @returns Nothing. */ (
        sink,
        s,
      ) => ulocimp_getName(localeID, sink, s),
      status,
    );
    if (status[0] === UErrorCode.U_BUFFER_OVERFLOW_ERROR || required >= 17) {
      buffer = new Uint8Array(required + 1);
      status[0] = 0;
      required = ByteSinkUtil.viaByteSinkToTerminatedChars(
        buffer,
        required + 1,
        /** Retries with the original required length plus NUL. @param sink - Checked owner. @param s - Status. @returns Nothing. */ (
          sink,
          s,
        ) => ulocimp_getName(localeID, sink, s),
        status,
      );
    }
    if (U_FAILURE(status[0]) || status[0] === UErrorCode.U_STRING_NOT_TERMINATED_WARNING)
      return this;
    let fullName = "";
    for (let i = 0; i < required; ++i) fullName += String.fromCharCode(buffer[i] as number);
    const length = fullName.length,
      field = [0, 0, 0, 0, 0],
      fieldLen = [0, 0, 0, 0, 0],
      cname = cstring(fullName) as string,
      at = cname.indexOf("@");
    let fieldIdx = 1;
    for (;;) {
      const separator = cname.indexOf("_", field[fieldIdx - 1]);
      if (separator < 0 || fieldIdx >= 4 || (at >= 0 && separator >= at)) break;
      field[fieldIdx] = separator + 1;
      fieldLen[fieldIdx - 1] = separator - (field[fieldIdx - 1] as number);
      ++fieldIdx;
    }
    let separator = cname.indexOf("@", field[fieldIdx - 1]);
    const sep2 = cname.indexOf(".", field[fieldIdx - 1]);
    if (separator >= 0 || sep2 >= 0) {
      if (separator < 0 || (sep2 >= 0 && separator > sep2)) separator = sep2;
      fieldLen[fieldIdx - 1] = separator - (field[fieldIdx - 1] as number);
    } else fieldLen[fieldIdx - 1] = length - (field[fieldIdx - 1] as number);
    const hasKeywords = at >= 0 && cname.indexOf("=", at + 1) >= 0;
    if ((fieldLen[0] as number) >= 12) return this;
    let language = "",
      script = "",
      region = "",
      variantField = 1,
      variantBegin = length;
    if ((fieldLen[0] as number) > 0) language = fullName.slice(0, fieldLen[0]);
    const scriptValue = fullName.slice(field[1], (field[1] as number) + (fieldLen[1] as number));
    if (fieldLen[1] === 4 && /^[A-Za-z]{4}$/u.test(scriptValue)) {
      script = scriptValue;
      ++variantField;
    }
    if (fieldLen[variantField] === 2 || fieldLen[variantField] === 3) {
      region = fullName.slice(
        field[variantField],
        (field[variantField] as number) + (fieldLen[variantField] as number),
      );
      ++variantField;
    } else if (fieldLen[variantField] === 0) ++variantField;
    if ((fieldLen[variantField] as number) > 0) variantBegin = field[variantField] as number;
    else if (hasKeywords) variantBegin = at;
    const nested =
      !hasKeywords && length < 17 && language.length < 4 && script.length < 5 && region.length < 4;
    this.payload = {
      type: nested ? "nest" : "heap",
      fullName,
      baseName: nested ? fullName : hasKeywords && at > 0 ? fullName.slice(0, at) : "",
      language,
      script,
      region,
      variantBegin,
    };
    return this;
  }
  /** Original copy assignment preserves bogus/value state and independent payload ownership. @param source - Actual borrowed Locale. @returns This owner. */
  assign(source: LocaleConstReference): this {
    const actual = source as Locale;
    if (actual !== this) this.payload = { ...actual.payload };
    return this;
  }
  /** Original heap clone. @returns Owned copy. */
  clone(): Locale {
    return new Locale(this);
  }
  /** Original equality compares C names, including bogus versus root empty name. @param other - Borrowed Locale. @returns Equal names. */
  equals(other: LocaleConstReference): boolean {
    return other.getName() === this.getName();
  }
  /** Original bogus query. @returns Bogus state. */
  isBogus(): boolean {
    return this.payload.type === "bogus";
  }
  /** Original transition destroys the prior logical payload. @returns Nothing. */
  setToBogus(): void {
    this.payload = { type: "bogus" };
  }
  /** Original C language getter; bogus yields EMPTY. @returns Language. */
  getLanguage(): string {
    return this.payload.type === "bogus" ? "" : (cstring(this.payload.language) as string);
  }
  /** Original C script getter. @returns Script. */
  getScript(): string {
    return this.payload.type === "bogus" ? "" : (cstring(this.payload.script) as string);
  }
  /** Original C region getter. @returns Region. */
  getCountry(): string {
    return this.payload.type === "bogus" ? "" : (cstring(this.payload.region) as string);
  }
  /** Original full-name getter. @returns C name. */
  getName(): string {
    return this.payload.type === "bogus" ? "" : (cstring(this.payload.fullName) as string);
  }
  /** Original Nest versus Heap base-name rule, including root keywords. @returns C base name. */
  getBaseName(): string {
    const p = this.payload;
    if (p.type === "bogus") return "";
    return cstring(
      p.type === "nest"
        ? p.fullName
        : p.baseName.length === 0 && p.fullName[0] !== "@"
          ? p.fullName
          : p.baseName,
    ) as string;
  }
  /** Original variantBegin offset from getBaseName, not from a separately parsed variant string. Native out-of-range pointer outcomes are not certified. @returns C variant view. */
  getVariant(): string {
    return this.payload.type === "bogus" || this.payload.variantBegin === 0
      ? ""
      : (cstring(this.getBaseName().slice(this.payload.variantBegin)) as string);
  }
  /** Original C-buffer keyword getter has no separate bogus guard. @param name - C key/null. @param buffer - Writable output. @param capacity - Native capacity. @param status - Sticky status. @returns Result length. */
  getKeywordValue(
    name: string | null,
    buffer: Uint8Array | null,
    capacity: number,
    status: [number],
  ): number;
  /** Original counted-key ByteSink getter rejects bogus before dispatch. @param name - Counted key. @param sink - Output. @param status - Sticky status. @returns Nothing. */
  getKeywordValue(name: string, sink: ByteStringSink, status: [number]): void;
  /** Original overload dispatch preserves the distinct incoming-error/bogus/C-key rules. @param name - Key. @param output - Actual checked buffer or append owner. @param third - Capacity/status. @param fourth - C status. @returns Native result length or nothing. */
  getKeywordValue(
    name: string | null,
    output: Uint8Array | null | ByteStringSink,
    third: number | [number],
    fourth?: [number],
  ): number | void {
    if (typeof third === "number")
      return uloc_getKeywordValue(
        this.getName(),
        name,
        output as Uint8Array | null,
        third,
        fourth as [number],
      );
    if (U_FAILURE(third[0])) return;
    if (this.isBogus()) {
      third[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    ulocimp_getKeywordValue(this.getName(), name as string, output as ByteStringSink, third);
  }
  /** Original Unicode keyword getter uses actual legacy/value map views and the source ByteSink bogus guard. @param name - Counted Unicode key. @param sink - Output. @param status - Sticky status. @returns Nothing. */
  getUnicodeKeywordValue(name: string, sink: ByteStringSink, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    const key = ulocimp_toLegacyKeyWithFallback(name);
    if (key === null) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    let legacy = "";
    this.getKeywordValue(
      key.value,
      {
        /** Owns the actual intermediate CharString output. @param value - Span. @returns Nothing. */ Append(
          value: string,
        ) {
          legacy += value;
        },
      },
      status,
    );
    if (U_FAILURE(status[0])) return;
    const unicode = ulocimp_toBcpTypeWithFallback(name, legacy);
    if (unicode === null) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    sink.Append(unicode.value);
  }
  /** Original fixed cache constructs all19 default objects before assigning the explicit values. This retains initial host-default lookup even when the first query is getRoot. @param index - Source ELocalePos. @returns Borrowed fixed owner. */
  private static getLocale(index: number): LocaleConstReference {
    if (Locale.fixedCache === null) {
      const cache: Locale[] = [];
      for (let i = 0; i < 19; ++i) cache.push(new Locale());
      Locale.fixedCache = cache;
      cache[18] = new Locale("");
      const entries: readonly (readonly [string, string | null])[] = [
        ["en", null],
        ["fr", null],
        ["de", null],
        ["it", null],
        ["ja", null],
        ["ko", null],
        ["zh", null],
        ["fr", "FR"],
        ["de", "DE"],
        ["it", "IT"],
        ["ja", "JP"],
        ["ko", "KR"],
        ["zh", "CN"],
        ["zh", "TW"],
        ["en", "GB"],
        ["en", "US"],
        ["en", "CA"],
        ["fr", "CA"],
      ];
      for (let i = 0; i < entries.length; ++i) {
        const entry = entries[i] as readonly [string, string | null];
        cache[i] = new Locale(entry[0], entry[1]);
      }
    }
    return Locale.fixedCache[index] as Locale;
  }
  /** Original borrowed root cache entry. @returns Const locale. */
  static getRoot(): LocaleConstReference {
    return Locale.getLocale(18);
  }
  /** Original borrowed English cache entry. @returns Const locale. */
  static getEnglish(): LocaleConstReference {
    return Locale.getLocale(0);
  }
  /** Original borrowed French cache entry. @returns Const locale. */
  static getFrench(): LocaleConstReference {
    return Locale.getLocale(1);
  }
  /** Original borrowed German cache entry. @returns Const locale. */
  static getGerman(): LocaleConstReference {
    return Locale.getLocale(2);
  }
  /** Original borrowed Italian cache entry. @returns Const locale. */
  static getItalian(): LocaleConstReference {
    return Locale.getLocale(3);
  }
  /** Original borrowed Japanese cache entry. @returns Const locale. */
  static getJapanese(): LocaleConstReference {
    return Locale.getLocale(4);
  }
  /** Original borrowed Korean cache entry. @returns Const locale. */
  static getKorean(): LocaleConstReference {
    return Locale.getLocale(5);
  }
  /** Original borrowed Chinese cache entry. @returns Const locale. */
  static getChinese(): LocaleConstReference {
    return Locale.getLocale(6);
  }
  /** Original borrowed France cache entry. @returns Const locale. */
  static getFrance(): LocaleConstReference {
    return Locale.getLocale(7);
  }
  /** Original borrowed Germany cache entry. @returns Const locale. */
  static getGermany(): LocaleConstReference {
    return Locale.getLocale(8);
  }
  /** Original borrowed Italy cache entry. @returns Const locale. */
  static getItaly(): LocaleConstReference {
    return Locale.getLocale(9);
  }
  /** Original borrowed Japan cache entry. @returns Const locale. */
  static getJapan(): LocaleConstReference {
    return Locale.getLocale(10);
  }
  /** Original borrowed Korea cache entry. @returns Const locale. */
  static getKorea(): LocaleConstReference {
    return Locale.getLocale(11);
  }
  /** Original borrowed China cache entry. @returns Const locale. */
  static getChina(): LocaleConstReference {
    return Locale.getLocale(12);
  }
  /** Original borrowed PRC cache entry. @returns Const locale. */
  static getPRC(): LocaleConstReference {
    return Locale.getLocale(12);
  }
  /** Original borrowed simplified Chinese cache entry. @returns Const locale. */
  static getSimplifiedChinese(): LocaleConstReference {
    return Locale.getLocale(12);
  }
  /** Original borrowed Taiwan cache entry. @returns Const locale. */
  static getTaiwan(): LocaleConstReference {
    return Locale.getLocale(13);
  }
  /** Original borrowed traditional Chinese cache entry. @returns Const locale. */
  static getTraditionalChinese(): LocaleConstReference {
    return Locale.getLocale(13);
  }
  /** Original borrowed UK cache entry. @returns Const locale. */
  static getUK(): LocaleConstReference {
    return Locale.getLocale(14);
  }
  /** Original borrowed US cache entry. @returns Const locale. */
  static getUS(): LocaleConstReference {
    return Locale.getLocale(15);
  }
  /** Original borrowed Canada cache entry. @returns Const locale. */
  static getCanada(): LocaleConstReference {
    return Locale.getLocale(16);
  }
  /** Original borrowed Canada French cache entry. @returns Const locale. */
  static getCanadaFrench(): LocaleConstReference {
    return Locale.getLocale(17);
  }
  /** Original borrowed current default. @returns Const cached owner. */
  static getDefault(): LocaleConstReference {
    return getDefaultLocale();
  }
  /** Original source setter normalizes the supplied C name through the shared default cache. @param locale - Borrowed value. @param status - Sticky status. @returns Nothing. */
  static setDefault(locale: LocaleConstReference, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    locale_set_default_internal(locale.getName(), status);
  }
  /** Original strict StringPiece language-tag factory rejects an unconsumed suffix unlike the ordinary constructor. @param text - Counted narrow language tag. @param status - Sticky status. @returns Owned locale/bogus. */
  static forLanguageTag(text: string, status: [number]): Locale {
    const result = new Locale(ELocaleType.eBOGUS);
    if (U_FAILURE(status[0])) return result;
    let id = "";
    const parsed: [number] = [0];
    ulocimp_forLanguageTag(
      text,
      text.length,
      {
        /** Owns actual converted bytes. @param value - Span. @returns Nothing. */ Append(
          value: string,
        ) {
          id += value;
        },
      },
      parsed,
      status,
    );
    if (U_FAILURE(status[0])) return result;
    if (parsed[0] !== text.length) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return result;
    }
    result.init(cstring(id) as string);
    if (result.isBogus()) status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return result;
  }
}

/** @fileoverview Original ICU78.3 loclikely.cpp add/minimize wrappers and supplemental-region selection. Uses original canonicalizer/subtags, LSR/trie service and actual checked output buffers; modern alias canonicalization and calendar construction are separate modules. */
import { Locale } from "./locid";
import { locale_get_default } from "./locid.default";
import { ulocimp_canonicalize } from "./uloc.normalize";
import { ulocimp_getSubtags } from "./uloc.subtags";
import { ulocimp_getKeywordValue } from "./uloc.keywordvalue";
import { LikelySubtags } from "./loclikelysubtags";
import { LSR } from "./lsr";
import { ByteSinkUtil } from "./bytesinkutil";
import type { ByteStringSink } from "./unicode/bytestream";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
/** Source C string view. @param s - Narrow storage. @returns C prefix. */
function cstring(s: string): string {
  const n = s.indexOf("\0");
  return n < 0 ? s : s.slice(0, n);
}
/** Original variant subtag maximum checker. @param variant - Counted variant. @returns Each component has at most8 units. */
function CHECK_TRAILING_VARIANT_SIZE(variant: string): boolean {
  let count = 0;
  for (const c of variant) {
    if (c === "_" || c === "-") count = 0;
    else if (count === 8) return false;
    else ++count;
  }
  return true;
}
/** Original createTagStringWithAlternates for the actual nonnegative counted spans used by wrappers. @param language - Language. @param script - Script. @param region - Region. @param variant - Variant. @param trailing - Trailing text. @param sink - Output. @param status - Status. @returns Nothing. */
function createTagStringWithAlternates(
  language: string,
  script: string,
  region: string,
  variant: string,
  trailing: string,
  sink: ByteStringSink,
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  if (language.length >= 12 || script.length >= 6 || region.length >= 4) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  if (language.length > 0) sink.Append(language);
  if (script.length > 0) {
    sink.Append("_");
    sink.Append(script);
  }
  if (region.length > 0) {
    sink.Append("_");
    sink.Append(region);
  }
  if (variant.length > 0) {
    if (region.length === 0) sink.Append("_");
    sink.Append("_");
    sink.Append(variant);
  }
  if (trailing.length > 0) sink.Append(trailing);
}
/** Original private add/minimize dispatch retains their different four-letter-language validation and Locale versus raw-counted lookup. @param localeID - Canonical C ID. @param sink - Output. @param minimize - Source entry point. @param favorScript - Preference. @param status - Status. @returns Nothing. */
function transform(
  localeID: string,
  sink: ByteStringSink,
  minimize: boolean,
  favorScript: boolean,
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  localeID = cstring(localeID);
  const components = ["", "", "", ""];
  const sinks = components.map(
    /** Owns original intermediate CharString bytes. @param unused - Initial storage. @param i - Component. @returns Sink. */ (
      _,
      i,
    ) => ({
      /** Appends one source span. @param bytes - Span. @returns Nothing. */ Append(bytes: string) {
        components[i] += bytes;
      },
    }),
  );
  const end: [number] = [0];
  ulocimp_getSubtags(
    localeID,
    sinks[0] as ByteStringSink,
    sinks[1] as ByteStringSink,
    sinks[2] as ByteStringSink,
    sinks[3] as ByteStringSink,
    end,
    status,
  );
  if (U_FAILURE(status[0])) return;
  let language = components[0] as string,
    script = components[1] as string;
  const region = components[2] as string,
    variant = components[3] as string;
  if (!CHECK_TRAILING_VARIANT_SIZE(variant)) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  if (!minimize) {
    if (language.length === 4) {
      if (script.length === 0) {
        script = language;
        language = "";
      } else {
        status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
    } else if (language.length > 8) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
  }
  const likely = LikelySubtags.getSingleton(status);
  if (U_FAILURE(status[0])) return;
  let lsr: LSR;
  if (minimize)
    lsr = (likely as LikelySubtags).minimizeSubtags(language, script, region, favorScript, status);
  else {
    const locale = new Locale(localeID);
    if (locale.isBogus()) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    lsr = (likely as LikelySubtags).makeMaximizedLsrFrom(locale, true, status);
  }
  if (U_FAILURE(status[0])) return;
  language = lsr.language as string;
  if (language === "und") language = "";
  createTagStringWithAlternates(
    language,
    lsr.script as string,
    lsr.region as string,
    variant,
    cstring(localeID.slice(end[0])),
    sink,
    status,
  );
}
/** Original shared wrapper canonicalizes a default/null or C locale before private source dispatch. @param id - C locale/null default request. @param sink - Output. @param minimize - Dispatch. @param favorScript - Preference. @param status - Status. @returns Nothing. */
function canonicalTransform(
  id: string | null,
  sink: ByteStringSink,
  minimize: boolean,
  favorScript: boolean,
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  if (id === null) id = locale_get_default();
  let localeBuffer = "";
  ulocimp_canonicalize(
    cstring(id),
    {
      /** Owns original canonical CharString. @param bytes - Span. @returns Nothing. */ Append(
        bytes: string,
      ) {
        localeBuffer += bytes;
      },
    },
    status,
  );
  transform(localeBuffer, sink, minimize, favorScript, status);
}
/** Original internal addLikelySubtags ByteSink boundary. @param id - C ID/null. @param sink - Output. @param status - Status. @returns Nothing. */
export function ulocimp_addLikelySubtags(
  id: string | null,
  sink: ByteStringSink,
  status: [number],
): void {
  canonicalTransform(id, sink, false, false, status);
}
/** Original internal minimize ByteSink boundary. @param id - C ID/null. @param sink - Output. @param favorScript - Source preference. @param status - Status. @returns Nothing. */
export function ulocimp_minimizeSubtags(
  id: string | null,
  sink: ByteStringSink,
  favorScript: boolean,
  status: [number],
): void {
  canonicalTransform(id, sink, true, favorScript, status);
}
/** Original C add API, using the actual source checked output sink. @param id - C ID/null. @param output - Writable output/null for nonwriting capacities. @param capacity - Signed32 capacity. @param status - Status. @returns Required length/failure zero. */
export function uloc_addLikelySubtags(
  id: string | null,
  output: Uint8Array | null,
  capacity: number,
  status: [number],
): number {
  return ByteSinkUtil.viaByteSinkToTerminatedChars(
    output,
    capacity,
    /** Invokes original conversion on the checked owner. @param sink - Owner. @param s - Status. @returns Nothing. */ (
      sink,
      s,
    ) => ulocimp_addLikelySubtags(id, sink, s),
    status,
  );
}
/** Original C minimize defaults to favorRegion. @param id - C ID/null. @param output - Writable output. @param capacity - Capacity. @param status - Status. @returns Length. */
export function uloc_minimizeSubtags(
  id: string | null,
  output: Uint8Array | null,
  capacity: number,
  status: [number],
): number {
  return ByteSinkUtil.viaByteSinkToTerminatedChars(
    output,
    capacity,
    /** Invokes original default preference. @param sink - Owner. @param s - Status. @returns Nothing. */ (
      sink,
      s,
    ) => ulocimp_minimizeSubtags(id, sink, false, s),
    status,
  );
}
const gValidRegionMap = [
  0xeedf597c, 0xdeddbdef, 0x15943f3f, 0x0e00d580, 0xb0095c00, 0x0015fb9f, 0x781c068d, 0x0340400f,
  0xf42b1d00, 0xfd4f8141, 0x25d7fffc, 0x0100084b, 0x538f3c40, 0x40000001, 0xfdf15100, 0x9fbb7ae7,
  0x0410419a, 0x00408557, 0x00004002, 0x00100001, 0x00400408, 0x00000001,
];
/** Original generated two-letter region validation bitmap. */
export class RegionValidateMap {
  private readonly map = gValidRegionMap.slice();
  /** Original ASCII case-insensitive two-letter index. @param region - C code. @returns Bitmap offset/minus1. */
  private value(region: string): number {
    region = cstring(region);
    if (!/^[A-Za-z]{2}$/.test(region)) return -1;
    return (region.toUpperCase().charCodeAt(0) - 65) * 26 + region.toUpperCase().charCodeAt(1) - 65;
  }
  /** Original bitmap test. @param region - C code. @returns Valid. */
  isSet(region: string): boolean {
    const i = this.value(region);
    return i >= 0 && ((this.map[Math.trunc(i / 32)] as number) & (1 << (i % 32))) !== 0;
  }
  /** Original bytewise bitmap equality. @param that - Other. @returns Equal. */
  equals(that: RegionValidateMap): boolean {
    return this.map.every(
      /** Compares source immutable bitmap words. @param word - Word. @param i - Offset. @returns Same. */ (
        word,
        i,
      ) => word === that.map[i],
    );
  }
}
/** Original ASCII alphabet test. @param c - Unit. @returns ASCII letter. */
function letter(c: string | undefined): boolean {
  return c !== undefined && ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z"));
}
let validRegionMap: RegionValidateMap | null = null;
/** Original GetRegionFromKey allows any selected value suffix fitting the source length and validates only its first two letters against the bitmap. @param id - C ID/null. @param key - Counted key. @param status - Status. @returns Upper region/empty. */
function GetRegionFromKey(id: string | null, key: string, status: [number]): string {
  let kw = "";
  ulocimp_getKeywordValue(
    id,
    key,
    {
      /** Owns original keyword CharString. @param bytes - Span. @returns Nothing. */ Append(
        bytes: string,
      ) {
        kw += bytes;
      },
    },
    status,
  );
  if (!U_FAILURE(status[0]) && kw.length >= 3 && kw.length <= 6 && letter(kw[0]) && letter(kw[1])) {
    const region = kw.slice(0, 2);
    if ((validRegionMap ??= new RegionValidateMap()).isSet(region)) return region.toUpperCase();
  }
  return "";
}
/** Original country-only internal parser boundary. @param id - C ID. @param status - Status. @returns Region span. */
function getRegion(id: string, status: [number]): string {
  let region = "";
  ulocimp_getSubtags(
    cstring(id),
    null,
    null,
    {
      /** Owns parsed region CharString. @param bytes - Span. @returns Nothing. */ Append(
        bytes: string,
      ) {
        region += bytes;
      },
    },
    null,
    null,
    status,
  );
  return region;
}
/** Original rg -> country -> (infer: sd -> likely) ordering. Null is passed to keyword lookup first, and a failed inferred lookup does not overwrite the caller status. @param id - C ID/null. @param inferRegion - Infer if absent. @param status - Status. @returns Region/empty. */
export function ulocimp_getRegionForSupplementalData(
  id: string | null,
  inferRegion: boolean,
  status: [number],
): string {
  if (U_FAILURE(status[0])) return "";
  let region = GetRegionFromKey(id, "rg", status);
  if (!U_FAILURE(status[0]) && region.length === 0) {
    region = getRegion(id === null ? locale_get_default() : id, status);
    if (!U_FAILURE(status[0]) && region.length === 0 && inferRegion) {
      region = GetRegionFromKey(id, "sd", status);
      if (!U_FAILURE(status[0]) && region.length === 0) {
        const localStatus: [number] = [0];
        let likely = "";
        ulocimp_addLikelySubtags(
          id,
          {
            /** Owns inferred locale bytes. @param bytes - Span. @returns Nothing. */ Append(
              bytes: string,
            ) {
              likely += bytes;
            },
          },
          localStatus,
        );
        if (!U_FAILURE(localStatus[0])) region = getRegion(likely, status);
      }
    }
  }
  return region;
}

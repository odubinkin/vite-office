/** @fileoverview Native INetURLObject URI value and strict/smart absolute-reference parsing over the original scheme, host, path and scalar owners. */
import {
  DecodeMechanism,
  EncodeMechanism,
  EscapeType,
  FSysStyle,
  INetProtocol as Protocol,
  Part,
} from "../../inc/urlobj";
import {
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_DONTKNOW,
  type rtl_TextEncoding,
} from "../../../sal/inc/rtl/textenc";
import { isAsciiDigit } from "../../../sal/inc/rtl/character";
import { getPrefix, getSchemeInfo, PrefixKind } from "./urlobj.data";
import { parseHostOrNetBiosName } from "./urlobj.host";
import { parsePath } from "./urlobj.path";
import {
  appendUCS4,
  decode,
  getUTF32,
  guessFSysStyleByCounting,
  parseScheme,
  scanDomain,
  scanIPv6reference,
  type UriCursor,
} from "./urlobj";
/** Consumed native SubString coordinates; -1 begin represents absence. */
interface SubString {
  /** Native start offset. */ begin: number;
  /** Native code-unit length. */ length: number;
}
/** Native substring-bearing fields. */
type PartKey =
  | "m_aScheme"
  | "m_aUser"
  | "m_aAuth"
  | "m_aHost"
  | "m_aPort"
  | "m_aPath"
  | "m_aQuery"
  | "m_aFragment";
/** Source sentinel disabling a delimiter without changing UTF16 input. */
const disabledDelimiter = 0x80000000;
/** Original coordinate-bearing URI value; strings bind native UTF16 buffers without browser URL normalization. */
export class INetURLObject {
  private m_aAbsURIRef = "";
  private m_eScheme = Protocol.NotValid;
  private m_eSmartScheme = Protocol.Http;
  private m_aScheme: SubString = { begin: -1, length: 0 };
  private m_aUser: SubString = { begin: -1, length: 0 };
  private m_aAuth: SubString = { begin: -1, length: 0 };
  private m_aHost: SubString = { begin: -1, length: 0 };
  private m_aPort: SubString = { begin: -1, length: 0 };
  private m_aPath: SubString = { begin: -1, length: 0 };
  private m_aQuery: SubString = { begin: -1, length: 0 };
  private m_aFragment: SubString = { begin: -1, length: 0 };
  /** Native default, strict-reference and copy constructors; smart construction uses the original SetSmartProtocol/SetSmartURL API explicitly. @param source - Optional original value. @param mechanism - Native input interpretation. @param charset - Input encoding. @returns Initialized value. */
  constructor(
    source?: string | INetURLObject,
    mechanism = EncodeMechanism.WasEncoded,
    charset: rtl_TextEncoding = RTL_TEXTENCODING_UTF8,
  ) {
    if (source instanceof INetURLObject) this.assign(source);
    else if (source !== undefined) this.SetURL(source, mechanism, charset);
  }
  /** Native value assignment without sharing mutable coordinates. @param source - Original value. @returns Nothing. */
  private assign(source: INetURLObject): void {
    this.m_aAbsURIRef = source.m_aAbsURIRef;
    this.m_eScheme = source.m_eScheme;
    this.m_eSmartScheme = source.m_eSmartScheme;
    for (const key of [
      "m_aScheme",
      "m_aUser",
      "m_aAuth",
      "m_aHost",
      "m_aPort",
      "m_aPath",
      "m_aQuery",
      "m_aFragment",
    ] as const)
      this[key] = { ...source[key] };
  }
  /** Native absent-protocol error predicate. @returns Error state. */
  HasError(): boolean {
    return this.m_eScheme === Protocol.NotValid;
  }
  /** Native selected protocol. @returns Protocol. */
  GetProtocol(): Protocol {
    return this.m_eScheme;
  }
  /** Original GetAbsURL strict-relative conversion and default-argument failure fallback, used by Markdown. @param base - Source base reference. @param relative - Source destination. @param encodeMechanism - Input escapes. @param decodeMechanism - Output presentation. @param charset - Native charset. @returns Converted reference or original default-mode fallback. */
  static GetAbsURL(
    base: string,
    relative: string,
    encodeMechanism = EncodeMechanism.WasEncoded,
    decodeMechanism = DecodeMechanism.ToIUri,
    charset: rtl_TextEncoding = RTL_TEXTENCODING_UTF8,
  ): string {
    if (relative === "" || relative.startsWith("#")) return relative;
    const wasAbsolute: [boolean] = [false];
    const converted = new INetURLObject(base, encodeMechanism, charset).convertRelToAbs(
      relative,
      wasAbsolute,
      encodeMechanism,
      charset,
      false,
      false,
      false,
      FSysStyle.Detect,
    );
    if (
      converted !== null ||
      encodeMechanism !== EncodeMechanism.WasEncoded ||
      decodeMechanism !== DecodeMechanism.ToIUri ||
      charset !== RTL_TEXTENCODING_UTF8
    )
      return (converted ?? new INetURLObject()).GetMainURL(decodeMechanism, charset);
    return relative;
  }
  /** Native main-reference presentation. @param mechanism - Decode mode. @param charset - Native charset. @returns Complete URI spelling. */
  GetMainURL(
    mechanism: DecodeMechanism,
    charset: rtl_TextEncoding = RTL_TEXTENCODING_UTF8,
  ): string {
    return decode(this.m_aAbsURIRef, mechanism, charset);
  }
  /** Native host value presentation. @param mechanism - Decode mode. @param charset - Native charset. @returns Host. */
  GetHost(
    mechanism = DecodeMechanism.ToIUri,
    charset: rtl_TextEncoding = RTL_TEXTENCODING_UTF8,
  ): string {
    return decode(this.partText(this.m_aHost), mechanism, charset);
  }
  /** Native path value presentation. @param mechanism - Decode mode. @param charset - Native charset. @returns Path. */
  GetURLPath(
    mechanism = DecodeMechanism.ToIUri,
    charset: rtl_TextEncoding = RTL_TEXTENCODING_UTF8,
  ): string {
    return decode(this.partText(this.m_aPath), mechanism, charset);
  }
  /** Native query-presence predicate, including an empty query. @returns Presence. */
  HasParam(): boolean {
    return this.m_aQuery.begin !== -1;
  }
  /** Native query getter returns escaped spelling (DecodeMechanism::NONE). @param charset - Native charset. @returns Decoded query. */
  GetParam(charset: rtl_TextEncoding = RTL_TEXTENCODING_UTF8): string {
    return decode(this.partText(this.m_aQuery), DecodeMechanism.NONE, charset);
  }
  /** Native smart fallback protocol selection. @param protocol - Native protocol. @returns Nothing. */
  SetSmartProtocol(protocol: Protocol): void {
    this.m_eSmartScheme = protocol;
  }
  /** Native strict absolute-reference parser entry. @param source - Input reference. @param mechanism - Escape interpretation. @param charset - Input charset. @returns Success. */
  SetURL(
    source: string,
    mechanism = EncodeMechanism.WasEncoded,
    charset: rtl_TextEncoding = RTL_TEXTENCODING_UTF8,
  ): boolean {
    return this.setAbsURIRef(source, mechanism, charset, false, 0 as FSysStyle);
  }
  /** Native smart absolute-reference parser entry. @param source - Input. @param mechanism - Escape interpretation. @param charset - Input charset. @param style - Admitted filesystem styles. @returns Success. */
  SetSmartURL(
    source: string,
    mechanism = EncodeMechanism.WasEncoded,
    charset: rtl_TextEncoding = RTL_TEXTENCODING_UTF8,
    style = FSysStyle.Detect,
  ): boolean {
    return this.setAbsURIRef(source, mechanism, charset, true, style);
  }
  /** Original substring view; absent ranges produce the native empty string. @param part - Native coordinates. @returns Native substring. */
  private partText(part: SubString): string {
    return part.begin === -1 ? "" : this.m_aAbsURIRef.slice(part.begin, part.begin + part.length);
  }
  /** Consumed SubString::set append-at-end production. @param key - Actual substring field. @param value - Produced text. @returns Nothing. */
  private appendPart(key: PartKey, value: string): void {
    this[key] = { begin: this.m_aAbsURIRef.length, length: value.length };
    this.m_aAbsURIRef += value;
  }
  /** Original invalidation clears reference and all presence/coordinate fields, preserving smart protocol. @returns Failure. */
  private setInvalid(): false {
    this.m_aAbsURIRef = "";
    this.m_eScheme = Protocol.NotValid;
    for (const key of [
      "m_aScheme",
      "m_aUser",
      "m_aAuth",
      "m_aHost",
      "m_aPort",
      "m_aPath",
      "m_aQuery",
      "m_aFragment",
    ] as const)
      this[key] = { begin: -1, length: 0 };
    return false;
  }
  /** Original strict/smart absolute URI production sequence. @param source - Original UTF16 input. @param mechanism - Input escape interpretation. @param charset - Input charset. @param smart - Enable native scheme/filesystem inference. @param style - Filesystem admission bits. @returns Success, invalidating on every rejected production. */
  private setAbsURIRef(
    source: string,
    mechanism: EncodeMechanism,
    charset: rtl_TextEncoding,
    smart: boolean,
    style: FSysStyle,
  ): boolean {
    this.setInvalid();
    const cursor: UriCursor = { text: source, index: 0, end: source.length };
    let fragmentDelimiter = 35;
    const prefix = getPrefix(cursor);
    if (prefix !== null) {
      this.m_eScheme = prefix.m_eScheme;
      this.m_aAbsURIRef =
        prefix.m_eKind >= PrefixKind.External ? prefix.m_aTranslatedPrefix : prefix.m_aPrefix;
      this.m_aScheme = { begin: 0, length: this.m_aAbsURIRef.indexOf(":") };
    } else {
      if (smart) {
        const p = { ...cursor };
        if (style & FSysStyle.Dos && /^[a-z]:(?:[/\\]|$)/i.test(source)) {
          this.m_eScheme = Protocol.File;
          mechanism = EncodeMechanism.All;
          fragmentDelimiter = disabledDelimiter;
        } else if (style & FSysStyle.Dos && /^\\\\\?\\[a-z]:(?:[/\\]|$)/i.test(source)) {
          this.m_eScheme = Protocol.File;
          mechanism = EncodeMechanism.All;
          fragmentDelimiter = disabledDelimiter;
        } else if (source.startsWith("//")) {
          p.index += 2;
          if (
            (scanDomain(p, true) > 0 || scanIPv6reference(p)) &&
            (p.index === p.end || source[p.index] === "/")
          )
            this.m_eScheme = Protocol.File;
        } else if (source.startsWith("/")) {
          this.m_eScheme = Protocol.File;
          mechanism = EncodeMechanism.All;
          fragmentDelimiter = disabledDelimiter;
        } else if (style & FSysStyle.Dos && source.startsWith("\\\\")) {
          p.index = 2;
          if (source.slice(2, 8).toLowerCase() === "?\\unc\\") p.index += 6;
          const slash = source.indexOf("\\", p.index),
            end = slash === -1 ? p.end : slash;
          const domain = { ...p, end };
          if (
            parseHostOrNetBiosName(domain, EncodeMechanism.All, RTL_TEXTENCODING_DONTKNOW, true) !==
              null ||
            (scanDomain(domain, true) > 0 && domain.index === end)
          ) {
            this.m_eScheme = Protocol.File;
            mechanism = EncodeMechanism.All;
            fragmentDelimiter = disabledDelimiter;
          }
        } else {
          const domain = { ...p },
            labels = scanDomain(domain, true);
          if (labels > 0 && domain.index !== domain.end && source[domain.index] === "@") {
            ++domain.index;
            if (scanDomain(domain, true) > 0 && domain.index === domain.end)
              this.m_eScheme = Protocol.Mailto;
          } else if (labels >= 3 && (domain.index === domain.end || source[domain.index] === "/"))
            this.m_eScheme = /^ftp\./i.test(source) ? Protocol.Ftp : Protocol.Http;
        }
      }
      let scheme = "";
      if (this.m_eScheme === Protocol.NotValid) {
        const p = { ...cursor };
        scheme = parseScheme(p, fragmentDelimiter);
        if (scheme !== "") {
          if (
            smart &&
            this.m_eSmartScheme !== this.m_eScheme &&
            p.index !== p.end &&
            isAsciiDigit(source.charCodeAt(p.index))
          ) {
            const info = getSchemeInfo(this.m_eSmartScheme);
            if (info.m_bAuthority && info.m_bPort) {
              let next = p.index + 1;
              while (next < p.end && isAsciiDigit(source.charCodeAt(next))) ++next;
              if (next === p.end || "/?#".includes(source.charAt(next)))
                this.m_eScheme = this.m_eSmartScheme;
            }
          }
          if (this.m_eScheme === Protocol.NotValid) {
            this.m_eScheme = Protocol.Generic;
            cursor.index = p.index;
          }
        }
      }
      if (
        smart &&
        this.m_eScheme === Protocol.NotValid &&
        cursor.index !== cursor.end &&
        source.charCodeAt(cursor.index) !== fragmentDelimiter
      )
        this.m_eScheme = this.m_eSmartScheme;
      if (this.m_eScheme === Protocol.NotValid) return this.setInvalid();
      if (this.m_eScheme !== Protocol.Generic) scheme = getSchemeInfo(this.m_eScheme).m_sScheme;
      this.appendPart("m_aScheme", scheme);
      this.m_aAbsURIRef += ":";
    }
    const info = getSchemeInfo(this.m_eScheme);
    let segmentDelimiter = 47,
      altSegmentDelimiter = disabledDelimiter,
      skippedInitialSlash = false;
    if (info.m_bAuthority) {
      let userBegin = -1,
        userEnd = -1,
        hostBegin = -1,
        hostEnd = -1;
      const parseOrdinaryAuthority =
        /** Original ordinary-authority block shared by the native File fallthrough and default cases. @returns Success. */ (): boolean => {
          if (source.startsWith("//", cursor.index)) cursor.index += 2;
          else if (
            !smart &&
            !(
              this.m_eScheme === Protocol.File &&
              cursor.index !== cursor.end &&
              source[cursor.index] === "/"
            )
          )
            return this.setInvalid();
          this.m_aAbsURIRef += "//";
          const authority = cursor.index,
            queryDelimiter = info.m_bQuery ? 63 : disabledDelimiter;
          while (
            cursor.index < cursor.end &&
            source[cursor.index] !== "/" &&
            source.charCodeAt(cursor.index) !== queryDelimiter &&
            source.charCodeAt(cursor.index) !== fragmentDelimiter
          )
            ++cursor.index;
          if (info.m_bUser) {
            if (info.m_bHost) {
              let at = authority;
              while (at < cursor.index && source[at] !== "@") ++at;
              if (at === cursor.index) {
                hostBegin = authority;
                hostEnd = cursor.index;
              } else {
                userBegin = authority;
                userEnd = at;
                hostBegin = at + 1;
                hostEnd = cursor.index;
              }
            } else {
              userBegin = authority;
              userEnd = cursor.index;
            }
          } else if (info.m_bHost) {
            hostBegin = authority;
            hostEnd = cursor.index;
          } else if (cursor.index !== authority) return this.setInvalid();
          return true;
        };
      switch (this.m_eScheme) {
        case Protocol.VndSunStarHelp:
        case Protocol.VndSunStarHier: {
          const slashes = source.startsWith("//", cursor.index);
          if (!slashes) {
            if (this.m_eScheme === Protocol.VndSunStarHelp) return this.setInvalid();
            break;
          }
          cursor.index += 2;
          this.m_aAbsURIRef += "//";
          let authority = "";
          while (
            cursor.index < cursor.end &&
            source[cursor.index] !== "/" &&
            source[cursor.index] !== "?" &&
            source.charCodeAt(cursor.index) !== fragmentDelimiter
          )
            authority += appendUCS4(
              getUTF32(cursor, mechanism, charset),
              Part.PART_AUTHORITY,
              charset,
              false,
            );
          if (this.m_eScheme === Protocol.VndSunStarHier && authority === "")
            return this.setInvalid();
          this.appendPart("m_aHost", authority);
          break;
        }
        case Protocol.VndSunStarPkg:
        case Protocol.Cmis: {
          if (!source.startsWith("//", cursor.index)) return this.setInvalid();
          cursor.index += 2;
          this.m_aAbsURIRef += "//";
          let user = "",
            hasUser = false;
          while (
            cursor.index < cursor.end &&
            source[cursor.index] !== "@" &&
            source[cursor.index] !== "/" &&
            source[cursor.index] !== "?" &&
            source.charCodeAt(cursor.index) !== fragmentDelimiter
          ) {
            user += appendUCS4(
              getUTF32(cursor, mechanism, charset),
              Part.PART_USER_PASSWORD,
              charset,
              false,
            );
            hasUser = source[cursor.index] === "@";
          }
          let authority = "";
          if (!hasUser) authority = user;
          else {
            this.appendPart("m_aUser", user);
            this.m_aAbsURIRef += "@";
            ++cursor.index;
            while (
              cursor.index < cursor.end &&
              source[cursor.index] !== "/" &&
              source[cursor.index] !== "?" &&
              source.charCodeAt(cursor.index) !== fragmentDelimiter
            )
              authority += appendUCS4(
                getUTF32(cursor, mechanism, charset),
                Part.PART_AUTHORITY,
                charset,
                false,
              );
          }
          if (authority === "") return this.setInvalid();
          this.appendPart("m_aHost", authority);
          break;
        }
        case Protocol.File:
          if (smart) {
            if (source.startsWith("//", cursor.index)) {
              let end = cursor.index + 2;
              while (
                end < cursor.end &&
                source[end] !== "/" &&
                source.charCodeAt(end) !== fragmentDelimiter
              )
                ++end;
              if (
                parseHostOrNetBiosName(
                  { ...cursor, index: cursor.index + 2, end },
                  EncodeMechanism.All,
                  RTL_TEXTENCODING_DONTKNOW,
                  true,
                ) !== null
              ) {
                this.m_aAbsURIRef += "//";
                hostBegin = cursor.index + 2;
                hostEnd = end;
                cursor.index = end;
                break;
              }
            }
            if (source.startsWith("//", cursor.index)) {
              this.m_aAbsURIRef += "//";
              cursor.index += 2;
              skippedInitialSlash = true;
              if (style & FSysStyle.Dos && /^[a-z]:(?:[/\\]|$)/i.test(source.slice(cursor.index)))
                altSegmentDelimiter = 92;
              break;
            }
            if (source[cursor.index] === "/") {
              this.m_aAbsURIRef += "//";
              break;
            }
            if (style & FSysStyle.Dos && source.startsWith("\\\\", cursor.index)) {
              let start = cursor.index + 2;
              if (source.slice(start, start + 6).toLowerCase() === "?\\unc\\") start += 6;
              let end = start;
              while (
                end < cursor.end &&
                source[end] !== "\\" &&
                source.charCodeAt(end) !== fragmentDelimiter
              )
                ++end;
              const domain = { ...cursor, index: start, end };
              if (
                parseHostOrNetBiosName(
                  domain,
                  EncodeMechanism.All,
                  RTL_TEXTENCODING_DONTKNOW,
                  true,
                ) !== null ||
                (scanDomain(domain, true) > 0 && domain.index === end)
              ) {
                this.m_aAbsURIRef += "//";
                hostBegin = start;
                hostEnd = end;
                cursor.index = end;
                segmentDelimiter = 92;
                break;
              }
            }
            if (style & FSysStyle.Dos) {
              let start = cursor.index;
              if (source.startsWith("\\\\?\\", start)) start += 4;
              if (/^[a-z]:(?:[/\\]|$)/i.test(source.slice(start))) {
                cursor.index = start;
                this.m_aAbsURIRef += "//";
                altSegmentDelimiter = 92;
                skippedInitialSlash = true;
                break;
              }
            }
            if (style & (FSysStyle.Unix | FSysStyle.Dos)) {
              this.m_aAbsURIRef += "//";
              segmentDelimiter =
                guessFSysStyleByCounting(source.slice(cursor.index), style) === FSysStyle.Unix
                  ? 47
                  : 92;
              skippedInitialSlash =
                cursor.index !== cursor.end && source.charCodeAt(cursor.index) !== segmentDelimiter;
              break;
            }
          }
          // Native File fallthrough shares the ordinary-authority block.
          if (!parseOrdinaryAuthority()) return false;
          break;
        default:
          if (!parseOrdinaryAuthority()) return false;
          break;
      }

      if (userBegin !== -1) {
        const p = { ...cursor, index: userBegin, end: userEnd };
        let user = "",
          hasAuth = false;
        const supportsPassword = info.m_bPassword,
          supportsAuth = !supportsPassword && info.m_bAuth;
        while (p.index < p.end) {
          const scalar = getUTF32(p, mechanism, charset);
          if (scalar.escape === EscapeType.NONE) {
            if (scalar.value === 58 && supportsPassword) {
              hasAuth = true;
              break;
            }
            if (
              scalar.value === 59 &&
              supportsAuth &&
              p.end - p.index > 5 &&
              source.slice(p.index, p.index + 5).toLowerCase() === "auth="
            ) {
              p.index += 5;
              hasAuth = true;
              break;
            }
          }
          user += appendUCS4(scalar, Part.PART_USER_PASSWORD, charset, false);
        }
        this.appendPart("m_aUser", user);
        if (hasAuth) {
          this.m_aAbsURIRef += supportsPassword ? ":" : ";AUTH=";
          let auth = "";
          while (p.index < p.end) {
            const scalar = getUTF32(p, mechanism, charset);
            // Original INetMIME::isIMAPAtomChar bitmap projection; initialized SchemeInfo rows currently disable AUTH.
            if (
              !supportsPassword &&
              (scalar.value < 33 ||
                scalar.value > 126 ||
                '"%()*\\{'.includes(String.fromCharCode(scalar.value)))
            )
              return this.setInvalid();
            auth += appendUCS4(scalar, Part.PART_USER_PASSWORD, charset, false);
          }
          this.appendPart("m_aAuth", auth);
        }
        if (hostBegin !== -1) this.m_aAbsURIRef += "@";
      }
      if (hostBegin !== -1) {
        let port = hostEnd;
        if (info.m_bPort && hostBegin < hostEnd) {
          let p = hostEnd - 1;
          while (p > hostBegin && isAsciiDigit(source.charCodeAt(p))) --p;
          if (source[p] === ":") port = p;
        }
        let netBiosName = false;
        switch (this.m_eScheme) {
          case Protocol.File:
            if (source.slice(hostBegin, port).toLowerCase() === "localhost") hostBegin = port;
            netBiosName = true;
            break;
          case Protocol.Ldap:
          case Protocol.Smb:
            if (hostBegin === port && port !== hostEnd) return this.setInvalid();
            break;
          default:
            if (hostBegin === port) return this.setInvalid();
        }
        const host = parseHostOrNetBiosName(
          { ...cursor, index: hostBegin, end: port },
          mechanism,
          charset,
          netBiosName,
        );
        if (host === null) return this.setInvalid();
        this.appendPart("m_aHost", host);
        if (port !== hostEnd) {
          this.m_aAbsURIRef += ":";
          this.appendPart("m_aPort", source.slice(port + 1, hostEnd));
        }
      }
    }
    const beforePath = this.m_aAbsURIRef.length;
    const path = parsePath(
      this.m_eScheme,
      cursor,
      mechanism,
      charset,
      skippedInitialSlash,
      segmentDelimiter,
      altSegmentDelimiter,
      info.m_bQuery ? 63 : disabledDelimiter,
      fragmentDelimiter,
      this.m_aAbsURIRef,
    );
    if (path === null) return this.setInvalid();
    this.m_aAbsURIRef = path;
    this.m_aPath = { begin: beforePath, length: path.length - beforePath };
    if (info.m_bQuery && cursor.index < cursor.end && source[cursor.index] === "?") {
      this.m_aAbsURIRef += "?";
      ++cursor.index;
      let query = "";
      while (cursor.index < cursor.end && source.charCodeAt(cursor.index) !== fragmentDelimiter)
        query += appendUCS4(getUTF32(cursor, mechanism, charset), Part.PART_URIC, charset, true);
      this.appendPart("m_aQuery", query);
    }
    if (cursor.index < cursor.end && source.charCodeAt(cursor.index) === fragmentDelimiter) {
      this.m_aAbsURIRef += String.fromCharCode(fragmentDelimiter);
      ++cursor.index;
      let fragment = "";
      while (cursor.index < cursor.end)
        fragment += appendUCS4(getUTF32(cursor, mechanism, charset), Part.PART_URIC, charset, true);
      this.appendPart("m_aFragment", fragment);
    }
    if (cursor.index !== cursor.end) return this.setInvalid();
    return true;
  }
  /** Original fragment removal, including an empty present fragment. @returns Native success for a valid URI. */
  private clearFragment(): boolean {
    if (this.HasError()) return false;
    if (this.m_aFragment.begin !== -1) {
      this.m_aAbsURIRef = this.m_aAbsURIRef.slice(0, this.m_aFragment.begin - 1);
      this.m_aFragment = { begin: -1, length: 0 };
    }
    return true;
  }
  /** Native smart relative-to-absolute entry, retaining original failure/default-result ownership. @param relative - Relative reference. @param wasAbsolute - Original bool out parameter. @param ignoreFragment - Discard resolved fragment. @param mechanism - Input escapes. @param charset - Input encoding. @param relativeNonURIs - Native filesystem-relative mode. @param style - Filesystem styles. @returns Resolved original URI value, invalid on failure. */
  smartRel2Abs(
    relative: string,
    wasAbsolute: [boolean],
    ignoreFragment = false,
    mechanism = EncodeMechanism.WasEncoded,
    charset: rtl_TextEncoding = RTL_TEXTENCODING_UTF8,
    relativeNonURIs = false,
    style = FSysStyle.Detect,
  ): INetURLObject {
    return (
      this.convertRelToAbs(
        relative,
        wasAbsolute,
        mechanism,
        charset,
        ignoreFragment,
        true,
        relativeNonURIs,
        style,
      ) ?? new INetURLObject()
    );
  }
  /** Original authority slice including double slash, using present substring coordinates. @returns Authority spelling. */
  private getAuthority(): string {
    const begin =
      (this.m_aUser.begin !== -1
        ? this.m_aUser.begin
        : this.m_aHost.begin !== -1
          ? this.m_aHost.begin
          : this.m_aPath.begin) - 2;
    const endPart =
      this.m_aPort.begin !== -1
        ? this.m_aPort
        : this.m_aHost.begin !== -1
          ? this.m_aHost
          : this.m_aAuth.begin !== -1
            ? this.m_aAuth
            : this.m_aUser;
    const end = endPart.begin !== -1 ? endPart.begin + endPart.length : begin + 2;
    return this.m_aAbsURIRef.slice(begin, end);
  }
  /** Original conversion state machine; the returned value binds the native output object. @param relative - Source reference. @param wasAbsolute - Original out parameter. @param mechanism - Escape interpretation. @param charset - Source charset. @param ignoreFragment - Drop fragment. @param smart - Native smart behavior. @param relativeNonURIs - Relative filesystem interpretation. @param style - Filesystem bits. @returns Complete value or null on source failure. */
  private convertRelToAbs(
    relative: string,
    wasAbsolute: [boolean],
    mechanism: EncodeMechanism,
    charset: rtl_TextEncoding,
    ignoreFragment: boolean,
    smart: boolean,
    relativeNonURIs: boolean,
    style: FSysStyle,
  ): INetURLObject | null {
    const cursor: UriCursor = { text: relative + "\0", index: 0, end: relative.length },
      prefixCursor = { ...cursor };
    const prefix = getPrefix(prefixCursor);
    let hasScheme = prefix !== null;
    if (!hasScheme) hasScheme = parseScheme({ ...cursor }, 35) !== "";
    const info = getSchemeInfo(this.m_eScheme);
    let segmentDelimiter = 47,
      queryDelimiter = !smart || info.m_bQuery ? 63 : disabledDelimiter,
      fragmentDelimiter = 35,
      part = Part.PART_VISIBLE;
    if (!hasScheme && smart) {
      if (style & FSysStyle.Dos) {
        let fsys = false,
          q = 0;
        if (/^[a-z]:(?:[/\\]|$)/i.test(relative)) fsys = true;
        else if (relative.startsWith("\\\\")) {
          q += 2;
          const slash = relative.indexOf("\\", q),
            n = slash === -1 ? -1 : slash - q;
          if (n === 1 && relative[q] === "?") {
            q += 2;
            if (/^[a-z]:(?:[/\\]|$)/i.test(relative.slice(q))) fsys = true;
            else if (relative.slice(q, q + 4).toLowerCase() === "unc\\") q += 4;
          }
          if (!fsys) {
            // Preserve the source's original n after the extended UNC prefix advances q.
            const end = n === -1 ? cursor.end : q + n;
            if (
              parseHostOrNetBiosName(
                { ...cursor, index: q, end },
                EncodeMechanism.All,
                RTL_TEXTENCODING_DONTKNOW,
                true,
              ) !== null
            )
              fsys = true;
          }
        }
        if (fsys) {
          const result = new INetURLObject();
          result.SetSmartURL(relative, mechanism, charset, style);
          if (!result.HasError()) {
            wasAbsolute[0] = true;
            return result;
          }
        }
      }
      if (this.m_eScheme === Protocol.File) {
        if (guessFSysStyleByCounting(relative, style) === FSysStyle.Unix) segmentDelimiter = 47;
        else {
          segmentDelimiter = 92;
          relativeNonURIs = true;
        }
      }
      if (relativeNonURIs) {
        mechanism = EncodeMechanism.All;
        queryDelimiter = disabledDelimiter;
        fragmentDelimiter = disabledDelimiter;
        part = Part.PART_VISIBLE_NONSPECIAL;
      }
    }
    if (prefix !== null && prefix.m_eScheme === this.m_eScheme && info.m_bHierarchical) {
      hasScheme = false;
      while (cursor.index < cursor.end && relative.charCodeAt(cursor.index++) !== 58) {
        /* Native consume-through-colon loop. */
      }
    }
    wasAbsolute[0] = hasScheme;
    if (hasScheme) {
      const result = new INetURLObject(relative, mechanism, charset);
      if (result.HasError()) {
        wasAbsolute[0] = false;
        return null;
      }
      if (ignoreFragment) result.clearFragment();
      return result;
    }
    let result =
      (this.m_eScheme !== Protocol.Generic ? info.m_sScheme : this.partText(this.m_aScheme)) + ":";
    let state: "AUTH" | "ABS_PATH" | "REL_PATH" | "FRAGMENT" | "DONE" = "AUTH",
      sameDoc = true;
    if (info.m_bAuthority) {
      if (relative.startsWith("//", cursor.index)) {
        result += "//";
        cursor.index += 2;
        state = "ABS_PATH";
        sameDoc = false;
        while (cursor.index < cursor.end) {
          const scalar = getUTF32(cursor, mechanism, charset);
          if (scalar.escape === EscapeType.NONE) {
            if (scalar.value === segmentDelimiter) break;
            if (scalar.value === fragmentDelimiter) {
              state = "FRAGMENT";
              break;
            }
          }
          result += appendUCS4(scalar, Part.PART_VISIBLE, charset, true);
        }
      } else result += this.getAuthority();
    }
    if (state === "AUTH") {
      if (cursor.index === cursor.end) state = "DONE";
      else if (relative.charCodeAt(cursor.index) === fragmentDelimiter) {
        ++cursor.index;
        state = "FRAGMENT";
      } else if (relative.charCodeAt(cursor.index) === segmentDelimiter) {
        ++cursor.index;
        state = "ABS_PATH";
        sameDoc = false;
      } else {
        state = "REL_PATH";
        sameDoc = false;
      }
    }
    if (state === "ABS_PATH") {
      result += "/";
      state = "DONE";
      while (cursor.index < cursor.end) {
        const scalar = getUTF32(cursor, mechanism, charset);
        if (scalar.escape === EscapeType.NONE) {
          if (scalar.value === fragmentDelimiter) {
            state = "FRAGMENT";
            break;
          }
          if (scalar.value === segmentDelimiter) scalar.value = 47;
        }
        result += appendUCS4(scalar, part, charset, true);
      }
    } else if (state === "REL_PATH") {
      if (!info.m_bHierarchical) {
        wasAbsolute[0] = false;
        return null;
      }
      const basePath = this.partText(this.m_aPath),
        slash = basePath.lastIndexOf("/");
      const pathBegin = result.length;
      result += slash === -1 ? "" : basePath.slice(0, slash + 1);
      while (
        cursor.index < cursor.end &&
        relative.charCodeAt(cursor.index) !== queryDelimiter &&
        relative.charCodeAt(cursor.index) !== fragmentDelimiter
      ) {
        if (relative[cursor.index] === ".") {
          const next = cursor.index + 1;
          if (
            cursor.end - cursor.index === 1 ||
            relative.charCodeAt(next) === segmentDelimiter ||
            relative.charCodeAt(next) === queryDelimiter ||
            relative.charCodeAt(next) === fragmentDelimiter
          ) {
            ++cursor.index;
            if (cursor.index < cursor.end && relative.charCodeAt(cursor.index) === segmentDelimiter)
              ++cursor.index;
            continue;
          }
          const next2 = cursor.index + 2;
          if (
            cursor.end - cursor.index >= 2 &&
            relative[next] === "." &&
            (cursor.end - cursor.index === 2 ||
              relative.charCodeAt(next2) === segmentDelimiter ||
              relative.charCodeAt(next2) === queryDelimiter ||
              relative.charCodeAt(next2) === fragmentDelimiter) &&
            result.length - pathBegin > 1
          ) {
            cursor.index += 2;
            if (cursor.index < cursor.end && relative.charCodeAt(cursor.index) === segmentDelimiter)
              ++cursor.index;
            let index = result.length - 2;
            while (index > pathBegin && result[index] !== "/") --index;
            result = result.slice(0, index + 1);
            continue;
          }
        }
        while (
          cursor.index < cursor.end &&
          relative.charCodeAt(cursor.index) !== segmentDelimiter &&
          relative.charCodeAt(cursor.index) !== queryDelimiter &&
          relative.charCodeAt(cursor.index) !== fragmentDelimiter
        )
          result += appendUCS4(getUTF32(cursor, mechanism, charset), part, charset, true);
        if (cursor.index < cursor.end && relative.charCodeAt(cursor.index) === segmentDelimiter) {
          result += "/";
          ++cursor.index;
        }
      }
      while (cursor.index < cursor.end && relative.charCodeAt(cursor.index) !== fragmentDelimiter)
        result += appendUCS4(getUTF32(cursor, mechanism, charset), part, charset, true);
      if (cursor.index === cursor.end) state = "DONE";
      else {
        ++cursor.index;
        state = "FRAGMENT";
      }
    } else if (sameDoc) {
      result += this.partText(this.m_aPath);
      if (this.m_aQuery.begin !== -1) result += "?" + this.partText(this.m_aQuery);
    }
    if (state === "FRAGMENT" && !ignoreFragment) {
      result += "#";
      while (cursor.index < cursor.end)
        result += appendUCS4(
          getUTF32(cursor, mechanism, charset),
          Part.PART_VISIBLE,
          charset,
          true,
        );
    }
    const absolute = new INetURLObject(result);
    if (absolute.HasError()) {
      wasAbsolute[0] = false;
      return null;
    }
    return absolute;
  }
  /** Original GetPartBeforeLastName sequence, consuming removeSegment(LAST_SEGMENT,false) and setFinalSlash over the native path producer. @returns Parent spelling or empty string for nonhierarchical values. */
  GetPartBeforeLastName(): string {
    if (!(
      this.m_eScheme === Protocol.VndSunStarExpand || getSchemeInfo(this.m_eScheme).m_bHierarchical
    ))
      return "";
    const value = new INetURLObject(this);
    value.clearFragment();
    if (!value.HasError() && value.m_aQuery.begin !== -1) {
      const query = value.m_aQuery;
      value.m_aAbsURIRef =
        value.m_aAbsURIRef.slice(0, query.begin - 1) +
        value.m_aAbsURIRef.slice(query.begin + query.length);
      if (value.m_aFragment.begin !== -1) value.m_aFragment.begin -= query.length + 1;
      value.m_aQuery = { begin: -1, length: 0 };
    }
    const path = value.partText(value.m_aPath);
    // Original getSegment(LAST_SEGMENT,false), including a final slash as an empty-name segment.
    if (path.length > 0) {
      let start = path.length - 1;
      while (start > 0 && path[start] !== "/") --start;
      let shortened = path.slice(0, start);
      if (shortened === "" && path[start] === "/") shortened = "/";
      value.setPath(shortened, EncodeMechanism.NotCanonical, RTL_TEXTENCODING_UTF8);
    }
    const shortened = value.partText(value.m_aPath);
    if (!shortened.endsWith("/"))
      value.setPath(shortened + "/", EncodeMechanism.NotCanonical, RTL_TEXTENCODING_UTF8);
    return value.GetMainURL(DecodeMechanism.ToIUri);
  }
  /** Original path replacement and subsequent query/fragment coordinate adjustment. @param path - New native path. @param mechanism - Escape interpretation. @param charset - Input encoding. @returns Source path admission. */
  private setPath(path: string, mechanism: EncodeMechanism, charset: rtl_TextEncoding): boolean {
    const cursor: UriCursor = { text: path, index: 0, end: path.length };
    const produced = parsePath(
      this.m_eScheme,
      cursor,
      mechanism,
      charset,
      false,
      47,
      disabledDelimiter,
      disabledDelimiter,
      disabledDelimiter,
      "",
    );
    if (produced === null || cursor.index !== cursor.end) return false;
    const old = this.m_aPath;
    this.m_aAbsURIRef =
      this.m_aAbsURIRef.slice(0, old.begin) +
      produced +
      this.m_aAbsURIRef.slice(old.begin + old.length);
    const delta = produced.length - old.length;
    this.m_aPath = { begin: old.begin, length: produced.length };
    if (this.m_aQuery.begin !== -1) this.m_aQuery.begin += delta;
    if (this.m_aFragment.begin !== -1) this.m_aFragment.begin += delta;
    return true;
  }
}

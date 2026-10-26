/** @fileoverview Original ICU78.3 forLanguageTag ByteSink conversion and extension-to-legacy keyword helpers from uloc_tag.cpp. This fragment operates on the actual parsed tag owner and source key/type map views. */
import * as T from "./uloc_tag";
import * as K from "./uloc.keytype";
import type { LocaleByteSink } from "./uloc.subtags";
import { UErrorCode, U_FAILURE, U_SUCCESS } from "./unicode/utypes";
/** Original conversion-time ExtensionListEntry owns pooled key/type strings separately from the parsed owner. */
interface ExtensionListEntry {
  key: string;
  value: string;
  next: ExtensionListEntry | null;
}
/** Original ordered AttributeListEntry. */
interface AttributeListEntry {
  attribute: string;
  next: AttributeListEntry | null;
}
/** Original ASCII lower conversion for aliased input views. @param text - Narrow string. @returns Lowercase. */
function lower(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; ++i) {
    const c = text.charCodeAt(i);
    out += String.fromCharCode(c >= 65 && c <= 90 ? c + 32 : c);
  }
  return out;
}
/** Original ASCII upper conversion. @param text - Narrow string. @returns Uppercase. */
function upper(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; ++i) {
    const c = text.charCodeAt(i);
    out += String.fromCharCode(c >= 97 && c <= 122 ? c - 32 : c);
  }
  return out;
}
/** Original false-direction extension insertion; duplicate nodes remain caller owned. @param first - List owner reference. @param ext - Transferred candidate. @returns Inserted. */
function _addExtensionToList(first: [ExtensionListEntry | null], ext: ExtensionListEntry): boolean {
  let prev: ExtensionListEntry | null = null,
    cur = first[0];
  while (cur !== null) {
    if (ext.key < cur.key) break;
    if (ext.key === cur.key) return false;
    prev = cur;
    cur = cur.next;
  }
  ext.next = cur;
  if (prev === null) first[0] = ext;
  else prev.next = ext;
  return true;
}
/** Original sorted attribute insertion ignores duplicates. @param first - List owner reference. @param attr - Transferred candidate. @returns Inserted. */
function _addAttributeToList(
  first: [AttributeListEntry | null],
  attr: AttributeListEntry,
): boolean {
  let prev: AttributeListEntry | null = null,
    cur = first[0];
  while (cur !== null) {
    if (attr.attribute < cur.attribute) break;
    if (attr.attribute === cur.attribute) return false;
    prev = cur;
    cur = cur.next;
  }
  attr.next = cur;
  if (prev === null) first[0] = attr;
  else prev.next = attr;
  return true;
}
/** Reads an actual original narrow pointer in the parsed owner. @param tag - Owner. @param pos - Offset. @returns C-string bytes. */
function variantAt(tag: T.ULanguageTag, pos: number): string {
  let value = "";
  for (let i = pos; tag.buf[i] !== 0; ++i) value += String.fromCharCode(tag.buf[i] as number);
  return value;
}
/** Original nested-loop pointer swap, preserving actual variant-node ownership. @param tag - Parsed owner. @returns Nothing. */
function _sortVariants(tag: T.ULanguageTag): void {
  for (let a = tag.variants; a !== null; a = a.next)
    for (let b = a.next; b !== null; b = b.next)
      if (variantAt(tag, a.variant) > variantAt(tag, b.variant)) {
        const temp = a.variant;
        a.variant = b.variant;
        b.variant = temp;
      }
}
/** Original LDML extension helper retains attribute sorting, first duplicate, map/input alias distinction and POSIX flag state. Native pools are projected as owned immutable strings. @param ldmlext - Lowercase extension value. @param appendTo - Owned keyword list. @param posixVariant - In/out source flag. @param status - Sticky status. @returns Nothing. */
function _appendLDMLExtensionAsKeywords(
  ldmlext: string,
  appendTo: [ExtensionListEntry | null],
  posixVariant: [boolean],
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  const variantExists = posixVariant[0],
    kwdFirst: [ExtensionListEntry | null] = [null];
  posixVariant[0] = false;
  let pTag = 0,
    pKwds: number | null = null;
  {
    const attrFirst: [AttributeListEntry | null] = [null];
    while (pTag < ldmlext.length) {
      const end = ldmlext.indexOf("-", pTag),
        len = (end < 0 ? ldmlext.length : end) - pTag,
        value = ldmlext.slice(pTag, pTag + len);
      if (T.ultag_isUnicodeLocaleKey(value, len)) {
        pKwds = pTag;
        break;
      }
      _addAttributeToList(attrFirst, { attribute: value, next: null });
      pTag += len;
      if (pTag < ldmlext.length) ++pTag;
    }
    if (attrFirst[0] !== null) {
      let value = "";
      for (let attr: AttributeListEntry | null = attrFirst[0]; attr !== null; attr = attr.next) {
        if (attr !== attrFirst[0]) value += "-";
        value += attr.attribute;
      }
      if (!_addExtensionToList(kwdFirst, { key: "attribute", value, next: null })) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
    }
  }
  if (pKwds !== null) {
    let pBcpKey: number | null = null,
      pBcpType: number | null = null,
      bcpKeyLen = 0,
      bcpTypeLen = 0,
      isDone = false;
    pTag = pKwds;
    while (!isDone) {
      let pNextBcpKey: number | null = null,
        nextBcpKeyLen = 0,
        emitKeyword = false;
      if (pTag < ldmlext.length) {
        const end = ldmlext.indexOf("-", pTag),
          len = (end < 0 ? ldmlext.length : end) - pTag,
          value = ldmlext.slice(pTag, pTag + len);
        if (T.ultag_isUnicodeLocaleKey(value, len)) {
          if (pBcpKey !== null) {
            emitKeyword = true;
            pNextBcpKey = pTag;
            nextBcpKeyLen = len;
          } else {
            pBcpKey = pTag;
            bcpKeyLen = len;
          }
        } else {
          if (pBcpType !== null) bcpTypeLen += len + 1;
          else {
            pBcpType = pTag;
            bcpTypeLen = len;
          }
        }
        pTag += len;
        if (pTag < ldmlext.length) ++pTag;
      } else {
        emitKeyword = true;
        isDone = true;
      }
      if (emitKeyword) {
        if (bcpKeyLen !== 2) {
          status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
          return;
        }
        const legacyKey = K.ulocimp_toLegacyKeyWithFallback(
          ldmlext.slice(pBcpKey as number, (pBcpKey as number) + bcpKeyLen),
        );
        if (legacyKey === null) {
          status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
          return;
        }
        const pKey = legacyKey.inputAlias ? lower(legacyKey.value) : legacyKey.value;
        let pType: string;
        if (pBcpType !== null) {
          const legacyType = K.ulocimp_toLegacyTypeWithFallback(
            pKey,
            ldmlext.slice(pBcpType, pBcpType + bcpTypeLen),
          );
          if (legacyType === null) {
            status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
            return;
          }
          pType = legacyType.inputAlias ? lower(legacyType.value) : legacyType.value;
        } else pType = "yes";
        if (!variantExists && pKey === "va" && pType === "posix") posixVariant[0] = true;
        else _addExtensionToList(kwdFirst, { key: pKey, value: pType, next: null });
        pBcpKey = pNextBcpKey;
        bcpKeyLen = pNextBcpKey !== null ? nextBcpKeyLen : 0;
        pBcpType = null;
        bcpTypeLen = 0;
      }
    }
  }
  let kwd = kwdFirst[0];
  while (kwd !== null) {
    const next = kwd.next;
    _addExtensionToList(appendTo, kwd);
    kwd = next;
  }
}
/** Original keyword conversion defers output until all logical keyword construction succeeds. @param tag - Actual parsed owner. @param sink - Append output. @param status - Sticky status. @returns Nothing. */
function _appendKeywords(tag: T.ULanguageTag, sink: LocaleByteSink, status: [number]): void {
  if (U_FAILURE(status[0])) return;
  const first: [ExtensionListEntry | null] = [null],
    posix: [boolean] = [false];
  for (let i = 0, n = T.ultag_getExtensionsSize(tag); i < n; ++i) {
    const key = T.ultag_getExtensionKey(tag, i) as string,
      type = T.ultag_getExtensionValue(tag, i) as string;
    if (key[0] === "u") {
      if (T.ultag_getVariantsSize(tag) !== 0) posix[0] = true;
      _appendLDMLExtensionAsKeywords(type, first, posix, status);
      if (U_FAILURE(status[0])) break;
    } else if (!_addExtensionToList(first, { key, value: type, next: null })) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      break;
    }
  }
  if (U_SUCCESS(status[0])) {
    const type = T.ultag_getPrivateUse(tag);
    if (type.length !== 0 && !_addExtensionToList(first, { key: "x", value: type, next: null }))
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
  }
  if (U_SUCCESS(status[0]) && posix[0]) sink.Append("_POSIX");
  if (U_SUCCESS(status[0]) && first[0] !== null) {
    let firstValue = true;
    for (let kwd: ExtensionListEntry | null = first[0]; kwd !== null; kwd = kwd.next) {
      sink.Append(firstValue ? "@" : ";");
      firstValue = false;
      sink.Append(kwd.key);
      sink.Append("=");
      sink.Append(kwd.value);
    }
  }
}
/** Original complete internal ByteSink forLanguageTag conversion; parsing may succeed on a prefix, and parsedLength remains the original parser output. @param langtag - Readable narrow source. @param tagLen - Native explicit or negative C length. @param sink - Existing append output. @param parsedLength - Optional consumed length. @param status - Sticky ICU status. @returns Nothing. */
export function ulocimp_forLanguageTag(
  langtag: string,
  tagLen: number,
  sink: LocaleByteSink,
  parsedLength: [number] | null,
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  const tag = T.ultag_parse(langtag, tagLen, parsedLength, status);
  if (U_FAILURE(status[0])) return;
  const actual = tag as T.ULanguageTag;
  let isEmpty = true,
    noRegion = true;
  let subtag =
    T.ultag_getExtlangSize(actual) > 0
      ? (T.ultag_getExtlang(actual, 0) as string)
      : T.ultag_getLanguage(actual);
  if (subtag !== "und" && subtag.length > 0) {
    sink.Append(subtag);
    isEmpty = false;
  }
  subtag = T.ultag_getScript(actual);
  if (subtag.length > 0) {
    sink.Append("_");
    isEmpty = false;
    sink.Append(upper(subtag[0] as string));
    sink.Append(subtag.slice(1));
  }
  subtag = T.ultag_getRegion(actual);
  if (subtag.length > 0) {
    sink.Append("_");
    isEmpty = false;
    sink.Append(upper(subtag));
    noRegion = false;
  }
  _sortVariants(actual);
  const n = T.ultag_getVariantsSize(actual);
  if (n > 0) {
    if (noRegion) {
      sink.Append("_");
      isEmpty = false;
    }
    for (let i = 0; i < n; ++i) {
      sink.Append("_");
      sink.Append(upper(T.ultag_getVariant(actual, i) as string));
    }
  }
  const extensionCount = T.ultag_getExtensionsSize(actual);
  subtag = T.ultag_getPrivateUse(actual);
  if (extensionCount > 0 || subtag.length > 0) {
    if (isEmpty && extensionCount > 0) sink.Append("und");
    _appendKeywords(actual, sink, status);
  }
}

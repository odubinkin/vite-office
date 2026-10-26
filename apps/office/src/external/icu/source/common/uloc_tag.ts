/** @fileoverview Original ICU78.3 ULanguageTag parser from uloc_tag.cpp. Owned narrow-byte buffer and nullable offsets project the actual internal pointers; linked-list order, partial acceptance and parsed-length checkpoints are retained. Locale keyword conversion is implemented separately. */
import replacements from "../data/misc/uloc_tag.json";
import { U_FAILURE } from "./unicode/utypes";
const LANG = 1,
  EXTL = 2,
  SCRT = 4,
  REGN = 8,
  VART = 16,
  EXTS = 32,
  EXTV = 64,
  PRIV = 128;
/** Original linked variant node. */
interface VariantListEntry {
  variant: number;
  next: VariantListEntry | null;
}
/** Original linked extension node. */
interface ExtensionListEntry {
  key: number;
  value: number | null;
  next: ExtensionListEntry | null;
}
/** Original parser owner; null scalar offsets mean the native shared EMPTY string, while extlang null means absent. Native allocator/ABI/lifetime behavior is not simulated. */
export interface ULanguageTag {
  buf: number[];
  language: number | null;
  extlang: [number | null, number | null, number | null];
  script: number | null;
  region: number | null;
  variants: VariantListEntry | null;
  extensions: ExtensionListEntry | null;
  privateuse: number | null;
  legacy: number | null;
}
/** Original ASCII lower mapping. @param c - Narrow byte. @returns Lower byte. */
function lower(c: number): number {
  return c >= 65 && c <= 90 ? c + 32 : c;
}
/** Original ASCII upper mapping. @param c - Narrow byte. @returns Upper byte. */
function upper(c: number): number {
  return c >= 97 && c <= 122 ? c - 32 : c;
}
/** Original strlen over a narrow input. @param s - Narrow string. @returns First NUL or full length. */
function length(s: string): number {
  const i = s.indexOf("\0");
  return i < 0 ? s.length : i;
}
/** Original predicate argument width/negative-length handling. @param s - Narrow span. @param len - Native int32 count. @returns Selected span. */
function span(s: string, len: number): string {
  len |= 0;
  return s.slice(0, len < 0 ? length(s) : len);
}
/** Original ASCII-alpha test over a complete selected span. @param s - Narrow span. @returns All letters. */
function alpha(s: string): boolean {
  for (let i = 0; i < s.length; ++i) {
    const c = lower(s.charCodeAt(i));
    if (c < 97 || c > 122) return false;
  }
  return true;
}
/** Original ASCII-digit test. @param s - Narrow span. @returns All digits. */
function numeric(s: string): boolean {
  for (let i = 0; i < s.length; ++i) {
    const c = s.charCodeAt(i);
    if (c < 48 || c > 57) return false;
  }
  return true;
}
/** Original alpha-numeric test. @param s - Narrow span. @returns All alphanumeric. */
function alnum(s: string): boolean {
  for (let i = 0; i < s.length; ++i) {
    const c = lower(s.charCodeAt(i));
    if ((c < 97 || c > 122) && (c < 48 || c > 57)) return false;
  }
  return true;
}
/** Original length-limited alphanumeric predicate. @param s - Selected span. @param min - Minimum. @param max - Maximum. @returns Accepted. */
function limited(s: string, min: number, max: number): boolean {
  return s.length >= min && s.length <= max && alnum(s);
}
/** Source language predicate deliberately accepts four letters. @param s - Narrow source. @param len - Explicit or negative C length. @returns Accepted. */
export function ultag_isLanguageSubtag(s: string, len: number): boolean {
  const value = span(s, len);
  return value.length >= 2 && value.length <= 8 && alpha(value);
}
/** Original four-letter script. @param s - Narrow source. @param len - Count. @returns Accepted. */
export function ultag_isScriptSubtag(s: string, len: number): boolean {
  const value = span(s, len);
  return value.length === 4 && alpha(value);
}
/** Original two-letter or three-digit region. @param s - Narrow source. @param len - Count. @returns Accepted. */
export function ultag_isRegionSubtag(s: string, len: number): boolean {
  const value = span(s, len);
  return (value.length === 2 && alpha(value)) || (value.length === 3 && numeric(value));
}
/** Original variant syntax. @param s - Selected span. @returns Accepted. */
function _isVariantSubtag(s: string): boolean {
  return limited(s, 5, 8) || (s.length === 4 && numeric(s[0] as string) && alnum(s.slice(1)));
}
/** Original non-x singleton syntax. @param s - Selected span. @returns Accepted. */
function _isExtensionSingleton(s: string): boolean {
  return s.length === 1 && alnum(s) && lower(s.charCodeAt(0)) !== 120;
}
/** Reads a bounded original byte span without a host argument-count limit. @param buf - Actual buffer. @param start - Inclusive pointer. @param end - Exclusive pointer. @returns Narrow bytes. */
function readSpan(buf: readonly number[], start: number, end: number): string {
  let value = "";
  for (let i = start; i < end; ++i) value += String.fromCharCode(buf[i] as number);
  return value;
}
/** Reads a source C-string pointer within the one actual owned buffer. @param tag - Owner. @param pos - Native pointer projection/null EMPTY. @returns Counted narrow string. */
function read(tag: ULanguageTag, pos: number | null): string {
  if (pos === null) return "";
  let value = "";
  for (let i = pos; tag.buf[i] !== 0; ++i) value += String.fromCharCode(tag.buf[i] as number);
  return value;
}
/** Original in-place T_CString casing. @param tag - Owner. @param pos - Pointer. @param toUpper - Case selection. @returns Nothing. */
function changeCase(tag: ULanguageTag, pos: number, toUpper: boolean): void {
  for (let i = pos; tag.buf[i] !== 0; ++i)
    tag.buf[i] = (toUpper ? upper : lower)(tag.buf[i] as number);
}
/** Original initial scalar/list owner state. @param buf - Transferred buffer. @returns Owner. */
function _initializeULanguageTag(buf: number[]): ULanguageTag {
  return {
    buf,
    language: null,
    extlang: [null, null, null],
    script: null,
    region: null,
    variants: null,
    extensions: null,
    privateuse: null,
    legacy: null,
  };
}
/** Original variant-list insertion preserves order and rejects duplicates. @param tag - Owner. @param node - Transferred node. @returns Inserted. */
function _addVariantToList(tag: ULanguageTag, node: VariantListEntry): boolean {
  if (tag.variants === null) {
    tag.variants = node;
    return true;
  }
  let cur = tag.variants;
  for (;;) {
    if (read(tag, node.variant) === read(tag, cur.variant)) return false;
    if (cur.next === null) {
      cur.next = node;
      return true;
    }
    cur = cur.next;
  }
}
/** Original localeToBCP=false ordered extension insertion; the reverse-conversion comparator is not substituted. @param tag - Owner. @param node - Transferred node. @returns Inserted. */
function _addExtensionToList(tag: ULanguageTag, node: ExtensionListEntry): boolean {
  let prev: ExtensionListEntry | null = null,
    cur = tag.extensions;
  while (cur !== null) {
    const a = read(tag, node.key),
      b = read(tag, cur.key);
    if (a < b) break;
    if (a === b) return false;
    prev = cur;
    cur = cur.next;
  }
  node.next = cur;
  if (prev === null) tag.extensions = node;
  else prev.next = node;
  return true;
}
/** Original case-insensitive C prefix comparison, including early NUL. @param pattern - Source table key. @param buf - Actual source buffer. @param count - Compared bytes. @returns Equal prefix. */
function equalPrefix(pattern: string, buf: readonly number[], count: number): boolean {
  for (let i = 0; i < count; ++i) {
    const a = lower(pattern.charCodeAt(i) || 0),
      b = lower(buf[i] ?? 0);
    if (a !== b) return false;
    if (a === 0) return true;
  }
  return true;
}
/** Original complete parser. Explicit tagLen copies the source span, then parsing observes embedded NUL; negative tagLen uses strlen. Partial syntactic failure returns a partial owner and success, not a replacement error. @param input - Narrow-byte input with native readable-span precondition. @param tagLen - Signed32 explicit or negative C length. @param parsedLen - Optional consumed-input output. @param status - Sticky ICU status. @returns Owned result or null on preexisting error. */
export function ultag_parse(
  input: string,
  tagLen: number,
  parsedLen: [number] | null,
  status: [number],
): ULanguageTag | null {
  if (U_FAILURE(status[0])) return null;
  if (parsedLen !== null) parsedLen[0] = 0;
  tagLen |= 0;
  if (tagLen < 0) tagLen = length(input);
  let buf: number[] = [];
  for (let i = 0; i < tagLen; ++i) buf.push(input.charCodeAt(i));
  buf.push(0);
  const tag = _initializeULanguageTag(buf);
  if (tagLen < 2) return tag;
  let legacyLen = 0,
    delta = 0;
  for (let i = 0; i < replacements.tables.LEGACY.length; i += 2) {
    const key = replacements.tables.LEGACY[i] as string,
      value = replacements.tables.LEGACY[i + 1] as string;
    if (tagLen < key.length || (tagLen > key.length && buf[key.length] !== 45)) continue;
    if (equalPrefix(key, buf, key.length)) {
      legacyLen = key.length;
      const old = tagLen,
        newLength = value.length + tagLen - key.length;
      if (tagLen < newLength) tagLen = newLength;
      delta = key.length - value.length;
      const text = value + (key.length !== tagLen ? input.slice(key.length, old) : "");
      buf = [];
      for (let j = 0; j < text.length; ++j) buf.push(text.charCodeAt(j));
      buf.push(0);
      tag.buf = buf;
      break;
    }
  }
  if (legacyLen === 0) {
    for (let i = 0; i < replacements.tables.REDUNDANT.length; i += 2) {
      const key = replacements.tables.REDUNDANT[i] as string,
        value = replacements.tables.REDUNDANT[i + 1] as string;
      if (equalPrefix(key, buf, key.length) && (buf[key.length] === 0 || buf[key.length] === 45)) {
        const suffix = buf[key.length] === 45 ? buf.slice(key.length, tagLen + 1) : [0];
        buf = [];
        for (let j = 0; j < value.length; ++j) buf.push(value.charCodeAt(j));
        for (const c of suffix) buf.push(c);
        tag.buf = buf;
        delta = key.length - value.length;
        break;
      }
    }
  }
  let next = LANG | PRIV,
    pNext: number | null = 0,
    lastGood = 0,
    extlangIdx = 0,
    extension: ExtensionListEntry | null = null,
    extStart: number | null = null,
    extEnd: number | null = null,
    privateuseVar = false;
  while (pNext !== null) {
    let subtag: number = pNext,
      sep = subtag;
    while (buf[sep] !== 0 && buf[sep] !== 45) ++sep;
    pNext = buf[sep] === 0 ? null : sep + 1;
    const value = readSpan(buf, subtag, sep);
    if ((next & LANG) !== 0 && ultag_isLanguageSubtag(value, value.length)) {
      buf[sep] = 0;
      changeCase(tag, subtag, false);
      tag.language = subtag;
      lastGood = sep;
      next = SCRT | REGN | VART | EXTS | PRIV;
      if (value.length <= 3) next |= EXTL;
      continue;
    }
    if ((next & EXTL) !== 0 && value.length === 3 && alpha(value)) {
      buf[sep] = 0;
      changeCase(tag, subtag, false);
      tag.extlang[extlangIdx++] = subtag;
      lastGood = sep;
      next = SCRT | REGN | VART | EXTS | PRIV;
      if (extlangIdx < 3) next |= EXTL;
      continue;
    }
    if ((next & SCRT) !== 0 && ultag_isScriptSubtag(value, value.length)) {
      buf[sep] = 0;
      buf[subtag] = upper(buf[subtag] as number);
      for (let i = subtag + 1; buf[i] !== 0; ++i) buf[i] = lower(buf[i] as number);
      tag.script = subtag;
      lastGood = sep;
      next = REGN | VART | EXTS | PRIV;
      continue;
    }
    if ((next & REGN) !== 0 && ultag_isRegionSubtag(value, value.length)) {
      buf[sep] = 0;
      changeCase(tag, subtag, true);
      tag.region = subtag;
      lastGood = sep;
      next = VART | EXTS | PRIV;
      continue;
    }
    if (
      (next & VART) !== 0 &&
      (_isVariantSubtag(value) || (privateuseVar && limited(value, 1, 8)))
    ) {
      buf[sep] = 0;
      changeCase(tag, subtag, true);
      if (!_addVariantToList(tag, { variant: subtag, next: null })) break;
      lastGood = sep;
      next = VART | EXTS | PRIV;
      continue;
    }
    if ((next & EXTS) !== 0 && _isExtensionSingleton(value)) {
      if (extension !== null) {
        if (extStart === null || extEnd === null) {
          extension = null;
          break;
        }
        buf[extEnd] = 0;
        changeCase(tag, extStart, false);
        extension.value = extStart;
        if (_addExtensionToList(tag, extension)) {
          // eslint-disable-next-line no-useless-assignment -- Preserve the source LocalPointer::orphan ownership transfer before adopting the next extension.
          extension = null;
          lastGood = extEnd;
        } else {
          extension = null;
          break;
        }
      }
      buf[sep] = 0;
      changeCase(tag, subtag, false);
      extension = { key: subtag, value: null, next: null };
      extStart = extEnd = null;
      next = EXTV;
      continue;
    }
    if ((next & EXTV) !== 0 && limited(value, 2, 8)) {
      if (extStart === null) extStart = subtag;
      extEnd = sep;
      next = EXTS | EXTV | PRIV;
      continue;
    }
    if ((next & PRIV) !== 0) {
      if (lower(buf[subtag] as number) === 120 && value.length === 1) {
        if (extension !== null) {
          if (extStart === null || extEnd === null) {
            extension = null;
            break;
          }
          buf[extEnd] = 0;
          changeCase(tag, extStart, false);
          extension.value = extStart;
          if (_addExtensionToList(tag, extension)) {
            extension = null;
            lastGood = extEnd;
          } else {
            extension = null;
            break;
          }
        }
        if (pNext === null) break;
        const privateStart: number = pNext;
        while (pNext !== null) {
          subtag = pNext;
          sep = subtag;
          while (buf[sep] !== 0 && buf[sep] !== 45) ++sep;
          pNext = buf[sep] === 0 ? null : sep + 1;
          const privateValue = readSpan(buf, subtag, sep);
          // Original strncmp checks the lower-case prefix, not whole-subtag equality or case folding.
          if (privateValue.startsWith("lvariant")) {
            buf[sep] = 0;
            next = VART;
            privateuseVar = true;
            break;
          } else if (limited(privateValue, 1, 8)) lastGood = sep;
          else break;
        }
        if (next === VART) continue;
        if (lastGood - privateStart > 0) {
          buf[lastGood] = 0;
          changeCase(tag, privateStart, false);
          tag.privateuse = privateStart;
        }
        break;
      }
      break;
    }
    break;
  }
  if (extension !== null && extStart !== null && extEnd !== null) {
    buf[extEnd] = 0;
    changeCase(tag, extStart, false);
    extension.value = extStart;
    if (_addExtensionToList(tag, extension)) lastGood = extEnd;
  }
  if (parsedLen !== null) parsedLen[0] = (lastGood + delta) | 0;
  return tag;
}
/** Original scalar getter. @param tag - Owner. @returns Narrow language. */
export function ultag_getLanguage(tag: ULanguageTag): string {
  return read(tag, tag.language);
}
/** Original extlang pointer query. @param tag - Owner. @param idx - Signed32 index. @returns Borrowed view or null. */
export function ultag_getExtlang(tag: ULanguageTag, idx: number): string | null {
  idx |= 0;
  return idx >= 0 && idx < 3 && tag.extlang[idx] !== null
    ? read(tag, tag.extlang[idx] as number)
    : null;
}
/** Original three-slot count. @param tag - Owner. @returns Count. */
export function ultag_getExtlangSize(tag: ULanguageTag): number {
  let size = 0;
  for (const pos of tag.extlang) if (pos !== null) ++size;
  return size;
}
/** Original script getter. @param tag - Owner. @returns Narrow script. */
export function ultag_getScript(tag: ULanguageTag): string {
  return read(tag, tag.script);
}
/** Original region getter. @param tag - Owner. @returns Narrow region. */
export function ultag_getRegion(tag: ULanguageTag): string {
  return read(tag, tag.region);
}
/** Original variant list traversal. @param tag - Owner. @param idx - Signed32 index. @returns Borrowed view or null. */
export function ultag_getVariant(tag: ULanguageTag, idx: number): string | null {
  idx |= 0;
  let i = 0,
    cur = tag.variants;
  while (cur !== null) {
    if (i === idx) return read(tag, cur.variant);
    cur = cur.next;
    ++i;
  }
  return null;
}
/** Original variant list size. @param tag - Owner. @returns Count. */
export function ultag_getVariantsSize(tag: ULanguageTag): number {
  let n = 0,
    cur = tag.variants;
  while (cur !== null) {
    ++n;
    cur = cur.next;
  }
  return n;
}
/** Original extension key traversal. @param tag - Owner. @param idx - Signed32 index. @returns Borrowed key or null. */
export function ultag_getExtensionKey(tag: ULanguageTag, idx: number): string | null {
  idx |= 0;
  let i = 0,
    cur = tag.extensions;
  while (cur !== null) {
    if (i === idx) return read(tag, cur.key);
    cur = cur.next;
    ++i;
  }
  return null;
}
/** Original extension value traversal. @param tag - Owner. @param idx - Signed32 index. @returns Borrowed value or null. */
export function ultag_getExtensionValue(tag: ULanguageTag, idx: number): string | null {
  idx |= 0;
  let i = 0,
    cur = tag.extensions;
  while (cur !== null) {
    if (i === idx) return read(tag, cur.value);
    cur = cur.next;
    ++i;
  }
  return null;
}
/** Original extension list size. @param tag - Owner. @returns Count. */
export function ultag_getExtensionsSize(tag: ULanguageTag): number {
  let n = 0,
    cur = tag.extensions;
  while (cur !== null) {
    ++n;
    cur = cur.next;
  }
  return n;
}
/** Original private-use getter. @param tag - Owner. @returns Narrow private use. */
export function ultag_getPrivateUse(tag: ULanguageTag): string {
  return read(tag, tag.privateuse);
}
/** Original separator-list validator, including empty/trailing-separator rejection. @param test - Subtag predicate. @param s - Narrow source. @param len - Native length. @returns Accepted complete list. */
function _isSepListOf(test: (s: string) => boolean, s: string, len: number): boolean {
  const value = span(s, len);
  let start: number | null = null;
  for (let i = 0; i < value.length; ++i) {
    if (value[i] === "-") {
      if (start === null || !test(value.slice(start, i))) return false;
      start = null;
    } else if (start === null) start = i;
  }
  return start !== null && test(value.slice(start));
}
/** Original variant-list syntax. @param s - Narrow source. @param len - Native length. @returns Accepted. */
export function ultag_isVariantSubtags(s: string, len: number): boolean {
  return _isSepListOf(_isVariantSubtag, s, len);
}
/** Original extension-value syntax. @param s - Narrow source. @param len - Native length. @returns Accepted. */
export function ultag_isExtensionSubtags(s: string, len: number): boolean {
  return _isSepListOf(
    /** Applies the original extension subtag length. @param value - Subtag. @returns Accepted. */ (
      value,
    ) => limited(value, 2, 8),
    s,
    len,
  );
}
/** Original private-use value syntax. @param s - Narrow source. @param len - Native length. @returns Accepted. */
export function ultag_isPrivateuseValueSubtags(s: string, len: number): boolean {
  return _isSepListOf(
    /** Applies original private-use bounds. @param value - Subtag. @returns Accepted. */ (value) =>
      limited(value, 1, 8),
    s,
    len,
  );
}
/** Original Unicode locale attribute syntax. @param s - Narrow source. @param len - Native length. @returns Accepted. */
export function ultag_isUnicodeLocaleAttribute(s: string, len: number): boolean {
  return limited(span(s, len), 3, 8);
}
/** Original Unicode attribute-list syntax. @param s - Narrow source. @param len - Native length. @returns Accepted. */
export function ultag_isUnicodeLocaleAttributes(s: string, len: number): boolean {
  return _isSepListOf(
    /** Applies original Unicode attribute bounds. @param value - Subtag. @returns Accepted. */ (
      value,
    ) => limited(value, 3, 8),
    s,
    len,
  );
}
/** Original Unicode key syntax is alphanumeric followed by alpha. @param s - Narrow source. @param len - Native length. @returns Accepted. */
export function ultag_isUnicodeLocaleKey(s: string, len: number): boolean {
  const value = span(s, len);
  return value.length === 2 && alnum(value[0] as string) && alpha(value[1] as string);
}
/** Original Unicode type-list syntax. @param s - Narrow source. @param len - Native length. @returns Accepted. */
export function ultag_isUnicodeLocaleType(s: string, len: number): boolean {
  return _isSepListOf(
    /** Applies original Unicode type bounds. @param value - Subtag. @returns Accepted. */ (
      value,
    ) => limited(value, 3, 8),
    s,
    len,
  );
}

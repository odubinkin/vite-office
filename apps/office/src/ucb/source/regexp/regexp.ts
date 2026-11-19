/** @fileoverview Original UCB restricted Regexp grammar, ASCII-only case matching and canonical serialization; retains source translation syntax without host regular expressions or URL normalization. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import {
  isAsciiAlpha,
  isAsciiAlphanumeric,
  compareIgnoreAsciiCase,
} from "../../../sal/inc/rtl/character";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
/** Original Regexp kind ordinal values. */
export enum Kind {
  /** Original literal prefix. */ KIND_PREFIX,
  /** Original exact authority followed by a delimiter or end. */ KIND_AUTHORITY,
  /** Original wildcard domain plus an optional literal infix. */ KIND_DOMAIN,
}
/** Original pointer-to-pointer cursor into a counted UTF16 view. */
type Cursor = [number];
/** Original ASCII-folded literal scan commits its cursor only on success. @param cursor - In/out pointer. @param text - Counted input. @param value - Literal string. @returns Match. */
function matchStringIgnoreCase(
  cursor: Cursor,
  text: Uint16Array,
  value: OUStringConstReference,
): boolean {
  let p = cursor[0];
  if (text.length - p < value.getLength()) return false;
  for (let q = 0; q < value.getLength(); ++q)
    if (compareIgnoreAsciiCase(text[p++] as number, value.getStr()[q] as number) !== 0)
      return false;
  cursor[0] = p;
  return true;
}
/** Original RFC2396 scheme predicate with optional required trailing colon. @param value - Counted string. @param colon - Requires final colon. @returns Match. */
function isScheme(value: OUStringConstReference, colon: boolean): boolean {
  const text = value.getStr(),
    end = value.getLength();
  let p = 0;
  if (p !== end && isAsciiAlpha(text[p] as number))
    for (++p; ;) {
      if (p === end) return !colon;
      const c = text[p++] as number;
      if (!(isAsciiAlphanumeric(c) || c === 43 || c === 45 || c === 46))
        return colon && c === 58 && p === end;
    }
  return false;
}
/** Original compiler-known ASCII literal append. @param output - Native buffer. @param text - Known source literal. @returns Nothing. */
function ascii(output: OUStringBuffer, text: string): void {
  output.append(
    Uint8Array.from(
      text + "\0",
      /** Source literal byte. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
    ),
  );
}
/** Original quoted string serialization escapes only quote and backslash. @param output - Native buffer. @param value - Counted value. @returns Nothing. */
function appendStringLiteral(output: OUStringBuffer, value: OUStringConstReference): void {
  output.append(Uint16Array.of(34));
  for (let index = 0; index < value.getLength(); ++index) {
    const c = value.getStr()[index] as number;
    if (c === 34 || c === 92) output.append(Uint16Array.of(92));
    output.append(Uint16Array.of(c));
  }
  output.append(Uint16Array.of(34));
}
/** Original exact ASCII syntax scan commits its cursor only on success. @param cursor - In/out pointer. @param text - Counted input. @param syntax - Known ASCII syntax. @returns Match. */
function matchString(cursor: Cursor, text: Uint16Array, syntax: string): boolean {
  let p = cursor[0];
  if (text.length - p < syntax.length) return false;
  for (let q = 0; q < syntax.length; ++q) if (text[p++] !== syntax.charCodeAt(q)) return false;
  cursor[0] = p;
  return true;
}
/** Original quoted scanner preserves pointer and destination on failure. @param cursor - In/out pointer. @param text - Counted input. @param value - Output native string. @returns Scan success. */
function scanStringLiteral(cursor: Cursor, text: Uint16Array, value: OUString): boolean {
  let p = cursor[0];
  if (p === text.length || text[p++] !== 34) return false;
  const output = new OUStringBuffer();
  try {
    for (;;) {
      if (p === text.length) return false;
      let c = text[p++] as number;
      if (c === 34) break;
      if (c === 92) {
        if (p === text.length) return false;
        c = text[p++] as number;
        if (c !== 34 && c !== 92) return false;
      }
      output.append(Uint16Array.of(c));
    }
    const result = output.makeStringAndClear();
    try {
      value.assign(result);
    } finally {
      result.dispose();
    }
    cursor[0] = p;
    return true;
  } finally {
    output.dispose();
  }
}
/** Original complete restricted Regexp value. Its native string data is VM-managed through existing RTL owners. */
export class Regexp {
  private readonly m_aPrefix: OUString;
  private readonly m_aInfix: OUString;
  private readonly m_aReversePrefix: OUString;
  /** Original kind and native string value initialization. @param m_eKind - Original kind. @param prefix - Literal prefix. @param m_bEmptyDomain - Allows zero domain units. @param infix - Literal domain suffix. @param m_bTranslation - Source serialization mode. @param reverse - Reverse prefix. @returns Value. */
  private constructor(
    private readonly m_eKind: Kind,
    prefix: OUStringConstReference,
    private readonly m_bEmptyDomain: boolean,
    infix: OUStringConstReference,
    private readonly m_bTranslation: boolean,
    reverse: OUStringConstReference,
  ) {
    this.m_aPrefix = new OUString(prefix);
    this.m_aInfix = new OUString(infix);
    this.m_aReversePrefix = new OUString(reverse);
  }
  /** Original implicit memberwise copy constructor. @returns Owned copy. */
  copy(): Regexp {
    return new Regexp(
      this.m_eKind,
      this.m_aPrefix,
      this.m_bEmptyDomain,
      this.m_aInfix,
      this.m_bTranslation,
      this.m_aReversePrefix,
    );
  }
  /** Original reverse string-member destruction. @returns Nothing. */
  dispose(): void {
    this.m_aReversePrefix.dispose();
    this.m_aInfix.dispose();
    this.m_aPrefix.dispose();
  }
  /** Original equality deliberately excludes empty-domain and translation fields. @param other - Compared value. @returns Source equality. */
  equals(other: Regexp): boolean {
    return (
      this.m_eKind === other.m_eKind &&
      this.m_aPrefix.equals(other.m_aPrefix) &&
      this.m_aInfix.equals(other.m_aInfix)
    );
  }
  /** Original empty-prefix default predicate ignores translation fields. @returns Default status. */
  isDefault(): boolean {
    return this.m_eKind === Kind.KIND_PREFIX && this.m_aPrefix.isEmpty();
  }
  /** Original kind accessor. @returns Kind. */
  getKind(): Kind {
    return this.m_eKind;
  }
  /** Original source matching over counted UTF16, folding ASCII alone. @param value - Borrowed candidate. @returns Match. */
  matches(value: OUStringConstReference): boolean {
    const text = value.getStr().subarray(0, value.getLength()),
      p: Cursor = [0];
    let matched = false;
    if (matchStringIgnoreCase(p, text, this.m_aPrefix))
      switch (this.m_eKind) {
        case Kind.KIND_PREFIX:
          matched = true;
          break;
        case Kind.KIND_AUTHORITY:
          matched =
            p[0] === text.length || text[p[0]] === 47 || text[p[0]] === 63 || text[p[0]] === 35;
          break;
        case Kind.KIND_DOMAIN:
          if (!this.m_bEmptyDomain) {
            if (p[0] === text.length || text[p[0]] === 47 || text[p[0]] === 63 || text[p[0]] === 35)
              break;
            ++p[0];
          }
          for (;;) {
            const q: Cursor = [p[0]];
            if (
              matchStringIgnoreCase(q, text, this.m_aInfix) &&
              (q[0] === text.length || text[q[0]] === 47 || text[q[0]] === 63 || text[q[0]] === 35)
            ) {
              matched = true;
              break;
            }
            if (p[0] === text.length) break;
            const c = text[p[0]++];
            if (c === 47 || c === 63 || c === 35) break;
          }
          break;
      }
    return matched;
  }
  /** Original canonical serialization, including the source asymmetric translation grammar. @returns Owned native pattern string. */
  getRegexp(): OUString {
    if (!this.m_bTranslation && this.m_eKind === Kind.KIND_PREFIX && isScheme(this.m_aPrefix, true))
      return this.m_aPrefix.copy(0, this.m_aPrefix.getLength() - 1);
    const output = new OUStringBuffer();
    try {
      if (!this.m_aPrefix.isEmpty()) appendStringLiteral(output, this.m_aPrefix);
      if (this.m_bTranslation)
        switch (this.m_eKind) {
          case Kind.KIND_PREFIX:
            ascii(output, "(.*)");
            break;
          case Kind.KIND_AUTHORITY:
            ascii(output, "(([/?#].*)?)");
            break;
          case Kind.KIND_DOMAIN:
            ascii(output, "([^/?#]");
            output.append(Uint16Array.of(this.m_bEmptyDomain ? 42 : 43));
            if (!this.m_aInfix.isEmpty()) appendStringLiteral(output, this.m_aInfix);
            ascii(output, "([/?#].*)?)");
            break;
        }
      else
        switch (this.m_eKind) {
          case Kind.KIND_PREFIX:
            ascii(output, ".*");
            break;
          case Kind.KIND_AUTHORITY:
            ascii(output, "([/?#].*)?");
            break;
          case Kind.KIND_DOMAIN:
            ascii(output, "[^/?#]");
            output.append(Uint16Array.of(this.m_bEmptyDomain ? 42 : 43));
            if (!this.m_aInfix.isEmpty()) appendStringLiteral(output, this.m_aInfix);
            ascii(output, "([/?#].*)?");
            break;
        }
      if (this.m_bTranslation) {
        ascii(output, "->");
        if (!this.m_aReversePrefix.isEmpty()) appendStringLiteral(output, this.m_aReversePrefix);
        ascii(output, "\\1");
      }
      return output.makeStringAndClear();
    } finally {
      output.dispose();
    }
  }
  /** Original source grammar parser, with atomic failed scans and exact final pointer guards. @param pattern - Borrowed counted pattern. @returns Owned Regexp or source IllegalArgumentException. */
  static parse(pattern: OUStringConstReference): Regexp {
    const prefix = new OUString(),
      infix = new OUString(),
      reverse = new OUString();
    try {
      if (isScheme(pattern, false)) {
        prefix.assign(pattern);
        prefix.append(Uint16Array.of(58));
        return new Regexp(Kind.KIND_PREFIX, prefix, false, infix, false, reverse);
      }
      const text = pattern.getStr().subarray(0, pattern.getLength()),
        p: Cursor = [0];
      scanStringLiteral(p, text, prefix);
      if (p[0] === text.length) throw new IllegalArgumentException();
      if (matchString(p, text, ".*")) {
        if (p[0] !== text.length) throw new IllegalArgumentException();
        return new Regexp(Kind.KIND_PREFIX, prefix, false, infix, false, reverse);
      } else if (matchString(p, text, "(.*)->")) {
        scanStringLiteral(p, text, reverse);
        if (!matchString(p, text, "\\1") || p[0] !== text.length)
          throw new IllegalArgumentException();
        return new Regexp(Kind.KIND_PREFIX, prefix, false, infix, true, reverse);
      } else if (matchString(p, text, "([/?#].*)?")) {
        if (p[0] !== text.length) throw new IllegalArgumentException();
        return new Regexp(Kind.KIND_AUTHORITY, prefix, false, infix, false, reverse);
      } else if (matchString(p, text, "(([/?#].*)?)->")) {
        if (!(
          scanStringLiteral(p, text, reverse) &&
          matchString(p, text, "\\1") &&
          p[0] === text.length
        ))
          throw new IllegalArgumentException();
        return new Regexp(Kind.KIND_AUTHORITY, prefix, false, infix, true, reverse);
      } else {
        let open = false;
        if (p[0] !== text.length && text[p[0]] === 40) {
          ++p[0];
          open = true;
        }
        if (!matchString(p, text, "[^/?#]")) throw new IllegalArgumentException();
        if (p[0] === text.length || (text[p[0]] !== 42 && text[p[0]] !== 43))
          throw new IllegalArgumentException();
        const empty = text[p[0]++] === 42;
        scanStringLiteral(p, text, infix);
        if (!matchString(p, text, "([/?#].*)?")) throw new IllegalArgumentException();
        if (
          open &&
          !(
            matchString(p, text, ")->") &&
            scanStringLiteral(p, text, reverse) &&
            matchString(p, text, "\\1")
          )
        )
          throw new IllegalArgumentException();
        if (p[0] !== text.length) throw new IllegalArgumentException();
        return new Regexp(Kind.KIND_DOMAIN, prefix, empty, infix, open, reverse);
      }
    } finally {
      reverse.dispose();
      infix.dispose();
      prefix.dispose();
    }
  }
}

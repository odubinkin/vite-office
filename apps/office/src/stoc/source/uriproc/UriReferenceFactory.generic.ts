/** @fileoverview Original UriReferenceFactory.cxx generic URI component and lexical helpers over native RTL/UNO owners. Full factory/service orchestration is separate; no string-facing parser or provider substitutes for it. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XUriReference } from "../../../udkapi/com/sun/star/uri/XUriReference";
import { UriReference as Value } from "./UriReference";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  isAsciiAlpha,
  isAsciiDigit,
  isAsciiHexDigit,
  compareIgnoreAsciiCase,
} from "../../../sal/inc/rtl/character";
/** Original anonymous generic URI adapter owns the actual stoc::uriproc value. */
export class UriReference
  extends WeakImplHelper.specialize(XUriReference)
  implements XUriReference
{
  private readonly m_base: Value;
  /** Original constructor copies borrowed scheme/path into by-value helper parameters. @param scheme - Native scheme. @param hasAuthority - Presence flag. @param authority - Native authority. @param path - Native path. @param hasQuery - Presence flag. @param query - Native query. @returns Actual component. */
  constructor(
    scheme: OUStringConstReference,
    hasAuthority: boolean,
    authority: OUStringConstReference,
    path: OUStringConstReference,
    hasQuery: boolean,
    query: OUStringConstReference,
  ) {
    super();
    const schemeValue = new OUString(scheme),
      pathValue = new OUString(path);
    try {
      this.m_base = new Value(schemeValue, hasAuthority, authority, pathValue, hasQuery, query);
    } finally {
      pathValue.dispose();
      schemeValue.dispose();
    }
  }
  /** Original helper member destruction precedes base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_base.dispose();
    super.destroy();
  }
  /** Original forwarding method. @returns Original declared result. */
  getUriReference(): OUString {
    return this.m_base.getUriReference();
  }
  /** Original forwarding method. @returns Original declared result. */
  isAbsolute(): boolean {
    return this.m_base.isAbsolute();
  }
  /** Original forwarding method. @returns Original declared result. */
  getScheme(): OUString {
    return new OUString(this.m_base.getScheme());
  }
  /** Original forwarding method. @returns Original declared result. */
  getSchemeSpecificPart(): OUString {
    return this.m_base.getSchemeSpecificPart();
  }
  /** Original forwarding method. @returns Original declared result. */
  isHierarchical(): boolean {
    return this.m_base.isHierarchical();
  }
  /** Original forwarding method. @returns Original declared result. */
  hasAuthority(): boolean {
    return this.m_base.hasAuthority();
  }
  /** Original forwarding method. @returns Original declared result. */
  getAuthority(): OUString {
    return new OUString(this.m_base.getAuthority());
  }
  /** Original forwarding method. @returns Original declared result. */
  getPath(): OUString {
    return this.m_base.getPath();
  }
  /** Original forwarding method. @returns Original declared result. */
  hasRelativePath(): boolean {
    return this.m_base.hasRelativePath();
  }
  /** Original forwarding method. @returns Original declared result. */
  getPathSegmentCount(): number {
    return this.m_base.getPathSegmentCount();
  }
  /** Original forwarding method. @param index - Original declared argument. @returns Original declared result. */
  getPathSegment(index: number): OUString {
    return this.m_base.getPathSegment(index);
  }
  /** Original forwarding method. @returns Original declared result. */
  hasQuery(): boolean {
    return this.m_base.hasQuery();
  }
  /** Original forwarding method. @returns Original declared result. */
  getQuery(): OUString {
    return new OUString(this.m_base.getQuery());
  }
  /** Original forwarding method. @returns Original declared result. */
  hasFragment(): boolean {
    return this.m_base.hasFragment();
  }
  /** Original forwarding method. @returns Original declared result. */
  getFragment(): OUString {
    return this.m_base.getFragment();
  }
  /** Original forwarding method. @param fragment - Original declared argument. @returns Original declared result. */
  setFragment(fragment: OUStringConstReference): void {
    this.m_base.setFragment(fragment);
  }
  /** Original forwarding method. @returns Original declared result. */
  clearFragment(): void {
    this.m_base.clearFragment();
  }
}
/** Original UTF16 lexical scheme parser; reserved punctuation stops the search. @param value - Native borrowed view. @returns Colon offset or -1. */
export function parseScheme(value: Uint16Array): number {
  if (value.length >= 2 && isAsciiAlpha(value[0] as number)) {
    for (let i = 0; i < value.length; ++i) {
      const c = value[i] as number;
      if (c === 58) return i;
      if (!isAsciiAlpha(c) && !isAsciiDigit(c) && c !== 43 && c !== 45 && c !== 46) break;
    }
  }
  return -1;
}
/** Original equality ignores ASCII case only inside matching well-formed percent escapes. @param first - Native left view. @param second - Native right view. @returns Equality. */
export function equalIgnoreEscapeCase(first: Uint16Array, second: Uint16Array): boolean {
  if (first.length !== second.length) return false;
  for (let i = 0; i < first.length;) {
    if (
      first[i] === 37 &&
      second[i] === 37 &&
      first.length - i > 2 &&
      isAsciiHexDigit(first[i + 1] as number) &&
      isAsciiHexDigit(first[i + 2] as number) &&
      isAsciiHexDigit(second[i + 1] as number) &&
      isAsciiHexDigit(second[i + 2] as number) &&
      compareIgnoreAsciiCase(first[i + 1] as number, second[i + 1] as number) === 0 &&
      compareIgnoreAsciiCase(first[i + 2] as number, second[i + 2] as number) === 0
    )
      i += 3;
    else if (first[i] !== second[i]) return false;
    else ++i;
  }
  return true;
}
/** Original parseGeneric component construction from source native scheme/view operands. @param scheme - Native scheme. @param specific - Borrowed scheme-specific UTF16 view. @returns Acquired genuine generic URI component. */
export function parseGeneric(
  scheme: OUStringConstReference,
  specific: Uint16Array,
): Reference<XUriReference> {
  const length = specific.length,
    authority = new OUString();
  let i = 0,
    hasAuthority = false;
  try {
    if (length - i >= 2 && specific[i] === 47 && specific[i + 1] === 47) {
      i += 2;
      const start = i;
      while (i < length && specific[i] !== 47 && specific[i] !== 63) ++i;
      hasAuthority = true;
      const text = new OUString(specific.subarray(start, i), i - start);
      try {
        authority.assign(text);
      } finally {
        text.dispose();
      }
    }
    const start = i,
      question = specific.indexOf(63, i);
    i = question < 0 ? length : question;
    const path = new OUString(specific.subarray(start, i), i - start),
      query = new OUString();
    try {
      let hasQuery = false;
      if (i !== length) {
        hasQuery = true;
        const text = new OUString(specific.subarray(i + 1), length - i - 1);
        try {
          query.assign(text);
        } finally {
          text.dispose();
        }
      }
      return new Reference<XUriReference>(
        new UriReference(scheme, hasAuthority, authority, path, hasQuery, query),
      );
    } finally {
      query.dispose();
      path.dispose();
    }
  } finally {
    authority.dispose();
  }
}

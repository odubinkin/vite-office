/** @fileoverview Complete original UriReference.hxx/cxx value owner over actual RTL strings. Original mutex scopes are single-realm synchronous execution here; physical native/shared-memory synchronization remains unqualified. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
/** Original generic URI value; this is neither a UNO component nor a parser/service substitute. */
export class UriReference {
  readonly m_path: OUString;
  private readonly m_scheme: OUString;
  private readonly m_authority: OUString;
  private readonly m_query: OUString;
  private readonly m_fragment: OUString;
  private readonly m_hasAuthority: boolean;
  private readonly m_hasQuery: boolean;
  private m_hasFragment = false;
  /** Original by-value scheme/path operands move into their members; callers perform lvalue copies at their call boundary. @param scheme - Actual by-value scheme owner. @param hasAuthority - Explicit authority presence. @param authority - Borrowed authority. @param path - Actual by-value path owner. @param hasQuery - Explicit query presence. @param query - Borrowed query. @returns Actual native value. */
  constructor(
    scheme: OUString,
    hasAuthority: boolean,
    authority: OUStringConstReference,
    path: OUString,
    hasQuery: boolean,
    query: OUStringConstReference,
  ) {
    this.m_path = OUString.move(path);
    this.m_scheme = OUString.move(scheme);
    this.m_authority = new OUString(authority);
    this.m_query = new OUString(query);
    this.m_fragment = new OUString();
    this.m_hasAuthority = hasAuthority;
    this.m_hasQuery = hasQuery;
    if (!authority.isEmpty() && !hasAuthority)
      throw new Error("assert(authority.isEmpty() || hasAuthority)");
    if (!query.isEmpty() && !hasQuery) throw new Error("assert(query.isEmpty() || hasQuery)");
  }
  /** Original complete serialization without normalization of escaped units or empty components. @returns Acquired native text. */
  getUriReference(): OUString {
    const buffer = new OUStringBuffer(128);
    try {
      if (!this.m_scheme.isEmpty()) {
        buffer.append(new StringConcat(this.m_scheme, new Uint8Array([58, 0])));
      }
      this.appendSchemeSpecificPart(buffer);
      if (this.m_hasFragment) {
        buffer.append(new StringConcat(new Uint8Array([35, 0]), this.m_fragment));
      }
      return buffer.makeStringAndClear();
    } finally {
      buffer.dispose();
    }
  }
  /** Original scheme-presence predicate. @returns Whether absolute. */
  isAbsolute(): boolean {
    return !this.m_scheme.isEmpty();
  }
  /** Original const-reference member return. @returns Borrowed scheme owner. */
  getScheme(): OUStringConstReference {
    return this.m_scheme;
  }
  /** Original scheme-specific serialization excludes both scheme and fragment. @returns Owned native text. */
  getSchemeSpecificPart(): OUString {
    const buffer = new OUStringBuffer();
    try {
      this.appendSchemeSpecificPart(buffer);
      return buffer.makeStringAndClear();
    } finally {
      buffer.dispose();
    }
  }
  /** Original generic URI hierarchy predicate. @returns Whether hierarchical. */
  isHierarchical(): boolean {
    return this.m_scheme.isEmpty() || this.m_hasAuthority || this.m_path.getStr()[0] === 47;
  }
  /** Original authority presence independent of empty text. @returns Presence. */
  hasAuthority(): boolean {
    return this.m_hasAuthority;
  }
  /** Original const-reference authority return. @returns Borrowed authority. */
  getAuthority(): OUStringConstReference {
    return this.m_authority;
  }
  /** Original value-returning path read. @returns Acquired native path. */
  getPath(): OUString {
    return new OUString(this.m_path);
  }
  /** Original authority/path predicate. @returns Whether the path is relative. */
  hasRelativePath(): boolean {
    return !this.m_hasAuthority && (this.m_path.isEmpty() || this.m_path.getStr()[0] !== 47);
  }
  /** Original slash counting includes empty intermediate and terminal segments. @returns Original sal_Int32 count. */
  getPathSegmentCount(): number {
    if (this.m_path.isEmpty()) return 0;
    let count = this.m_path.getStr()[0] === 47 ? 0 : 1;
    for (let i = 0; ; ++i) {
      i = this.m_path.indexOf(47, i);
      if (i < 0) break;
      ++count;
    }
    return count;
  }
  /** Original path-segment selection returns empty for an out-of-range or negative index. @param index - Native signed32 index. @returns Owned undecoded segment. */
  getPathSegment(index: number): OUString {
    if (!this.m_path.isEmpty() && index >= 0) {
      for (let i = this.m_path.getStr()[0] === 47 ? 1 : 0; ; ++i) {
        if (index-- === 0) {
          const end = this.m_path.indexOf(47, i);
          return end < 0 ? this.m_path.copy(i) : this.m_path.copy(i, end - i);
        }
        i = this.m_path.indexOf(47, i);
        if (i < 0) break;
      }
    }
    return new OUString();
  }
  /** Original query presence independent of empty text. @returns Presence. */
  hasQuery(): boolean {
    return this.m_hasQuery;
  }
  /** Original const-reference query return. @returns Borrowed query. */
  getQuery(): OUStringConstReference {
    return this.m_query;
  }
  /** Original fragment presence independent of empty text. @returns Presence. */
  hasFragment(): boolean {
    return this.m_hasFragment;
  }
  /** Original value-returning fragment read. @returns Acquired fragment. */
  getFragment(): OUString {
    return new OUString(this.m_fragment);
  }
  /** Original flag-before-string assignment. @param fragment - Actual source string. @returns Nothing. */
  setFragment(fragment: OUStringConstReference): void {
    this.m_hasFragment = true;
    this.m_fragment.assign(fragment);
  }
  /** Original presence reset and native member clear. @returns Nothing. */
  clearFragment(): void {
    this.m_hasFragment = false;
    this.m_fragment.clear();
  }
  /** Original shared scheme-specific formatter. @param buffer - Actual native output buffer. @returns Nothing. */
  private appendSchemeSpecificPart(buffer: OUStringBuffer): void {
    if (this.m_hasAuthority) {
      buffer.append(new Uint8Array([47, 47, 0]));
      buffer.append(this.m_authority);
    }
    buffer.append(this.m_path);
    if (this.m_hasQuery) {
      buffer.append(new Uint8Array([63, 0]));
      buffer.append(this.m_query);
    }
  }
  /** Original implicit reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.m_fragment.dispose();
    this.m_query.dispose();
    this.m_authority.dispose();
    this.m_scheme.dispose();
    this.m_path.dispose();
  }
}

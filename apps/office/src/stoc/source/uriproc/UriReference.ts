/** @fileoverview Consumed generic stoc::uriproc::UriReference value operations; immutable UTF16 fields bind the XML/URI boundary, without UNO service registration. */

/** Original generic URI components distinguish absent and empty query, authority and fragment. */
export class UriReference {
  private fragment: string | null = null;
  /** Retains parsed components verbatim. @param scheme - Scheme. @param authority - Authority or absent. @param path - Path. @param query - Query or absent. @returns URI. */
  constructor(
    private readonly scheme: string,
    private readonly authority: string | null,
    private readonly path: string,
    private readonly query: string | null,
  ) {}
  /** Original absolute predicate. @returns Has scheme. */ isAbsolute(): boolean {
    return this.scheme !== "";
  }
  /** Original scheme. @returns Scheme. */ getScheme(): string {
    return this.scheme;
  }
  /** Original authority predicate. @returns Presence. */ hasAuthority(): boolean {
    return this.authority !== null;
  }
  /** Original authority value. @returns Authority. */ getAuthority(): string {
    return this.authority ?? "";
  }
  /** Original path. @returns Path. */ getPath(): string {
    return this.path;
  }
  /** Original relative-path predicate includes empty paths without authority. @returns Relative. */ hasRelativePath(): boolean {
    return this.authority === null && (this.path === "" || !this.path.startsWith("/"));
  }
  /** Original query predicate. @returns Presence. */ hasQuery(): boolean {
    return this.query !== null;
  }
  /** Original query. @returns Query. */ getQuery(): string {
    return this.query ?? "";
  }
  /** Original fragment predicate. @returns Presence. */ hasFragment(): boolean {
    return this.fragment !== null;
  }
  /** Original fragment. @returns Fragment. */ getFragment(): string {
    return this.fragment ?? "";
  }
  /** Original fragment setter. @param value - Fragment. @returns Nothing. */ setFragment(
    value: string,
  ): void {
    this.fragment = value;
  }
  /** Original lexical serialization. @returns URI. */ getUriReference(): string {
    return (
      (this.scheme === "" ? "" : this.scheme + ":") +
      (this.authority === null ? "" : "//" + this.authority) +
      this.path +
      (this.query === null ? "" : "?" + this.query) +
      (this.fragment === null ? "" : "#" + this.fragment)
    );
  }
}

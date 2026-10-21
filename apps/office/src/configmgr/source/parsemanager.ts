/** @fileoverview Original ParseManager namespace registration, pull-event dispatch and pending-begin resume contract. Native URL mapping uses the existing XmlReader loaded-byte browser boundary. */
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { assert } from "../../sal/inc/cassert";
import { XmlReader, Result } from "../../xmlreader/inc/xmlreader";
import { Span } from "../../xmlreader/inc/span";
import type { Parser } from "./parser";
/** Original registered OOR namespace index. */
export const NAMESPACE_OOR = 1;
/** Original registered XML Schema namespace index. */
export const NAMESPACE_XS = 2;
/** Original registered XML Schema Instance namespace index. */
export const NAMESPACE_XSI = 3;
/** Actual original driver; parsing-time logging and OS file mapping are not emulated. */
export class ParseManager {
  public static readonly NAMESPACE_OOR = NAMESPACE_OOR;
  public static readonly NAMESPACE_XS = NAMESPACE_XS;
  public static readonly NAMESPACE_XSI = NAMESPACE_XSI;
  private readonly reader_: XmlReader;
  private readonly parser_: Parser;
  private readonly itemData_ = new Span();
  private readonly itemNamespaceId_: [number] = [-1];
  /** Original URL/parser ownership plus the explicit host-loaded bytes already required by actual XmlReader. @param url - Native file URL value. @param parser - Actual event owner. @param bytes - Loaded private input binding. @returns Driver. */
  constructor(url: OUStringConstReference, parser: Parser | null, bytes: Uint8Array) {
    assert(parser !== null, "parser.is()");
    this.reader_ = new XmlReader(url, bytes);
    this.parser_ = parser;
    for (const [iri, expected] of [
      ["http://openoffice.org/2001/registry", NAMESPACE_OOR],
      ["http://www.w3.org/2001/XMLSchema", NAMESPACE_XS],
      ["http://www.w3.org/2001/XMLSchema-instance", NAMESPACE_XSI],
    ] as const) {
      const value = new TextEncoder().encode(iri);
      const id = this.reader_.registerNamespaceIri(new Span(value, value.length));
      assert(id === expected, "id == namespace");
    }
  }
  /** Original loop retains itemData on a false/throwing start, then replays the same Begin on the next call. @param existingDependencies - Borrowed caller set. @returns Whether reader reached Done. */
  public parse(existingDependencies: ReadonlySet<OUStringConstReference> | null): boolean {
    for (;;) {
      const result = this.itemData_.is()
        ? Result.Begin
        : this.reader_.nextItem(this.parser_.getTextMode(), this.itemData_, this.itemNamespaceId_);
      switch (result) {
        case Result.Begin:
          if (
            !this.parser_.startElement(
              this.reader_,
              this.itemNamespaceId_[0],
              this.itemData_,
              existingDependencies,
            )
          )
            return false;
          break;
        case Result.End:
          this.parser_.endElement(this.reader_);
          break;
        case Result.Text:
          this.parser_.characters(this.itemData_);
          break;
        case Result.Done:
          return true;
      }
      this.itemData_.clear();
    }
  }
}

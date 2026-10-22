/** @fileoverview Calc asynchronous filter boundary; production browser sessions inject the worker implementation. */
import type { XmlPackage } from "../../../../svl/source/misc/storage";
import { readOdsDocument, writeOdsDocument, writeOdsXml, type OdsImportOptions } from "./xmlwrap";
import type { ScDocument } from "../../../inc/document";
/** Asynchronous document I/O independent of shell state and platform transport. */
export interface OdsFilterService {
  Import(input: Uint8Array | XmlPackage, options?: OdsImportOptions): Promise<ScDocument>;
  Export(document: ScDocument, xml: true, isCurrent?: () => boolean): Promise<XmlPackage>;
  Export(document: ScDocument, xml?: false, isCurrent?: () => boolean): Promise<Uint8Array>;
  Cancel(): void;
  Close(): void;
}
/** Deterministic non-browser filter for native callers and unit tests. */
class InlineOdsFilterService implements OdsFilterService {
  /** Imports native cells inline. @param input - ODS or raw XML. @param options - Controls. @returns Model. */
  Import(input: Uint8Array | XmlPackage, options?: OdsImportOptions): Promise<ScDocument> {
    return readOdsDocument(input, options);
  }
  /** Exports primary XML. @param document - Model. @param xml - XML selection. @returns Streams. */
  Export(document: ScDocument, xml: true): Promise<XmlPackage>;
  /** Exports external ODS. @param document - Model. @param xml - Package selection. @returns Bytes. */
  Export(document: ScDocument, xml?: false): Promise<Uint8Array>;
  /** Executes deterministic native filtering inline. @param document - Model. @param xml - Output kind. @returns XML or bytes. */
  async Export(document: ScDocument, xml = false): Promise<XmlPackage | Uint8Array> {
    return xml ? writeOdsXml(document) : writeOdsDocument(document);
  }
  /** Inline work has no pending transport. @returns Nothing. */
  Cancel(): void {}
  /** Inline filter owns no process resources. @returns Nothing. */
  Close(): void {}
}
/** Creates an inline adapter for non-browser native callers. @returns Filter. */
export function createInlineOdsFilterService(): OdsFilterService {
  return new InlineOdsFilterService();
}

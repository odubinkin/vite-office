/** @fileoverview Native Calc import context declaration specialized as an independent ESM base;owner references are type-only to preserve C++ initialization independence. */
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import type { ScXMLImport } from "./xmlimprt";
/** Native Calc import context bound to its real importer;unknown content is not flattened into supported cells. */
export class ScXMLImportContext extends SvXMLImportContext {
  /** Binds the owning native import. @param owner - Owner. @returns Context. */
  constructor(private readonly scImport: ScXMLImport) {
    super();
  }
  /** Borrows the owner. @returns Importer. */
  GetScImport(): ScXMLImport {
    return this.scImport;
  }
  /** An otherwise empty native context cannot stand in for an unimplemented semantic child. @param element - Token. @param attributes - Attributes. @returns Never. */
  override createFastChildContext(
    element: import("../../../../xmloff/source/core/xmltoken").XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    void element;
    void attributes;
    throw new Error("ODS context content is not implemented");
  }
  /** Unknown content has no implemented Calc semantic owner. @param namespaceURI - URI. @param localName - Name. @param attributes - Attributes. @returns Never. */
  override createUnknownChildContext(
    namespaceURI: string,
    localName: string,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    void namespaceURI;
    void attributes;
    throw new Error(`ODS content is not implemented: ${localName}`);
  }
}

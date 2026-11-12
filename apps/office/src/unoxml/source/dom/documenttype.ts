/** @fileoverview Original CDocumentType, including the source name-pointer/identifier-length reads and unimplemented internal subset. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { XDocumentType } from "../../../offapi/com/sun/star/xml/dom/XDocumentType";
import type { XNamedNodeMap } from "../../../offapi/com/sun/star/xml/dom/XNamedNodeMap";
import { NodeType } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { CNode, xmlString } from "./node";
import { CEntitiesMap } from "./entitiesmap";
import { CNotationsMap } from "./notationsmap";
import type { CDocument } from "./document";
/** Original DTD owner. */
export class CDocumentType
  extends ImplInheritanceHelper.specialize(CNode, XDocumentType)
  implements XDocumentType
{
  private readonly m_aDtdPtr: number;
  /** Original native constructor. @param document - Actual document. @param node - Native DTD. @returns Actual native owner. */
  constructor(document: CDocument, node: number) {
    super(document, NodeType.DOCUMENT_TYPE_NODE, node);
    this.m_aDtdPtr = node;
  }
  /** Original source map exists for every nonnull DTD, despite its source-unimplemented bodies. @returns Entity map. */
  getEntities(): Reference<XNamedNodeMap> {
    return this.m_aDtdPtr ? new Reference(new CEntitiesMap()) : new Reference<XNamedNodeMap>();
  }
  /** Original source map creation. @returns Notation map. */
  getNotations(): Reference<XNamedNodeMap> {
    return this.m_aDtdPtr ? new Reference(new CNotationsMap()) : new Reference<XNamedNodeMap>();
  }
  /** Original #i113683# source default. @returns Empty subset. */ getInternalSubset(): OUString {
    return new OUString();
  }
  /** Original DTD name read. @returns Owned name. */ getName(): OUString {
    return this.m_aDtdPtr
      ? xmlString(getLibXml2()._office_node_name_get(this.m_aDtdPtr))
      : new OUString();
  }
  /** Original source reads name bytes with the ExternalID length. Undefined native null/overread inputs are not certified. @returns Source-derived identifier. */
  getPublicId(): OUString {
    const m = getLibXml2();
    return this.m_aDtdPtr
      ? xmlString(
          m._office_node_name_get(this.m_aDtdPtr),
          m._xmlStrlen(m._office_dtd_publicId_get(this.m_aDtdPtr)),
        )
      : new OUString();
  }
  /** Original source reads name bytes with the SystemID length. @returns Source-derived identifier. */
  getSystemId(): OUString {
    const m = getLibXml2();
    return this.m_aDtdPtr
      ? xmlString(
          m._office_node_name_get(this.m_aDtdPtr),
          m._xmlStrlen(m._office_dtd_systemId_get(this.m_aDtdPtr)),
        )
      : new OUString();
  }
  /** Original name forwarding. @returns Owned name. */ override getNodeName(): OUString {
    return this.getName();
  }
}

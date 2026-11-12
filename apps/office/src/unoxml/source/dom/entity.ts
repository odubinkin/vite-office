/** @fileoverview Original CEntity node contract over the actual native allocation. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { XEntity } from "../../../offapi/com/sun/star/xml/dom/XEntity";
import { NodeType as N } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { CNode, xmlString } from "./node";
import type { CDocument } from "./document";
/** Original concrete node. */
export class CEntity extends ImplInheritanceHelper.specialize(CNode, XEntity) implements XEntity {
  /** Original native constructor. @param document - Actual document. @param node - Native pointer. @returns Actual native owner. */ constructor(
    document: CDocument,
    node: number,
  ) {
    super(document, N.ENTITY_NODE, node);
  }
  /** Original native node-name read. @returns Owned name. */ override getNodeName(): OUString {
    return this.m_aNodePtr
      ? xmlString(getLibXml2()._office_node_name_get(this.m_aNodePtr))
      : new OUString();
  }
  /** Original allowed child types. @param type - Proposed child. @param replaced - Ignored replaced type. @returns Admission. */ protected override IsChildTypeAllowed(
    type: N,
    replaced: N | null,
  ): boolean {
    void replaced;
    return [
      N.ELEMENT_NODE,
      N.PROCESSING_INSTRUCTION_NODE,
      N.COMMENT_NODE,
      N.TEXT_NODE,
      N.CDATA_SECTION_NODE,
      N.ENTITY_REFERENCE_NODE,
    ].includes(type);
  }
  /** Original #i113683# source default. @returns Empty notation name. */ getNotationName(): OUString {
    return new OUString();
  }
  /** Original external identifier. @returns Owned identifier. */ getPublicId(): OUString {
    return this.m_aNodePtr
      ? xmlString(getLibXml2()._office_entity_publicId_get(this.m_aNodePtr))
      : new OUString();
  }
  /** Original system identifier. @returns Owned identifier. */ getSystemId(): OUString {
    return this.m_aNodePtr
      ? xmlString(getLibXml2()._office_entity_systemId_get(this.m_aNodePtr))
      : new OUString();
  }
}
